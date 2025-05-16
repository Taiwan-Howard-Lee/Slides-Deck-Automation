
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
  // Keep track of which fields contain images
  const imageFields = new Set();

  for (let i = 1; i < allValues.length; i++) {
    const row = allValues[i];
    const company = {};
    for (let j = 0; j < headers.length; j++) {
      const headerName = headers[j];
      const cellValue = row[j];

      if (typeof cellValue === "string" && cellValue.startsWith("__IMAGE_FIELD__")) {
        // This is an image field that we marked in airtable.js
        imageFields.add(headerName);
        company[headerName] = cellValue.substring("__IMAGE_FIELD__".length);
        company[`__is_image_${headerName}`] = true;
      } else {
        company[headerName] = cellValue;
      }
    }
    companies.push(company);
    // Log a more concise summary instead of the entire company object
    Logger.log(`Processed row ${i} with ${Object.keys(company).length} fields`);
  }

  // Store the image fields in script properties for use in other functions
  const imageFieldsArray = Array.from(imageFields);
  PropertiesService.getScriptProperties().setProperty("IMAGE_FIELDS", JSON.stringify(imageFieldsArray));
  Logger.log("Detected image fields: " + imageFieldsArray.join(", "));

  Logger.log("Retrieved " + companies.length + " companies.");
  return companies;
}
