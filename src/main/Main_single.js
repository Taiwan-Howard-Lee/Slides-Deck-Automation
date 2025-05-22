
// ========================
// Main Processing Functions
// ========================

/**
 * Main function for single-company slide generation.
 * Modified to accept a systemInstruction string from the HTML.
 */
function Main_single(baseId, tableName, templateDeckId, finalDeckId, systemInstruction) {
  try {
    airtable_transfer(baseId, tableName);
    var companies = companies_info();
    Logger.log("Retrieved " + companies.length + " companies.");
    if (companies.length === 0) {
      Logger.log("No companies to process.");
      return { result: "No data", processed: 0 };
    }
    // Use the system instruction provided from the HTML.
    var instruction = systemInstruction;
    var userMessage = "Please condense the following Description into a concise, under 50 words that highlights the startup’s core offering and its business model (example B2B, B2C, B2B2C).  Provide only the refined text, nothing else. For example: 'Agrotech Risk offers agricultural solutions through their B2B Crop Loss Assessment Support System (CLASS) analytical software. Integrating precision farming techniques, they provide farmers with insights and recommendations to minimize crop losses and enhance productivity.'  Make a clear storyline and their business model to sell this company's idea to our clients.";
    companies.forEach(function(company) {
      var oldDescription = company["Long description"] || "";
      if (oldDescription.trim()) {
        var userPrompt = instruction + userMessage + "\n\nCurrent Long Description:\n" + oldDescription;
        var refinedOutput = aiAPICalling(userPrompt, instruction);
        company["Long description"] = refinedOutput;
        Logger.log("Updated (" + (company["Company Name"] || "Unknown") + "): " + refinedOutput);
      }
    });
    slides_single(companies, templateDeckId, finalDeckId);
    empty_sheet();
    Logger.log("Single-company slide generation completed successfully.");
    return { result: "Success", processed: companies.length, message: "Slide generation completed." };
  } catch (error) {
    Logger.log("Error in Main_single: " + error);
    return { result: "Error", message: error.toString() };
  }
}