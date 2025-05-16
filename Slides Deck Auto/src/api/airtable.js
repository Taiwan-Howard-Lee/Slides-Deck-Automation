// ========================
// Data Processing Functions
// ========================

function airtable_transfer(baseId, tableName) {
  // Retrieve the API key as a string instead of an array.
  const API_KEY = PropertiesService.getScriptProperties().getProperty("AIRTABLE_API");

  // Log API key existence (not the actual key for security)
  if (!API_KEY) {
    Logger.log("ERROR: AIRTABLE_API key is not set in script properties!");
  } else {
    Logger.log("AIRTABLE_API key is set in script properties");
  }

  var filterFormula = encodeURIComponent("{[4.4] Ready for preso} = 1");
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
  Logger.log("Airtable API URL: " + url);

  var responseCode = response.getResponseCode();
  if (responseCode !== 200) {
    var errorText = response.getContentText();
    Logger.log("Error retrieving Airtable records. Status code: " + responseCode);
    Logger.log("Error details: " + errorText);

    // Try to parse the error response
    try {
      var errorJson = JSON.parse(errorText);
      if (errorJson.error) {
        Logger.log("Error type: " + errorJson.error.type);
        Logger.log("Error message: " + errorJson.error.message);
      }
    } catch (e) {
      Logger.log("Could not parse error response as JSON");
    }

    return;
  }

  var responseText = response.getContentText();
  Logger.log("Airtable API Response: " + responseText.substring(0, 200) + "...");

  var json = JSON.parse(responseText);
  var records = json.records || [];
  Logger.log("Retrieved " + records.length + " records.");

  // If no records found, log the filter formula for debugging
  if (records.length === 0) {
    Logger.log("No records found with filter: {[4.4] Ready for preso} = 1");
    Logger.log("Check if this field exists in your Airtable and has records with value = 1");
  }

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
        // Check if this is an attachment field (has url or expiring_download_url property)
        if (value[0].hasOwnProperty('url') || value[0].hasOwnProperty('expiring_download_url')) {
          // This is an image/attachment field - mark it with a special prefix
          value = "__IMAGE_FIELD__" + (value[0].expiring_download_url || value[0].url || "");
        } else {
          // For other array types, just use the first value
          value = value[0].toString();
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