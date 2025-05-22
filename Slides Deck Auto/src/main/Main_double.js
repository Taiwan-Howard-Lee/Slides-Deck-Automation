/**
 * Main function for double-company slide generation.
 * Modified to accept parameters from the HTML form.
 * @param {string} baseId - The Airtable base ID
 * @param {string} tableName - The Airtable table name
 * @param {string} templateDeckId - The template slide deck ID
 * @param {string} finalDeckId - The final slide deck ID
 * @param {string} systemInstruction - The system instruction for the AI
 * @param {Array<Object>} descriptionFieldsData - Array of objects with fieldName and prompt properties
 */
function Main_double(baseId, tableName, templateDeckId, finalDeckId, systemInstruction, descriptionFieldsData) {
  try {
    airtable_transfer(baseId, tableName);
    pairUpSheetRows();
    var companies = companies_info();
    Logger.log("Retrieved " + companies.length + " row(s).");
    if (companies.length === 0) {
      Logger.log("No companies to process.");
      return { result: "No data", processed: 0 };
    }
    
    // Use the parameters provided from the HTML form.
    var instruction = systemInstruction;
    
    // Skip AI processing if no description fields data
    if (!descriptionFieldsData || descriptionFieldsData.length === 0) {
      Logger.log("Skipping AI processing - no description fields specified");
    } else {
      Logger.log(`Processing ${descriptionFieldsData.length} description field(s) with custom prompts`);
      
      // Process each row (pair of companies)
      companies.forEach(function(row, rowIndex) {
        // Process each description field with its own prompt
        descriptionFieldsData.forEach(function(fieldData, fieldIndex) {
          var fieldName = fieldData.fieldName;
          var prompt = fieldData.prompt;
          
          if (fieldName && prompt) {
            // Process first company
            var field1 = fieldName;
            var oldDesc1 = row[field1] || "";
            if (oldDesc1.trim()) {
              var userPrompt1 = instruction + prompt + "\n\nCurrent Description:\n" + oldDesc1;
              var refined1 = aiAPICalling(userPrompt1, instruction);
              row[field1] = refined1;
              Logger.log(`Updated field "${field1}" for row #${rowIndex + 1}, company 1: ${refined1.substring(0, 50)}...`);
            }
            
            // Process second company
            var field2 = fieldName + "2";
            var oldDesc2 = row[field2] || "";
            if (oldDesc2.trim()) {
              var userPrompt2 = instruction + prompt + "\n\nCurrent Description:\n" + oldDesc2;
              var refined2 = aiAPICalling(userPrompt2, instruction);
              row[field2] = refined2;
              Logger.log(`Updated field "${field2}" for row #${rowIndex + 1}, company 2: ${refined2.substring(0, 50)}...`);
            }
          }
        });
      });
    }
    
    slides_double(companies, templateDeckId, finalDeckId);
    empty_sheet();
    Logger.log("Double-company slide generation completed successfully.");
    return { result: "Success", processed: companies.length, message: "Slide generation completed." };
  } catch (error) {
    Logger.log("Error in Main_double: " + error);
    return { result: "Error", message: error.toString() };
  }
}
