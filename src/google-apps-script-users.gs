// Shukarwaar -> Google Sheets user authentication database
// Put this code in a separate Apps Script project from the sales script.
// Deploy this project as a Web app: Execute as Me, access Anyone.
// Use this deployment URL in the admin Users section.
const USERS_SHEET_NAME = 'Users';
const USER_HEADERS = ['ID','Name','Email','Password Hash','Provider','Status','Created At','Updated At','Phone','Address','Addresses'];
// Leave blank when this script is opened from Google Sheets extensions.
// For a standalone Apps Script project, set this to the spreadsheet ID.
const SPREADSHEET_ID = '';

function getSpreadsheet_() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('Set SPREADSHEET_ID to your Google Sheet ID before deploying this standalone script.');
  return spreadsheet;
}

function getUsersSheet_() {
  const spreadsheet = getSpreadsheet_();
  if (!spreadsheet) throw new Error('Set SPREADSHEET_ID before deploying this standalone script.');
  const sheet = spreadsheet.getSheetByName(USERS_SHEET_NAME) || spreadsheet.insertSheet(USERS_SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(USER_HEADERS);
  } else {
    const headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0].map(String);
    USER_HEADERS.forEach(header => {
      if (!headers.includes(header)) sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
    });
  }
  return sheet;
}

function getUserColumns_(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  return {
    id: headers.indexOf('ID'),
    name: headers.indexOf('Name'),
    email: headers.indexOf('Email'),
    password: headers.indexOf('Password Hash'),
    provider: headers.indexOf('Provider'),
    status: headers.indexOf('Status'),
    createdAt: headers.indexOf('Created At'),
    updatedAt: headers.indexOf('Updated At'),
    phone: headers.indexOf('Phone'),
    address: headers.indexOf('Address'),
    addresses: headers.indexOf('Addresses')
  };
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const sheet = getUsersSheet_();
    const columns = getUserColumns_(sheet);
    const values = sheet.getDataRange().getValues();
    const rows = values.slice(1);
    const email = String(data.email || '').trim().toLowerCase();
    const phone = String(data.phone || '').trim();
    const identifier = String(data.identifier || email || phone).trim().toLowerCase();
    const now = new Date();
    let index = rows.findIndex(row => String(row[columns.email] || '').toLowerCase() === identifier || String(row[columns.phone] || '').toLowerCase() === identifier);

  if (data.action === 'register') {
    if ((!email && !phone) || !data.password || !data.name) return json_({ok:false, error:'Name, email or phone, and password are required.'});
    if (index >= 0) return json_({ok:false, error:'An account with this email or phone already exists.'});
    const addresses = Array.isArray(data.addresses) ? data.addresses : (data.address ? [{ label: 'Home', value: String(data.address).trim() }] : []);
    const row = Array(USER_HEADERS.length).fill('');
    row[columns.id] = 'u-' + now.getTime();
    row[columns.name] = String(data.name).trim();
    row[columns.email] = email;
    row[columns.password] = hashPassword_(data.password);
    row[columns.provider] = 'email';
    row[columns.status] = 'active';
    row[columns.createdAt] = now;
    row[columns.updatedAt] = now;
    row[columns.phone] = phone;
    row[columns.address] = addresses[0]?.value || '';
    row[columns.addresses] = JSON.stringify(addresses);
    sheet.appendRow(row);
    return json_({ok:true, user:safeUser_(row, columns)});
  }

  if (data.action === 'googleLogin') {
    let profile;
    try {
      const response = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(data.credential));
      profile = JSON.parse(response.getContentText());
    } catch (error) {
      return json_({ok:false, error:'Google sign-in could not be verified.'});
    }
    if (!profile.email) return json_({ok:false, error:'Google did not return an email address.'});
    const googleEmail = String(profile.email).toLowerCase();
    index = rows.findIndex(row => String(row[columns.email] || '').toLowerCase() === googleEmail);
    if (index < 0) {
      const row = Array(USER_HEADERS.length).fill('');
      row[columns.id] = 'u-' + now.getTime();
      row[columns.name] = profile.name || googleEmail.split('@')[0];
      row[columns.email] = googleEmail;
      row[columns.provider] = 'google';
      row[columns.status] = 'active';
      row[columns.createdAt] = now;
      row[columns.updatedAt] = now;
      row[columns.addresses] = '[]';
      sheet.appendRow(row);
      return json_({ok:true, user:safeUser_(row, columns)});
    }
    if (String(rows[index][columns.status] || 'active') === 'blocked') return json_({ok:false, error:'This account is blocked.'});
    return json_({ok:true, user:safeUser_(rows[index], columns)});
  }

  if ((data.action === 'update' || data.action === 'delete') && data.id) {
    index = rows.findIndex(row => String(row[columns.id] || '') === String(data.id));
  }
  if (index < 0 && data.action !== 'list') return json_({ok:false, error:'Account not found.'});

  if (data.action === 'login') {
    if (String(rows[index][columns.status] || 'active') === 'blocked') return json_({ok:false, error:'This account is blocked.'});
    if (String(rows[index][columns.password] || '') !== hashPassword_(data.password || '')) return json_({ok:false, error:'Incorrect email or password.'});
    return json_({ok:true, user:safeUser_(rows[index], columns)});
  }
  if (data.action === 'list') return json_({ok:true, users:rows.filter(row => row[columns.id]).map(row => safeUser_(row, columns))});
  if (data.action === 'update') {
    const row = rows[index];
    while (row.length < sheet.getLastColumn()) row.push('');
    while (row.length < USER_HEADERS.length) row.push('');
    if (data.name !== undefined) row[columns.name] = String(data.name).trim();
    if (data.email !== undefined) {
      const nextEmail = String(data.email).trim().toLowerCase();
      const duplicate = rows.some((candidate, candidateIndex) => candidateIndex !== index && String(candidate[columns.email] || '').toLowerCase() === nextEmail);
      if (duplicate) return json_({ok:false, error:'Another account already uses this email.'});
      row[columns.email] = nextEmail;
    }
    if (data.phone !== undefined) {
      const nextPhone = String(data.phone).trim();
      const duplicate = nextPhone && rows.some((candidate, candidateIndex) => candidateIndex !== index && String(candidate[columns.phone] || '').trim() === nextPhone);
      if (duplicate) return json_({ok:false, error:'Another account already uses this phone number.'});
      row[columns.phone] = nextPhone;
    }
    if (data.addresses !== undefined) {
      const addresses = Array.isArray(data.addresses) ? data.addresses.filter(item => item && item.value).map(item => ({ label: String(item.label || 'Address'), value: String(item.value).trim() })) : [];
      row[columns.address] = addresses[0]?.value || '';
      row[columns.addresses] = JSON.stringify(addresses);
    } else if (data.address !== undefined) {
      row[columns.address] = String(data.address).trim();
      row[columns.addresses] = JSON.stringify(row[columns.address] ? [{ label: 'Home', value: row[columns.address] }] : []);
    }
    if (data.status === 'active' || data.status === 'blocked') row[columns.status] = data.status;
    if (data.password) row[columns.password] = hashPassword_(data.password);
    row[columns.updatedAt] = now;
    sheet.getRange(index + 2, 1, 1, sheet.getLastColumn()).setValues([row]);
    SpreadsheetApp.flush();
    return json_({ok:true, user:safeUser_(row, columns)});
  }
  if (data.action === 'delete') {
    sheet.deleteRow(index + 2);
    return json_({ok:true});
  }
    return json_({ok:false, error:'Unknown user action.'});
  } catch (error) {
    return json_({ok:false, error:error.message || 'Users Apps Script error.'});
  }
}

function doGet() {
  return json_({ok:true, service:'users'});
}

function safeUser_(row, columns) {
  columns = columns || { id:0, name:1, email:2, provider:4, status:5, createdAt:6, updatedAt:7, phone:8, address:9, addresses:10 };
  return {
    id:String(row[columns.id] || ''),
    name:String(row[columns.name] || ''),
    email:String(row[columns.email] || ''),
    phone:String(row[columns.phone] || ''),
    address:String(row[columns.address] || ''),
    addresses:parseAddresses_(row[columns.addresses], row[columns.address]),
    provider:String(row[columns.provider] || 'email'),
    status:String(row[columns.status] || 'active'),
    createdAt:String(row[columns.createdAt] || ''),
    updatedAt:String(row[columns.updatedAt] || '')
  };
}

function parseAddresses_(value, fallback) {
  try {
    const addresses = JSON.parse(String(value || '[]'));
    if (Array.isArray(addresses)) return addresses;
  } catch (error) {}
  return fallback ? [{ label: 'Home', value: String(fallback) }] : [];
}

function hashPassword_(password) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(password), Utilities.Charset.UTF_8));
}

function json_(object) {
  return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON);
}
