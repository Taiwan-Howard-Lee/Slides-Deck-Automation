/**
 * Universal Data-to-Slides Transformer
 *
 * This module serves as the main controller for the universal data transformer.
 * It coordinates the data source adapters, LLM processing, content refinement, and slide generation.
 */

/**
 * Main function for the universal data transformer.
 *
 * @param {Object} params - Parameters for the transformation
 * @return {Object} Result of the transformation
 */
function universalTransform(params) {
  try {
    Logger.log("Starting universal transformation with params: " + JSON.stringify(params));

    // 1. Extract parameters
    const dataSource = params.dataSource || {};
    const templateInfo = params.templateInfo || {};

    // 2. Validate required parameters
    if (!dataSource.type) {
      return { result: "Error", message: "Data source type is required" };
    }
    if (!templateInfo.templateId) {
      return { result: "Error", message: "Template ID is required" };
    }
    if (!templateInfo.finalDeckId) {
      return { result: "Error", message: "Final deck ID is required" };
    }

    // 3. Get the appropriate data source adapter
    const adapter = getDataSourceAdapter(dataSource.type);
    if (!adapter) {
      return { result: "Error", message: "Unsupported data source type: " + dataSource.type };
    }

    // 4. Connect to the data source
    const connected = adapter.connect(dataSource.connectionInfo);
    if (!connected) {
      return { result: "Error", message: "Failed to connect to data source" };
    }

    // 5. Fetch the raw data
    const rawData = adapter.fetchData(dataSource.fetchOptions);
    if (!rawData) {
      return { result: "Error", message: "No data retrieved from source" };
    }

    Logger.log("Retrieved raw data from source. Length: " + rawData.length);

    // 6. Detect layout from template name or explicit parameter
    const layout = detectLayoutFromTemplate(templateInfo.templateId) || params.layout || "single";

    // 7. Get template requirements
    const templateRequirements = getTemplateRequirements(templateInfo.templateId, layout);

    // 8. Process the data with LLM
    const processedData = processDataWithLLM(rawData, templateRequirements, dataSource.type, layout);

    if (processedData.error) {
      return { result: "Error", message: processedData.message };
    }

    Logger.log("Data processed successfully. Items: " +
               (processedData.items ? processedData.items.length : 0));

    // 9. Generate slides based on the detected layout
    let result;

    // Check if we need to use single or double layout
    if (layout === "double") {
      // For double layout, we need to pair up the items
      const pairedData = {
        items: pairUpDataItems(processedData.items),
        metadata: processedData.metadata
      };

      // Generate slides with paired data
      result = generateUniversalSlides(
        pairedData,
        templateInfo.templateId,
        templateInfo.finalDeckId,
        "double"
      );
    } else {
      // For single layout, use the data as is
      result = generateUniversalSlides(
        processedData,
        templateInfo.templateId,
        templateInfo.finalDeckId,
        "single"
      );
    }

    // 10. Return the result
    return {
      result: result.success ? "Success" : "Error",
      processed: processedData.items ? processedData.items.length : 0,
      slidesGenerated: result.slidesGenerated,
      message: result.message,
      presentationUrl: result.presentationUrl,
      details: result
    };

  } catch (error) {
    Logger.log("Error in universalTransform: " + error);
    return { result: "Error", message: error.toString() };
  }
}

/**
 * Get the appropriate data source adapter based on type.
 *
 * @param {string} type - The data source type
 * @return {Object} Data source adapter instance
 */
function getDataSourceAdapter(type) {
  switch (type.toLowerCase()) {
    case 'raw_text':
    case 'text':
    case 'csv':
    case 'json':
      return new RawTextAdapter();

    case 'google_sheets':
    case 'sheets':
    case 'spreadsheet':
      return new GoogleSheetsAdapter();

    case 'airtable':
      return new AirtableAdapter();

    default:
      Logger.log("Unsupported data source type: " + type);
      return null;
  }
}

/**
 * Detect layout type from template ID or name.
 *
 * @param {string} templateId - The template ID or URL
 * @return {string} Detected layout type or null if unknown
 */
function detectLayoutFromTemplate(templateId) {
  if (!templateId) return null;

  // Extract template name from URL if needed
  let templateName = templateId;
  if (templateId.includes('/')) {
    const parts = templateId.split('/');
    templateName = parts[parts.length - 2] || parts[parts.length - 1];
  }

  // Convert to lowercase for case-insensitive matching
  templateName = templateName.toLowerCase();

  // Check for layout indicators in the name
  if (templateName.includes('single')) {
    return 'single';
  } else if (templateName.includes('double')) {
    return 'double';
  }

  return null;
}

/**
 * Pair up data items for double layout slides.
 * This function takes individual data items and pairs them up for display on double slides.
 *
 * @param {Array} items - Individual data items
 * @return {Array} Paired items for double slides
 */
function pairUpDataItems(items) {
  if (!items || items.length === 0) {
    return [];
  }

  // Check if items are already paired (have company1/company2 structure)
  if (items[0].company1 || items[0].company1Name) {
    return items; // Already in paired format
  }

  const pairedItems = [];

  // Pair up items, two at a time
  for (let i = 0; i < items.length; i += 2) {
    if (i + 1 < items.length) {
      // Create a paired item with item1 and item2 prefixes
      const pairedItem = {};

      // Copy all properties from the first item with item1 prefix
      Object.keys(items[i]).forEach(key => {
        pairedItem["item1" + key.charAt(0).toUpperCase() + key.slice(1)] = items[i][key];
      });

      // Also add common aliases for backward compatibility
      pairedItem.company1Name = items[i].companyName || items[i].name || items[i].title || "Item 1";
      pairedItem.company1Description = items[i].description || items[i].about || "";

      // Copy all properties from the second item with item2 prefix
      Object.keys(items[i+1]).forEach(key => {
        pairedItem["item2" + key.charAt(0).toUpperCase() + key.slice(1)] = items[i+1][key];
      });

      // Also add common aliases for backward compatibility
      pairedItem.company2Name = items[i+1].companyName || items[i+1].name || items[i+1].title || "Item 2";
      pairedItem.company2Description = items[i+1].description || items[i+1].about || "";

      pairedItems.push(pairedItem);
    } else {
      // Handle odd number of items - create a paired item with empty second item
      const pairedItem = {};

      // Copy all properties from the first item with item1 prefix
      Object.keys(items[i]).forEach(key => {
        pairedItem["item1" + key.charAt(0).toUpperCase() + key.slice(1)] = items[i][key];
      });

      // Add common aliases for backward compatibility
      pairedItem.company1Name = items[i].companyName || items[i].name || items[i].title || "Item 1";
      pairedItem.company1Description = items[i].description || items[i].about || "";
      pairedItem.item2Name = "N/A";
      pairedItem.company2Name = "N/A";
      pairedItem.item2Description = "No information available.";
      pairedItem.company2Description = "No information available.";

      // Copy all other properties from the original item
      Object.keys(items[i]).forEach(key => {
        if (key !== "companyName" && key !== "name" && key !== "description") {
          pairedItem["company1" + key.charAt(0).toUpperCase() + key.slice(1)] = items[i][key];
        }
      });

      pairedItems.push(pairedItem);
    }
  }

  return pairedItems;
}
