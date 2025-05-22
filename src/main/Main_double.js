
/**
 * Main function for double-company slide generation.
 * Modified to accept a systemInstruction string from the HTML.
 */
function Main_double(baseId, tableName, templateDeckId, finalDeckId, systemInstruction) {
  try {
    airtable_transfer(baseId, tableName);
    pairUpSheetRows();
    var companies = companies_info();
    Logger.log("Retrieved " + companies.length + " row(s).");
    if (companies.length === 0) {
      Logger.log("No companies to process.");
      return { result: "No data", processed: 0 };
    }
    var instruction = systemInstruction;
    var userMessage = "Please condense the following Description into a concise, under 50 words that highlights the startup’s core offering and its business model (example B2B, B2C, B2B2C).  Provide only the refined text, nothing else. For example: 'Agrotech Risk offers agricultural solutions through their B2B Crop Loss Assessment Support System (CLASS) analytical software. Integrating precision farming techniques, they provide farmers with insights and recommendations to minimize crop losses and enhance productivity.'  Make a clear storyline and their business model to sell this company's idea to our clients.";
    companies.forEach(function(row) {
      var oldDesc1 = row["[1.1] Long Description"] || "";
      if (oldDesc1.trim()) {
        var userPrompt1 = instruction + userMessage + "\n\nCurrent Long Description:\n" + oldDesc1;
        var refined1 = aiAPICalling(userPrompt1, instruction);
        row["[1.1] Long Description"] = refined1;
        Logger.log("Updated Company 1 (" + (row["[1.1] Company Name"] || "Unknown") + "): " + refined1);
      }
      var oldDesc2 = row["[1.1] Long Description2"] || "";
      if (oldDesc2.trim()) {
        var userPrompt2 = instruction + userMessage + "\n\nCurrent Long Description:\n" + oldDesc2;
        var refined2 = aiAPICalling(userPrompt2, instruction);
        row["[1.1] Long Description2"] = refined2;
        Logger.log("Updated Company 2 (" + (row["[1.1] Company Name2"] || "Unknown") + "): " + refined2);
      }
    });
    slides_double(companies, templateDeckId, finalDeckId);
    empty_sheet();
    Logger.log("Double-company slide generation completed successfully.");
    return { result: "Success", processed: companies.length };
  } catch (error) {
    Logger.log("Error in Main_double: " + error);
    return { result: "Error", message: error.toString() };
  }
}