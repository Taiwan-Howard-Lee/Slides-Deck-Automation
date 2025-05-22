
function empty_sheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("companies");
  if (!sheet) throw new Error("Sheet 'companies' not found.");
  sheet.clear();
  Logger.log("Cleared the entire 'companies' sheet.");
}