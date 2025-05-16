
function slides_double(companies, templateDeckId, finalDeckId) {
  var templateDeck = SlidesApp.openById(templateDeckId);
  var finalDeck = SlidesApp.openById(finalDeckId);
  var templateSlide = templateDeck.getSlides()[0];

  // Get dynamically detected image fields from script properties
  let baseImageFields = [];
  try {
    const imageFieldsJson = PropertiesService.getScriptProperties().getProperty("IMAGE_FIELDS");
    if (imageFieldsJson) {
      baseImageFields = JSON.parse(imageFieldsJson);
      Logger.log("Using dynamically detected base image fields: " + baseImageFields.join(", "));
    }
  } catch (e) {
    Logger.log("Error parsing image fields: " + e);
    // No fallback to hardcoded fields - we'll rely on the __is_image_ property instead
    Logger.log("Will rely on __is_image_ properties for image field detection");
  }

  // Create the full list of image fields including the "2" versions
  const imageFields = [...baseImageFields];
  baseImageFields.forEach(field => {
    imageFields.push(field + "2");
  });
  Logger.log("Full list of image fields for double slides: " + imageFields.join(", "));

  companies.forEach(company => {
    let newSlide = templateSlide.duplicate();

    // First, handle all non-image fields
    Object.keys(company).forEach(key => {
      // Skip metadata fields
      if (key.startsWith("__is_image_")) return;

      // Check if this is an image field either by our dynamic detection or by checking the special property
      const isImageField = imageFields.includes(key) || company[`__is_image_${key}`] === true;

      if (!isImageField) {
        const placeholder = `{{${key}}}`;
        const value = company[key] || "";
        newSlide.replaceAllText(placeholder, value);
      }
    });

    // Then handle all image fields
    Object.keys(company).forEach(key => {
      // Skip metadata fields
      if (key.startsWith("__is_image_")) return;

      // Check if this is an image field either by our dynamic detection or by checking the special property
      const isImageField = imageFields.includes(key) || company[`__is_image_${key}`] === true;

      if (isImageField && company[key]) {
        const placeholder = `{{${key}}}`;
        // Use a simpler approach for company name - just use the field name for logging
        const fieldIdentifier = key.endsWith("2") ? "Company 2" : "Company 1";
        insertImageAtPlaceholder(newSlide, placeholder, company[key], fieldIdentifier);
        Logger.log(`Processing image field: ${key} with value: ${company[key]} for ${fieldIdentifier}`);
      }
    });

    finalDeck.appendSlide(newSlide);
    newSlide.remove();
    // Log a more concise summary instead of the entire company object
    Logger.log(`Processed slide for row #${companies.indexOf(company) + 1}`);
  });
  Logger.log(`Created slides for ${companies.length} row(s).`);
}
