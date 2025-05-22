
/**
 * processData is called via google.script.run from the HTML interface.
 * It now expects a params object with the following structure:
 * {
 *   airtableUrl: "full Airtable URL",
 *   systemInstruction: "the system instruction from the form",
 *   layout: "single" or "double",
 *   descriptionFieldsData: [
 *     { fieldName: "field1", prompt: "prompt1" },
 *     { fieldName: "field2", prompt: "prompt2" },
 *     ...
 *   ],
 *   slidesSingle: { templateUrl: "full URL", finalUrl: "full URL" },
 *   slidesDouble: { templateUrl: "full URL", finalUrl: "full URL" }
 * }
 */
function processData(params) {
  // Extract Airtable IDs from the full URL provided by the user.
  var airtableData = extractAirtableIds(params.airtableUrl);
  var baseId = airtableData.baseId;
  var tableName = airtableData.tableId; // Using the Table ID as the table identifier.
  // Use the parameters provided in the form.
  var systemInstruction = params.systemInstruction || "";
  var descriptionFieldsData = params.descriptionFieldsData || [];

  // Log the description fields data
  if (descriptionFieldsData.length > 0) {
    Logger.log(`Processing ${descriptionFieldsData.length} description field(s) with custom prompts:`);
    descriptionFieldsData.forEach(function(data, index) {
      Logger.log(`  ${index + 1}. Field: "${data.fieldName}" with custom prompt`);
    });
  } else {
    Logger.log("No description fields specified - skipping AI processing");
  }

  if (params.layout === "double") {
    var templateDeckId = extractSlideId(params.slidesDouble.templateUrl);
    var finalDeckId = extractSlideId(params.slidesDouble.finalUrl);
    return Main_double(baseId, tableName, templateDeckId, finalDeckId, systemInstruction, descriptionFieldsData);
  } else {
    var templateDeckId = extractSlideId(params.slidesSingle.templateUrl);
    var finalDeckId = extractSlideId(params.slidesSingle.finalUrl);
    return Main_single(baseId, tableName, templateDeckId, finalDeckId, systemInstruction, descriptionFieldsData);
  }
}