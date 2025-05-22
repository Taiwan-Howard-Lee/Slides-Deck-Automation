// ========================
// Helper Functions
// ========================

/**
 * Extracts the Airtable Base ID and Table ID from a full Airtable URL.
 * Example: 
 * https://airtable.com/appaC3tF3jXr0rlJ0/tblBygTSOQPGWQX0p/viw73WLa9jNIUE3DW?blocks=hidev
 */
function extractAirtableIds(fullUrl) {
  var parts = fullUrl.split('/');
  var baseId = parts[3];  // e.g., "appaC3tF3jXr0rlJ0"
  var tableId = parts[4]; // e.g., "tblBygTSOQPGWQX0p"
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

