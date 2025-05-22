/**
 * Universal Data Processor
 *
 * This module provides functions for processing data from various sources using LLM.
 * It serves as the core of the universal data-to-slides transformer.
 */

/**
 * Process raw data using LLM to extract structured information and map it to template placeholders.
 *
 * @param {string} rawData - The raw data in any format (CSV, JSON, etc.)
 * @param {Object} templateRequirements - Requirements for the template
 * @param {string} dataFormat - Optional hint about the data format
 * @param {string} layout - The layout type ("single" or "double")
 * @return {Object} Processed data mapped to template placeholders
 */
function processDataWithLLM(rawData, templateRequirements, dataFormat = '', layout = 'single') {
  // First, analyze the data structure to understand its format and content
  const dataAnalysisPrompt = createDataAnalysisPrompt(rawData, dataFormat);
  const systemInstruction = "You are a data analysis expert that can identify structure and patterns in any data format. Provide detailed analysis that will help with data transformation.";
  const dataAnalysis = aiAPICalling(dataAnalysisPrompt, systemInstruction);

  Logger.log("Data analysis completed");

  // Now create a mapping prompt that uses both the data analysis and template requirements
  const mappingPrompt = createMappingPrompt(rawData, templateRequirements, dataAnalysis, dataFormat, layout);
  const mappingInstruction = "You are a data transformation expert that maps source data to target templates with high accuracy. Always return valid JSON that matches the requested format exactly.";
  const mappingResponse = aiAPICalling(mappingPrompt, mappingInstruction);

  Logger.log("Data mapping completed");

  try {
    // Parse the JSON response
    const processedData = JSON.parse(mappingResponse);
    return processedData;
  } catch (error) {
    Logger.log("Error parsing LLM response: " + error);
    Logger.log("Raw response: " + mappingResponse);

    // Attempt to extract JSON from the response if it contains other text
    const jsonMatch = mappingResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        Logger.log("Failed to extract JSON from response: " + e);
      }
    }

    // Return a basic error structure if parsing fails
    return {
      error: true,
      message: "Failed to process data: " + error,
      rawResponse: mappingResponse
    };
  }
}

/**
 * Create a prompt for the LLM to analyze the data structure.
 *
 * @param {string} rawData - The raw data to analyze
 * @param {string} dataFormat - Optional hint about the data format
 * @return {string} The prompt for data analysis
 */
function createDataAnalysisPrompt(rawData, dataFormat = '') {
  // Limit the raw data size to avoid token limits
  const truncatedData = truncateData(rawData, 8000);

  // Format hint if provided
  const formatHint = dataFormat ? `The data appears to be in ${dataFormat} format.` :
    "Please analyze the format of the data without any assumptions.";

  return `
I need you to analyze the structure of the following data:

${truncatedData}

${formatHint}

Please provide a detailed analysis including:
1. What format is this data in? (CSV, JSON, table, etc.)
2. What are the column headers or key fields?
3. How many records/rows are in the data?
4. What types of values are in each column/field?
5. Are there any patterns or relationships between fields?
6. What appears to be the primary entity or subject of this data?
7. What fields would be most important for a presentation about this data?

Your analysis will be used to help map this data to a presentation template.
`;
}

/**
 * Create a prompt for the LLM to map data to template requirements.
 *
 * @param {string} rawData - The raw data to process
 * @param {Object} templateRequirements - Requirements for the template
 * @param {string} dataAnalysis - Analysis of the data structure
 * @param {string} dataFormat - Optional hint about the data format
 * @param {string} layout - The layout type ("single" or "double")
 * @return {string} The prompt for data mapping
 */
function createMappingPrompt(rawData, templateRequirements, dataAnalysis, dataFormat = '', layout = 'single') {
  // Limit the raw data size to avoid token limits
  const truncatedData = truncateData(rawData, 6000);

  // Create a detailed description of the template structure
  const templateDescription = formatTemplateDescription(templateRequirements);

  // Create a list of required mappings with layout information
  const requiredMappings = formatRequiredMappings(templateRequirements, layout);

  return `
# Data Transformation Task

## Source Data
\`\`\`
${truncatedData}
\`\`\`

## Data Analysis
${dataAnalysis}

## Template Information
Layout Type: ${layout.toUpperCase()} (${layout === 'double' ? 'Two items per slide' : 'One item per slide'})

${templateDescription}

## Required Mappings
${requiredMappings}

## Your Task
Transform the source data to match the template requirements. For each item in the source data:
1. Extract the relevant information
2. Map it to the corresponding template fields (all placeholders use the {{field}} format)
3. Transform content as needed (summarize long text, format dates, etc.)
4. Ensure the output matches the exact format required by the template

IMPORTANT NOTES:
- The template ONLY uses {{field}} format for placeholders (e.g., {{name}}, {{description}})
- If this is a "double" layout template, the fields will be prefixed with "item1" and "item2" (e.g., {{item1Name}}, {{item2Description}})
- If this is a "single" layout template, the fields will not have these prefixes (e.g., {{name}}, {{description}})
- Image fields (e.g., {{logo}}, {{image}}, {{photo}}) will be detected automatically and processed differently
- For image fields, provide a URL, base64 data, or a descriptive text that can be used to generate a placeholder
- All text content will be dynamically refined for presentation quality based on the field type and context
- Extract all relevant information from the source data, even if not explicitly requested in the template
- The system is domain-agnostic and can handle any type of data (not just company information)

Return a JSON object with this structure:
\`\`\`json
{
  "items": [
    {
      // First item with all required fields mapped from source data
    },
    // Additional items...
  ],
  "metadata": {
    "detectedFormat": "The format you detected (csv, json, etc.)",
    "totalItems": 0, // Total number of items processed
    "mappingConfidence": 0.0 // Your confidence in the mapping accuracy (0.0-1.0)
  }
}
\`\`\`

Only return the JSON object, nothing else. Ensure it is valid JSON that can be parsed.
`;
}

/**
 * Format a detailed description of the template structure.
 *
 * @param {Object} templateRequirements - The template requirements
 * @return {string} Formatted template description
 */
function formatTemplateDescription(templateRequirements) {
  if (!templateRequirements) {
    return "No template information available.";
  }

  let description = `Template Name: ${templateRequirements.name || "Unknown"}\n`;
  description += `Description: ${templateRequirements.description || "No description available."}\n`;

  if (templateRequirements.slideCount) {
    description += `Number of Slides: ${templateRequirements.slideCount}\n`;
  }

  // Add information about the slide structure if available
  if (templateRequirements.slideStructure && templateRequirements.slideStructure.length > 0) {
    description += "\nSlide Structure:\n";

    templateRequirements.slideStructure.forEach((slide, index) => {
      description += `\nSlide ${slide.slideNumber}:\n`;

      if (slide.elements && slide.elements.length > 0) {
        slide.elements.forEach(element => {
          if (element.type === 'shape' && element.text) {
            const textPreview = element.text.length > 50 ?
              element.text.substring(0, 47) + "..." :
              element.text;

            description += `- ${element.isTitle ? "Title" : "Text"}: "${textPreview}"\n`;
          } else if (element.type === 'table') {
            description += `- Table (${element.rows}x${element.cols})\n`;

            // Include a few cell examples if available
            if (element.cells && element.cells.length > 0) {
              const cellExamples = element.cells.slice(0, 3);
              cellExamples.forEach(cell => {
                const textPreview = cell.text.length > 30 ?
                  cell.text.substring(0, 27) + "..." :
                  cell.text;
                description += `  - Cell [${cell.row},${cell.col}]: "${textPreview}"\n`;
              });

              if (element.cells.length > 3) {
                description += `  - (${element.cells.length - 3} more cells...)\n`;
              }
            }
          }
        });
      }
    });
  }

  return description;
}

/**
 * Format the required mappings based on template requirements.
 * Emphasizes the standardized {{field}} format and handles layout-specific formatting.
 *
 * @param {Object} templateRequirements - The template requirements
 * @param {string} layout - The layout type ("single" or "double")
 * @return {string} Formatted mapping requirements
 */
function formatRequiredMappings(templateRequirements, layout = 'single') {
  if (!templateRequirements || !templateRequirements.fields || templateRequirements.fields.length === 0) {
    return "No specific mapping requirements. Please extract any relevant information from the data.";
  }

  let mappings = "The following fields need to be mapped from the source data:\n\n";
  mappings += "NOTE: All placeholders in the template use the {{field}} format.\n\n";

  if (layout === 'double') {
    mappings += "IMPORTANT: This is a DOUBLE layout template. Fields should be prefixed with 'item1' and 'item2'.\n";
    mappings += "For backward compatibility, you can also use 'company1' and 'company2' prefixes.\n\n";
  }

  templateRequirements.fields.forEach(field => {
    // Format field name based on layout
    const displayName = field.name;

    mappings += `### {{${displayName}}}\n`;
    mappings += `Description: ${field.description || "No description"}\n`;
    mappings += `Required: ${field.required ? "Yes" : "No"}\n`;

    // Add examples if available
    if (field.examples && field.examples.length > 0) {
      mappings += "Examples of where this appears in the template:\n";
      field.examples.forEach(example => {
        mappings += `- Slide ${example.slideNumber}: "${example.context}"\n`;
      });
    }

    mappings += "\n";
  });

  // Add specific guidance for image fields
  mappings += "## Image Field Guidance\n\n";
  mappings += "Some fields may represent images (e.g., logo, image, photo, thumbnail, icon):\n";
  mappings += "1. For image fields, provide one of the following:\n";
  mappings += "   - A direct URL to an image (e.g., 'https://example.com/image.jpg')\n";
  mappings += "   - A Google Drive file ID for an image\n";
  mappings += "   - Base64 encoded image data\n";
  mappings += "   - A descriptive text that can be used to generate a placeholder\n";
  mappings += "2. Image fields will be automatically detected based on their names\n";
  mappings += "3. The system will handle positioning and sizing of images automatically\n";
  mappings += "4. Any field containing 'image', 'logo', 'photo', 'picture', 'icon', or 'thumbnail' will be treated as an image\n\n";

  // Add specific guidance for double layout
  if (layout === 'double') {
    mappings += "## Double Layout Guidance\n\n";
    mappings += "For this double layout template, you need to:\n";
    mappings += "1. Pair up the data items (two items per slide)\n";
    mappings += "2. Format each pair with item1 and item2 prefixes\n";
    mappings += "3. For example, if the data has 'name' and 'description' fields, map them to:\n";
    mappings += "   - {{item1Name}} and {{item1Description}} for the first item\n";
    mappings += "   - {{item2Name}} and {{item2Description}} for the second item\n";
    mappings += "4. This applies to image fields as well (e.g., {{item1Image}}, {{item2Image}})\n";
    mappings += "5. For backward compatibility, also include company1/company2 prefixes:\n";
    mappings += "   - {{company1Name}} and {{company1Description}} as aliases for the first item\n";
    mappings += "   - {{company2Name}} and {{company2Description}} as aliases for the second item\n\n";
  }

  return mappings;
}

/**
 * Format template requirements for the prompt (legacy function).
 *
 * @param {Object} requirements - The template requirements
 * @return {string} Formatted requirements
 */
function formatTemplateRequirements(requirements) {
  if (!requirements || !requirements.fields) {
    return '"name": "Name or title", "description": "Brief description"';
  }

  return requirements.fields.map(field => {
    return `"${field.name}": "${field.description || 'Value for ' + field.name}"`;
  }).join(",\n      ");
}

/**
 * Truncate data to a maximum length to avoid token limits.
 *
 * @param {string} data - The data to truncate
 * @param {number} maxLength - Maximum length
 * @return {string} Truncated data
 */
function truncateData(data, maxLength) {
  if (data.length <= maxLength) {
    return data;
  }

  // For CSV-like data, try to preserve header row and some content
  if (data.includes('\n')) {
    const lines = data.split('\n');
    const header = lines[0];

    // Calculate how many lines we can include
    const avgLineLength = data.length / lines.length;
    const estimatedLines = Math.floor((maxLength - header.length) / avgLineLength);

    // Include header and as many lines as possible
    return [header, ...lines.slice(1, estimatedLines)].join('\n') +
      '\n... [truncated, ' + (lines.length - estimatedLines) + ' more rows]';
  }

  // For other formats, simple truncation with indicator
  return data.substring(0, maxLength) + '... [truncated]';
}

/**
 * Detect the format of the provided data.
 *
 * @param {string} data - The data to analyze
 * @return {string} Detected format (csv, json, etc.)
 */
function detectDataFormat(data) {
  // Trim whitespace
  const trimmed = data.trim();

  // Check for JSON format
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch (e) {
      // Not valid JSON
    }
  }

  // Check for CSV format
  const lines = trimmed.split('\n');
  if (lines.length > 1) {
    const firstLineCommas = (lines[0].match(/,/g) || []).length;
    const secondLineCommas = lines.length > 1 ? (lines[1].match(/,/g) || []).length : 0;

    // If consistent number of commas and more than one column
    if (firstLineCommas > 0 && firstLineCommas === secondLineCommas) {
      return 'csv';
    }

    // Check for TSV
    const firstLineTabs = (lines[0].match(/\t/g) || []).length;
    const secondLineTabs = lines.length > 1 ? (lines[1].match(/\t/g) || []).length : 0;

    if (firstLineTabs > 0 && firstLineTabs === secondLineTabs) {
      return 'tsv';
    }
  }

  // Default to unknown
  return 'unknown';
}
