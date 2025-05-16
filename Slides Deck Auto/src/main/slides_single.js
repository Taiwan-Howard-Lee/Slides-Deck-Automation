function slides_single(companies, templateDeckId, finalDeckId) {
  var templateDeck = SlidesApp.openById(templateDeckId);
  var finalDeck = SlidesApp.openById(finalDeckId);
  var templateSlide = templateDeck.getSlides()[0];

  // Get dynamically detected image fields from script properties
  let imageFields = [];
  try {
    const imageFieldsJson = PropertiesService.getScriptProperties().getProperty("IMAGE_FIELDS");
    if (imageFieldsJson) {
      imageFields = JSON.parse(imageFieldsJson);
      Logger.log("Using dynamically detected image fields: " + imageFields.join(", "));
    }
  } catch (e) {
    Logger.log("Error parsing image fields: " + e);
    // No fallback to hardcoded fields - we'll rely on the __is_image_ property instead
    Logger.log("Will rely on __is_image_ properties for image field detection");
  }

  companies.forEach(function(company) {
    let newSlide = templateSlide.duplicate();
    Object.keys(company).forEach(function(key) {
      // Skip metadata fields and fields ending with "2"
      if (key.startsWith("__is_image_") || key.endsWith("2")) return;

      const placeholder = `{{${key}}}`;
      const value = company[key] || "";

      // Check if this is an image field either by our dynamic detection or by checking the special property
      const isImageField = imageFields.includes(key) || company[`__is_image_${key}`] === true;

      if (isImageField && value) {
        // Use a simpler approach - just use "Company" for logging
        const companyIdentifier = "Company";
        insertImageAtPlaceholder(newSlide, placeholder, value, companyIdentifier);
        Logger.log(`Processing image field: ${key} with value: ${value} for ${companyIdentifier}`);
      } else {
        newSlide.replaceAllText(placeholder, value);
      }
    });
    finalDeck.appendSlide(newSlide);
    newSlide.remove();
    // Log a more concise summary instead of the entire company object
    Logger.log(`Processed slide for company #${companies.indexOf(company) + 1}`);
  });
  Logger.log("Created slides for " + companies.length + " companies.");
}
