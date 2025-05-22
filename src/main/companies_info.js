
function companies_info() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("companies");
  if (!sheet) {
    throw new Error("Sheet 'companies' not found.");
  }
  
  const allValues = sheet.getDataRange().getValues();
  if (allValues.length < 2) {
    Logger.log("No data rows found in the sheet.");
    return [];
  }
  
  const headers = allValues[0].map(header => String(header).trim());
  const companies = [];
  
  for (let i = 1; i < allValues.length; i++) {
    const row = allValues[i];
    const company = {};
    for (let j = 0; j < headers.length; j++) {
      const headerName = headers[j];
      const cellValue = row[j];
      if (headerName.toLowerCase().includes("date founded")) {
        if (cellValue instanceof Date) {
          company[headerName] = cellValue.getFullYear().toString();
        } else if (typeof cellValue === "string" && cellValue.length >= 4) {
          company[headerName] = cellValue.substring(0, 4);
        } else {
          company[headerName] = "";
        }
      } else {
        company[headerName] = cellValue;
      }
    }
    companies.push(company);
    Logger.log(`Processed row ${i}: ${JSON.stringify(company)}`);
  }
  
  Logger.log("Retrieved " + companies.length + " companies (with 'Date Founded' fields as year only).");
  return companies;
}
