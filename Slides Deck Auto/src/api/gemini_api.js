
function aiAPICalling(userMessage, systemInstruction) {
  const API_KEYS = [
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY_1"),
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY_2"),
    PropertiesService.getScriptProperties().getProperty("GEMINI_API_KEY_3")
  ];
  let currentKeyIndex = parseInt(PropertiesService.getScriptProperties().getProperty("CURRENT_API_KEY_INDEX")) || 0;
  let maxAttempts = API_KEYS.length;
  let modelId = "gemini-2.0-flash";
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let apiKey = API_KEYS[currentKeyIndex];
    let url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelId + ":generateContent?key=" + apiKey;
    let payload = {
      "contents": [{
        "parts": [{
          "text": systemInstruction + "\n" + userMessage
        }]
      }],
      "generationConfig": {
        "temperature": 0.0  // Set temperature to 0.0 for more deterministic responses
      }
    };
    let options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload),
      "muteHttpExceptions": true
    };
    // Log attempt number and API key index, but not the full key for security
    Logger.log("Attempt " + (attempt + 1) + ": Using API Key " + (currentKeyIndex + 1));
    try {
      let response = UrlFetchApp.fetch(url, options);
      let statusCode = response.getResponseCode();
      Logger.log("Response Code: " + statusCode);
      if (statusCode === 200) {
        let json = JSON.parse(response.getContentText());
        if (json.candidates && json.candidates.length > 0 &&
            json.candidates[0].content && json.candidates[0].content.parts &&
            json.candidates[0].content.parts.length > 0 &&
            json.candidates[0].content.parts[0].text) {
          currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
          PropertiesService.getScriptProperties().setProperty("CURRENT_API_KEY_INDEX", currentKeyIndex);
          return json.candidates[0].content.parts[0].text.trim();
        }
      } else {
        Logger.log("API Error: " + statusCode + ". Switching to next API key...");
      }
    } catch (error) {
      Logger.log("Error calling AI API: " + error);
    }
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  }
  Logger.log("All API keys exhausted. No response received.");
  return "";
}