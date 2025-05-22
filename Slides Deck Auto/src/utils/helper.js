// ========================
// Helper Functions
// ========================

/**
 * Extracts the Airtable Base ID and Table ID from a full Airtable URL.
 * Example:
 * https://airtable.com/appaC3tF3jXr0rlJ0/tblBygTSOQPGWQX0p/viw73WLa9jNIUE3DW?blocks=hidev
 */
function extractAirtableIds(fullUrl) {
  Logger.log("Extracting Airtable IDs from URL: " + fullUrl);

  // Handle URLs that might start with or without https://
  if (!fullUrl.includes('airtable.com')) {
    fullUrl = 'https://airtable.com/' + fullUrl.replace(/^.*airtable\.com\//, '');
  }

  var parts = fullUrl.split('/');
  Logger.log("URL parts: " + JSON.stringify(parts));

  // Make sure we have enough parts
  if (parts.length < 5) {
    Logger.log("ERROR: Invalid Airtable URL format. Not enough parts in the URL.");
    return { baseId: "", tableId: "" };
  }

  // Find the part that starts with 'app' for baseId
  var baseId = "";
  var tableId = "";

  for (var i = 0; i < parts.length; i++) {
    if (parts[i].startsWith('app')) {
      baseId = parts[i];
      // Table ID should be the next part
      if (i + 1 < parts.length) {
        tableId = parts[i + 1];
      }
      break;
    }
  }

  // If we couldn't find the IDs using the above method, try the original method
  if (!baseId || !tableId) {
    baseId = parts[3] || "";  // e.g., "appaC3tF3jXr0rlJ0"
    tableId = parts[4] || ""; // e.g., "tblBygTSOQPGWQX0p"
  }

  Logger.log("Extracted baseId: " + baseId);
  Logger.log("Extracted tableId: " + tableId);

  return { baseId: baseId, tableId: tableId };
}

/**
 * Extracts the Google Slides Deck ID from a full URL.
 * Example:
 * https://docs.google.com/presentation/d/1b06g0uPg7KXrYzSMhCM4_5RhVXYiZI39Bj4xkn73aH8/edit?usp=sharing
 */
function extractSlideId(fullUrl) {
  var regex = /\/d\/([a-zA-Z0-9_-]+)/;
  var match = fullUrl.match(regex);
  return match ? match[1] : null;
}

