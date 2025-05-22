
/**
 * processData is called via google.script.run from the HTML interface.
 * It now supports both the legacy format and the new universal transformer format:
 *
 * Legacy format:
 * {
 *   airtableUrl: "full Airtable URL",
 *   systemInstruction: "the system instruction from the form",
 *   layout: "single" or "double",
 *   slidesSingle: { templateUrl: "full URL", finalUrl: "full URL" },
 *   slidesDouble: { templateUrl: "full URL", finalUrl: "full URL" }
 * }
 *
 * Universal transformer format:
 * {
 *   useUniversalTransformer: true,
 *   dataSource: {
 *     type: "airtable|google_sheets|raw_text|csv|json",
 *     connectionInfo: { ... source-specific connection info ... },
 *     fetchOptions: { ... source-specific fetch options ... }
 *   },
 *   templateInfo: {
 *     templateId: "template slide deck ID",
 *     finalDeckId: "final slide deck ID"
 *   },
 *   layout: "single" or "double",
 *   systemInstruction: "the system instruction from the form"
 * }
 */
function processData(params) {
  // Check if we should use the new universal transformer
  if (params.useUniversalTransformer) {
    return universalTransform(params);
  }

  // Legacy processing for backward compatibility

  // Check if we have raw data instead of an Airtable URL
  if (params.rawData) {
    // Use the universal transformer with raw text data
    return universalTransform({
      dataSource: {
        type: "raw_text",
        connectionInfo: { data: params.rawData }
      },
      templateInfo: {
        templateId: params.layout === "double" ?
          extractSlideId(params.slidesDouble.templateUrl) :
          extractSlideId(params.slidesSingle.templateUrl),
        finalDeckId: params.layout === "double" ?
          extractSlideId(params.slidesDouble.finalUrl) :
          extractSlideId(params.slidesSingle.finalUrl)
      },
      layout: params.layout,
      systemInstruction: params.systemInstruction || ""
    });
  }

  // Extract Airtable IDs from the full URL provided by the user.
  var airtableData = extractAirtableIds(params.airtableUrl);
  var baseId = airtableData.baseId;
  var tableName = airtableData.tableId; // Using the Table ID as the table identifier.
  // Use the system instruction provided in the form.
  var systemInstruction = params.systemInstruction || "";

  // Check if we should use the universal transformer for Airtable
  if (params.useUniversalForAirtable) {
    return universalTransform({
      dataSource: {
        type: "airtable",
        connectionInfo: {
          baseId: baseId,
          tableName: tableName,
          filterFormula: "{Ready for preso} = 1"
        }
      },
      templateInfo: {
        templateId: params.layout === "double" ?
          extractSlideId(params.slidesDouble.templateUrl) :
          extractSlideId(params.slidesSingle.templateUrl),
        finalDeckId: params.layout === "double" ?
          extractSlideId(params.slidesDouble.finalUrl) :
          extractSlideId(params.slidesSingle.finalUrl)
      },
      layout: params.layout,
      systemInstruction: systemInstruction
    });
  }

  // Legacy processing path
  if (params.layout === "double") {
    var templateDeckId = extractSlideId(params.slidesDouble.templateUrl);
    var finalDeckId = extractSlideId(params.slidesDouble.finalUrl);
    return Main_double(baseId, tableName, templateDeckId, finalDeckId, systemInstruction);
  } else {
    var templateDeckId = extractSlideId(params.slidesSingle.templateUrl);
    var finalDeckId = extractSlideId(params.slidesSingle.finalUrl);
    return Main_single(baseId, tableName, templateDeckId, finalDeckId, systemInstruction);
  }
}