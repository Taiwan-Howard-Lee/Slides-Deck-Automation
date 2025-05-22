/**
 * Handles HTTP GET requests to the web app.
 *
 * @param {Object} e - Event object containing request parameters
 * @return {HtmlOutput} The HTML page to display
 */
function doGet(e) {
  // Check if the 'v' parameter is provided to specify the interface version
  const version = e && e.parameter && e.parameter.v;

  if (version === 'universal' || version === 'new') {
    // Serve the new universal interface
    return HtmlService.createHtmlOutputFromFile('src/ui/universal_interface')
      .setTitle('Universal Data Transformer')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } else {
    // Serve the legacy interface by default
    return HtmlService.createHtmlOutputFromFile('0.0 interface')
      .setTitle('Slide Deck Automation')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}