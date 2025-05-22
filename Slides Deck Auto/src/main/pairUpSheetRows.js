
function pairUpSheetRows() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("companies");
  if (!sheet) {
    throw new Error("Sheet 'companies' not found.");
  }
  var allValues = sheet.getDataRange().getValues();
  if (allValues.length < 2) {
    Logger.log("No data rows found to pair.");
    return;
  }
  var headers = allValues[0];
  var numHeaders = headers.length;
  var dataRows = allValues.slice(1);
  var newHeaders = headers.concat(headers.map(function(header) {
    return header + "2";
  }));
  var newData = [];
  for (var i = 0; i < dataRows.length; i += 2) {
    var row1 = dataRows[i];
    var row2 = (i + 1 < dataRows.length) ? dataRows[i + 1] : new Array(numHeaders).fill("");
    var combinedRow = row1.concat(row2);
    newData.push(combinedRow);
  }
  sheet.clearContents();
  sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
  if (newData.length > 0) {
    sheet.getRange(2, 1, newData.length, newHeaders.length).setValues(newData);
  }
  Logger.log("Done pairing rows dynamically. Wrote " + newData.length + " row(s) with " + newHeaders.length + " columns.");
}
