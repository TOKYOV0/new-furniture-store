// Grain House -> Google Sheets sales database
// Deploy this script as a Web app: Execute as Me, access Anyone.
const SHEET_NAME = 'Sales';
const HEADERS = ['Sale ID','Order ID','User ID','Date','Customer','Email','Phone','Address','Address Details','Product ID','Product','Category','Quantity','Unit Price (INR)','Total (INR)','Status','AWB','Shipment ID','Courier','Tracking URL','Shipment Status','Received At'];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  else {
    const existing = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
    HEADERS.forEach(header => { if (!existing.includes(header)) sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header); });
  }
  return sheet;
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents || '{}');
  const sheet = getSheet_();
  if (data.action === 'updateShipment') {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
    const values = sheet.getDataRange().getValues();
    values.slice(1).forEach((row, index) => {
      const orderColumn = headers.indexOf('Order ID');
      if (orderColumn < 0 || String(row[orderColumn]) !== String(data.orderId)) return;
      const updates = {'AWB': data.awb, 'Shipment ID': data.shipmentId, 'Courier': data.courier, 'Tracking URL': data.trackingUrl, 'Shipment Status': data.shipmentStatus};
      Object.keys(updates).forEach(header => {
        const column = headers.indexOf(header);
        if (column >= 0 && updates[header] !== undefined) sheet.getRange(index + 2, column + 1).setValue(updates[header] || '');
      });
    });
    return json_({ok:true});
  }
  const ids = sheet.getLastRow() > 1 ? sheet.getRange(2,1,sheet.getLastRow()-1,1).getValues().flat() : [];
  if (!ids.includes(data.id)) {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
    const fields = {'Sale ID':data.id, 'Order ID':data.orderId || data.id, 'User ID':data.userId, 'Date':data.date, 'Customer':data.customer, 'Email':data.customerEmail, 'Phone':data.customerPhone, 'Address':data.address, 'Address Details':JSON.stringify(data.addressDetails || {}), 'Product ID':data.productId, 'Product':data.productName, 'Category':data.category, 'Quantity':Number(data.quantity || 0), 'Unit Price (INR)':Number(data.unitPrice || 0), 'Total (INR)':Number(data.total || 0), 'Status':data.status || 'Paid', 'AWB':data.awb, 'Shipment ID':data.shipmentId, 'Courier':data.courier, 'Tracking URL':data.trackingUrl, 'Shipment Status':data.shipmentStatus, 'Received At':new Date()};
    sheet.appendRow(headers.map(header => fields[header] === undefined ? '' : fields[header]));
  }
  return json_({ok:true});
}

function doGet() {
  const sheet = getSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return json_({ok:true, sales:[]});
  const headers = values[0].map(String);
  const cell = (row, name) => { const index = headers.indexOf(name); return index >= 0 ? row[index] : ''; };
  const sales = values.slice(1).filter(r => r[0]).map(r => ({id:String(cell(r,'Sale ID')),orderId:String(cell(r,'Order ID') || cell(r,'Sale ID')),userId:String(cell(r,'User ID')),date:formatDate_(cell(r,'Date')),customer:String(cell(r,'Customer')||''),customerEmail:String(cell(r,'Email')||''),customerPhone:String(cell(r,'Phone')||''),address:String(cell(r,'Address')||''),addressDetails:parseJson_(cell(r,'Address Details')),productId:String(cell(r,'Product ID')||''),productName:String(cell(r,'Product')||''),category:String(cell(r,'Category')||''),quantity:Number(cell(r,'Quantity')||0),unitPrice:Number(cell(r,'Unit Price (INR)')||0),total:Number(cell(r,'Total (INR)')||0),status:String(cell(r,'Status')||'Paid'),awb:String(cell(r,'AWB')||''),shipmentId:String(cell(r,'Shipment ID')||''),courier:String(cell(r,'Courier')||''),trackingUrl:String(cell(r,'Tracking URL')||''),shipmentStatus:String(cell(r,'Shipment Status')||'')}));
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
function parseJson_(value) { try { const parsed = JSON.parse(String(value || '{}')); return parsed && typeof parsed === 'object' ? parsed : {}; } catch (error) { return {}; } }
function json_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
