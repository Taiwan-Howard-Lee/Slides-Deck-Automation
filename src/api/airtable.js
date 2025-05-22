// ========================
// Data Processing Functions
// ========================

function airtable_transfer(baseId, tableName) {
  // Retrieve the API key as a string instead of an array.
  const API_KEY = PropertiesService.getScriptProperties().getProperty("AIRTABLE_API");

  var filterFormula = encodeURIComponent("{Ready for preso} = 1");
  var url = "https://api.airtable.com/v0/" + baseId + "/" + encodeURIComponent(tableName) + "?filterByFormula=" + filterFormula;
  var options = {
    method: "get",
    headers: {
      "Authorization": "Bearer " + API_KEY,
      "Content-Type": "application/json"
    },
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() !== 200) {
    Logger.log("Error retrieving Airtable records: " + response.getContentText());
    return;
  }
  
  var json = JSON.parse(response.getContentText());
  var records = json.records;
  Logger.log("Retrieved " + records.length + " records.");
  
  // Build a set of all header names from the records.
  var headersSet = new Set();
  records.forEach(function(record) {
    Object.keys(record.fields).forEach(function(key) {
      headersSet.add(key);
    });
  });
  var headers = Array.from(headersSet);
  headers.sort();
  
  // Prepare the rows array for writing to the sheet.
  var rows = [];
  rows.push(headers);
  records.forEach(function(record) {
    var row = [];
    headers.forEach(function(header) {
      var value = record.fields[header] || "";
      // Check if the field is an array (e.g., for attachments or linked records)
      if (Array.isArray(value) && value.length > 0) {
        if (header === "Screenshot" && value[0].expiring_download_url) {
          value = value[0].expiring_download_url;
        } else {
          value = value[0].url || "";
        }
      }
      row.push(value);
    });
    rows.push(row);
  });
  
  // Write rows to the "companies" sheet.
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetName = "companies";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }
  
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
  Logger.log("Data written to sheet successfully.");
}