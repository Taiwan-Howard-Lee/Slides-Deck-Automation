/**
 * Functions exposed to the UI for the Universal Data Transformer.
 * These functions are called from the HTML interface.
 */

/**
 * Get template files from a specified folder.
 *
 * @param {string} folderId - The ID of the folder containing templates
 * @return {Array} Array of template file objects
 */
function getTemplateFilesFromFolder(folderId) {
  try {
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFiles();

    var templateFiles = [];

    while (files.hasNext()) {
      var file = files.next();
      var fileName = file.getName();

      // Only include Google Slides files
      if (file.getMimeType() === MimeType.GOOGLE_SLIDES) {
        templateFiles.push({
          name: fileName,
          url: file.getUrl(),
          id: file.getId(),
          // Try to detect layout from filename
          layout: detectLayoutFromFileName(fileName)
        });
      }
    }

    return templateFiles;
  } catch (error) {
    Logger.log("Error getting template files: " + error);
    throw new Error("Failed to get template files: " + error.toString());
  }
}

/**
 * Detect layout type from a filename.
 *
 * @param {string} fileName - The name of the file
 * @return {string} Detected layout type ("single", "double", or "")
 */
function detectLayoutFromFileName(fileName) {
  fileName = fileName.toLowerCase();

  if (fileName.includes("single")) {
    return "single";
  } else if (fileName.includes("double")) {
    return "double";
  }

  return "";
}

/**
 * Convert placeholders in a template to the standard {{field}} format.
 * This function is exposed to the UI.
 *
 * @param {string} templateId - The ID or URL of the template
 * @return {Object} Result of the conversion
 */
function convertPlaceholdersToStandardFormat(templateId) {
  try {
    // Extract the ID if a URL was provided
    if (templateId.includes('/')) {
      templateId = extractSlideId(templateId);
    }

    // Call the actual implementation function from universal_slides_generator.js
    return convertPlaceholdersToStandardFormat(templateId);
  } catch (error) {
    Logger.log("Error converting placeholders: " + error);
    return {
      success: false,
      message: "Error converting placeholders: " + error.toString(),
      conversions: 0
    };
  }
}
