// Grain House -> Google Sheets sales database
// Deploy this script as a Web app: Execute as Me, access Anyone.
const SHEET_NAME = 'Sales';
const HEADERS = ['Sale ID','Date','Customer','Product ID','Product','Category','Quantity','Unit Price (INR)','Total (INR)','Status','Received At'];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  return sheet;
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents || '{}');
  const sheet = getSheet_();
  const ids = sheet.getLastRow() > 1 ? sheet.getRange(2,1,sheet.getLastRow()-1,1).getValues().flat() : [];
  if (!ids.includes(data.id)) {
    sheet.appendRow([data.id || '', data.date || '', data.customer || '', data.productId || '', data.productName || '', data.category || '', Number(data.quantity || 0), Number(data.unitPrice || 0), Number(data.total || 0), data.status || 'Paid', new Date()]);
  }
  return json_({ok:true});
}

function doGet() {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return json_({ok:true, sales:[]});
  const sales = values.slice(1).filter(r => r[0]).map(r => ({id:String(r[0]),date:formatDate_(r[1]),customer:String(r[2]||''),productId:String(r[3]||''),productName:String(r[4]||''),category:String(r[5]||''),quantity:Number(r[6]||0),unitPrice:Number(r[7]||0),total:Number(r[8]||0),status:String(r[9]||'Paid')}));
  return json_({ok:true,sales:sales});
}

function seedDemoSales() {
  const sheet = getSheet_();
  if (sheet.getLastRow() > 1) return 'Sheet already contains data.';
  const rows = [
    ['s1','2026-06-03','Demo Customer 01','p1','Milano Leather Corner Sofa','Sofas',1,245000,245000,'Paid',new Date()],
    ['s2','2026-06-08','Demo Customer 02','p3','Oslo Lounge Armchair','Chairs',2,52000,104000,'Paid',new Date()],
    ['s3','2026-06-15','Demo Customer 03','p2','Nordic Oak Dining Table','Tables',1,89000,89000,'Paid',new Date()],
    ['s4','2026-06-23','Demo Customer 04','p4','Haru Natural Wood Bed','Beds',1,158000,158000,'Paid',new Date()],
    ['s5','2026-07-02','Demo Customer 05','p5','Bergen 4-Door Wardrobe','Cabinets',1,112000,112000,'Paid',new Date()],
    ['s6','2026-07-11','Demo Customer 06','p3','Oslo Lounge Armchair','Chairs',3,52000,156000,'Paid',new Date()],
    ['s7','2026-07-19','Demo Customer 07','p6','Aalto Walnut TV Console','TV units',1,67000,67000,'Paid',new Date()],
    ['s8','2026-08-04','Demo Customer 08','p2','Nordic Oak Dining Table','Tables',2,89000,178000,'Paid',new Date()],
    ['s9','2026-08-12','Demo Customer 09','p1','Milano Leather Corner Sofa','Sofas',1,245000,245000,'Paid',new Date()],
    ['s10','2026-08-21','Demo Customer 10','p4','Haru Natural Wood Bed','Beds',2,158000,316000,'Paid',new Date()]
  ];
  sheet.getRange(2,1,rows.length,HEADERS.length).setValues(rows);
  return 'Demo sales added.';
}

function formatDate_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(value || '');
}
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
