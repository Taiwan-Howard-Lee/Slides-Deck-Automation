

// ========================
// Google Slides Functions
// ========================

function insertImageAtPlaceholder(newSlide, placeholderText, imageUrl, companyName) {
  try {
    // Check if imageUrl is valid
    if (!imageUrl || imageUrl.trim() === "") {
      Logger.log(`Warning: Empty image URL for placeholder '${placeholderText}' for ${companyName || "Unknown"}`);
      return;
    }

    const pageElements = newSlide.getPageElements();
    let placeholderFound = false;

    for (let i = 0; i < pageElements.length; i++) {
      const element = pageElements[i];
      if (element.getPageElementType() === SlidesApp.PageElementType.SHAPE) {
        const shape = element.asShape();
        const text = shape.getText().asString();
        if (text.includes(placeholderText)) {
          placeholderFound = true;
          const transform = element.getTransform();
          const left = transform.getTranslateX();
          const top = transform.getTranslateY();
          const width = element.getWidth();
          const height = element.getHeight();
          element.remove();

          try {
            const imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();
            newSlide.insertImage(imageBlob, left, top, width, height);
            Logger.log(`Inserted image '${placeholderText}' for ${companyName || "Unknown"} at (${left}, ${top}) with size ${width}x${height}`);
          } catch (fetchErr) {
            Logger.log(`Error fetching image from URL ${imageUrl}: ${fetchErr}`);
          }
          break;
        }
      }
    }

    // Add explicit handling for when a placeholder is not found
    if (!placeholderFound) {
      Logger.log(`Warning: Placeholder '${placeholderText}' not found in slide for ${companyName || "Unknown"}`);
    }
  } catch (err) {
    Logger.log(`Error inserting image for ${companyName || "Unknown"}: ${err}`);
  }
}

