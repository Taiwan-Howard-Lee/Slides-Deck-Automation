// ========================
// Main Processing Functions
// ========================

/**
 * Main function for single-company slide generation.
 * Modified to accept parameters from the HTML form.
 * @param {string} baseId - The Airtable base ID
 * @param {string} tableName - The Airtable table name
 * @param {string} templateDeckId - The template slide deck ID
 * @param {string} finalDeckId - The final slide deck ID
 * @param {string} systemInstruction - The system instruction for the AI
 * @param {Array<Object>} descriptionFieldsData - Array of objects with fieldName and prompt properties
 */
function Main_single(baseId, tableName, templateDeckId, finalDeckId, systemInstruction, descriptionFieldsData) {
  try {
    airtable_transfer(baseId, tableName);
    var companies = companies_info();
    Logger.log("Retrieved " + companies.length + " companies.");
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
      
      // Process each company
      companies.forEach(function(company, companyIndex) {
        // Process each description field with its own prompt
        descriptionFieldsData.forEach(function(fieldData, fieldIndex) {
          var fieldName = fieldData.fieldName;
          var prompt = fieldData.prompt;
          
          if (fieldName && prompt) {
            var oldDescription = company[fieldName] || "";
            if (oldDescription.trim()) {
              var userPrompt = instruction + prompt + "\n\nCurrent Description:\n" + oldDescription;
              var refinedOutput = aiAPICalling(userPrompt, instruction);
              company[fieldName] = refinedOutput;
              Logger.log(`Updated field "${fieldName}" for company #${companyIndex + 1}: ${refinedOutput.substring(0, 50)}...`);
            }
          }
        });
      });
    }
    
    slides_single(companies, templateDeckId, finalDeckId);
    empty_sheet();
    Logger.log("Single-company slide generation completed successfully.");
    return { result: "Success", processed: companies.length, message: "Slide generation completed." };
  } catch (error) {
    Logger.log("Error in Main_single: " + error);
    return { result: "Error", message: error.toString() };
  }
}
