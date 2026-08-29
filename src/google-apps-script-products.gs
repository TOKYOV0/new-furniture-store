// Product feed for Shukarwaar storefront
// Deploy this as a separate Google Apps Script Web App.
// Execute as: Me
// Who has access: Anyone

const PRODUCT_SHEET_NAME = 'Products';
const PRODUCT_HEADERS = ['id', 'name', 'category', 'price', 'image', 'description'];

function getProductSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(PRODUCT_SHEET_NAME) || ss.insertSheet(PRODUCT_SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(PRODUCT_HEADERS);
  }

  return sheet;
}

function normalizeProductRow_(rawRow) {
  const row = rawRow || [];
  const product = {
    id: String(row[0] || ''),
    name: String(row[1] || ''),
    category: String(row[2] || 'Uncategorized'),
    price: Number(row[3] || 0),
    image: String(row[4] || ''),
    description: String(row[5] || '')
  };

  return product;
}

function doGet(e) {
  const type = (e && e.parameter && e.parameter.type) || 'products';

  if (type === 'products') {
    const sheet = getProductSheet_();
    const values = sheet.getDataRange().getValues();

    if (values.length <= 1) {
      return json_({ ok: true, products: [] });
    }

    const headers = values[0];
    const products = values.slice(1)
      .filter(row => row && row[0] && String(row[0]).trim())
      .map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[String(header).trim()] = row[index];
        });

        return {
          id: String(obj.id || ''),
          name: String(obj.name || ''),
          category: String(obj.category || 'Uncategorized'),
          price: Number(obj.price || 0),
          image: String(obj.image || ''),
          description: String(obj.description || '')
        };
      });

    return json_({ ok: true, products });
  }

  return json_({ ok: true, products: [] });
}

function doPost(e) {
  const sheet = getProductSheet_();
  const data = JSON.parse(e.postData.contents || '{}');

  const row = [
    data.id || '',
    data.name || '',
    data.category || 'Uncategorized',
    Number(data.price || 0),
    data.image || '',
    data.description || ''
  ];

  const existing = sheet.getDataRange().getValues();
  const foundIndex = existing.findIndex((value) => String(value[0] || '') === String(data.id || ''));

  if (foundIndex >= 0) {
    sheet.getRange(foundIndex + 1, 1, 1, PRODUCT_HEADERS.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  return json_({ ok: true, message: 'Product saved.' });
}

function seedDemoProducts_() {
  const sheet = getProductSheet_();
  if (sheet.getLastRow() > 1) return 'Products sheet already contains data.';

  const rows = [
    ['p1', 'Wooden Lounge Chair', 'Chairs', 15000, 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=1200&q=80', 'Comfortable lounge chair with a warm natural finish.'],
    ['p2', 'Oak Dining Table', 'Tables', 25000, 'https://images.unsplash.com/photo-1617104551722-3b2d51366400?w=1200&q=80', 'Minimal oak dining table made for family meals.'],
    ['p3', 'Walnut TV Console', 'TV units', 18000, 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1200&q=80', 'Simple walnut TV console with clean lines.']
  ];

  sheet.getRange(2, 1, rows.length, PRODUCT_HEADERS.length).setValues(rows);
  return 'Demo products added.';
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
