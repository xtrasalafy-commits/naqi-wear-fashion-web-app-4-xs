/**
 * ============================================================
 * NAQI WEAR — Google Apps Script Web App (REST API)
 * ============================================================
 * Versi alternatif backend jika Anda ingin menjalankan NAQI WEAR
 * sepenuhnya di ekosistem Google (Sheets + Drive), tanpa server.
 *
 * CARA PAKAI:
 * 1. Buat Google Spreadsheet bernama "NAQI_WEARDATA" dengan tab:
 *    Users, Categories, Products, ProductVariants, ProductImages,
 *    Orders, OrderItems, Payments, Reviews, Wishlists, Coupons,
 *    Banners, Notifications, Articles.
 *    (Baris pertama setiap tab = nama kolom, sesuai skema di README.)
 * 2. Buat folder Google Drive: "NAQI_WEAR_ASSETS" (gambar produk)
 *    dan "NAQI_WEAR_DB" (cadangan JSON).
 * 3. Salin seluruh kode ini ke Extensions > Apps Script pada
 *    spreadsheet tersebut, ganti nilai SPREADSHEET_ID bila perlu.
 * 4. Deploy > New deployment > Web app:
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Salin URL Web App ke file konfigurasi frontend
 *    (.env: VITE_API_URL=...  atau src/config.js).
 *
 * Contoh pemanggilan dari React:
 *   GET  {URL}?action=products
 *   GET  {URL}?action=product&slug=gamis-aisyah-premium
 *   POST fetch(URL + "?action=order", { method:"POST", body: JSON.stringify(data) })
 * ============================================================
 */

var NAMA_FOLDER_ASSET = 'NAQI_WEAR_ASSETS';
var NAMA_FOLDER_DB = 'NAQI_WEAR_DB';

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';
  var hasil;
  switch (action) {
    case 'ping': hasil = { ok: true, nama: 'NAQI WEAR API' }; break;
    case 'categories': hasil = bacaSheet('Categories'); break;
    case 'products': hasil = bacaSheet('Products'); break;
    case 'product': hasil = detailProduk(e.parameter.slug); break;
    case 'banners': hasil = bacaSheet('Banners').filter(function (b) { return String(b.aktif).toLowerCase() === 'true'; }); break;
    case 'coupons': hasil = bacaSheet('Coupons').filter(function (c) { return String(c.aktif).toLowerCase() === 'true'; }); break;
    case 'articles': hasil = bacaSheet('Articles'); break;
    case 'reviews': hasil = bacaSheet('Reviews').filter(function (r) { return String(r.product_id) === e.parameter.product_id; }); break;
    default: hasil = { error: 'Aksi tidak dikenal.' };
  }
  return keluaran(hasil);
}

function doPost(e) {
  var action = e.parameter.action;
  var data = JSON.parse(e.postData.contents || '{}');
  var hasil;
  switch (action) {
    case 'register': hasil = tambahBaris('Users', data); break;
    case 'order': hasil = buatPesanan(data); break;
    case 'review': hasil = tambahBaris('Reviews', data); break;
    case 'wishlist': hasil = tambahBariAman('Wishlists', data); break;
    case 'backup': hasil = cadangkanDatabase(); break;
    default: hasil = { error: 'Aksi tidak dikenal.' };
  }
  return keluaran(hasil);
}

/* ---------- utilitas ---------- */

function keluaran(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function sheet( nama ) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName( nama );
  if (!sh) throw new Error('Sheet ' + nama + ' belum dibuat.');
  return sh;
}

function bacaSheet(nama) {
  var sh = sheet(nama);
  var nilai = sh.getDataRange().getValues();
  var header = nilai.shift();
  return nilai.map(function (baris) {
    var obj = {};
    header.forEach(function (kolom, i) { obj[kolom] = baris[i]; });
    return obj;
  });
}

function tambahBariAman(nama, data) {
  data.created_at = new Date().toISOString();
  return tambahBaris(nama, data);
}

function tambahBaris(nama, data) {
  var sh = sheet(nama);
  var header = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0];
  if (!data.id) data.id = Utilities.getUuid();
  var baris = header.map(function (kolom) { return data[kolom] !== undefined ? data[kolom] : ''; });
  sh.appendRow(baris);
  return { ok: true, id: data.id };
}

function detailProduk(slug) {
  var produk = bacaSheet('Products').filter(function (p) { return p.slug === slug; })[0];
  if (!produk) return { error: 'Produk tidak ditemukan.' };
  return {
    produk: produk,
    varian: bacaSheet('ProductVariants').filter(function (v) { return String(v.product_id) === String(produk.id); }),
    gambar: bacaSheet('ProductImages').filter(function (g) { return String(g.product_id) === String(produk.id); })
  };
}

function buatPesanan(data) {
  var nomor = 'NQW-' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyMMdd-') + Math.floor(100 + Math.random() * 900);
  data.nomor_pesanan = nomor;
  tambahBariAman('Orders', data);
  (data.items || []).forEach(function (item) {
    item.order_id = nomor;
    tambahBariAman('OrderItems', item);
  });
  return { ok: true, nomor_pesanan: nomor };
}

/**
 * Mengunggah gambar ke folder NAQI_WEAR_ASSETS dan mengembalikan
 * URL langsung berformat https://drive.google.com/uc?export=view&id=FILE_ID
 */
function unggahGambar(base64, namaFile) {
  var folder = cariAtauBuatFolder(NAMA_FOLDER_ASSET);
  var blob = Utilities.newBlob(Utilities.base64Decode(base64), 'image/jpeg', namaFile);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://drive.google.com/uc?export=view&id=' + file.getId();
}

function cariAtauBuatFolder(nama) {
  var it = DriveApp.getFoldersByName(nama);
  return it.hasNext() ? it.next() : DriveApp.createFolder(nama);
}

/** Cadangkan seluruh spreadsheet sebagai JSON ke folder NAQI_WEAR_DB. */
function cadangkanDatabase() {
  var folder = cariAtauBuatFolder(NAMA_FOLDER_DB);
  var data = {};
  ['Users', 'Categories', 'Products', 'ProductVariants', 'ProductImages', 'Orders', 'OrderItems',
   'Payments', 'Reviews', 'Wishlists', 'Coupons', 'Banners', 'Notifications', 'Articles']
    .forEach(function (nama) {
      try { data[nama] = bacaSheet(nama); } catch (err) { data[nama] = []; }
    });
  var namaFile = 'NAQI_BACKUP_' + Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMMdd_HHmm') + '.json';
  folder.createFile(namaFile, JSON.stringify(data), 'application/json');
  return { ok: true, file: namaFile };
}
