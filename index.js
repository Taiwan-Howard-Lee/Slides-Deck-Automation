/**
 * Auto Slides Detect - Main Entry Point
 * 
 * This file serves as the main entry point for the Auto Slides Detect Google Apps Script project.
 * It exposes the necessary functions that need to be accessible from the Google Apps Script environment.
 */

// Import functions from other modules
// Note: In Google Apps Script, imports are not needed as all files are combined,
// but we include them here for clarity in the local development environment.

/**
 * Generates slides from sheet data for single companies.
 * This function is exposed to be called from the Google Sheets UI.
 */
function generateSlidesFromSheet() {
  // This function should be implemented to call the appropriate Main function
  // based on the user's selection in the UI.
  console.log("Generating slides from sheet data...");
  // Implementation would depend on your specific requirements
}

// Expose the necessary functions to the global scope
// This ensures they are accessible from the Google Apps Script environment
global.generateSlidesFromSheet = generateSlidesFromSheet;

// Expose other necessary functions
// Add any other functions that need to be accessible from the Google Apps Script environment
