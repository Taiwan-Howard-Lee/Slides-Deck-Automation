

// ========================
// Google Slides Functions
// ========================

function insertImageAtPlaceholder(newSlide, placeholderText, imageUrl, companyName) {
  try {
    const pageElements = newSlide.getPageElements();
    for (let i = 0; i < pageElements.length; i++) {
      const element = pageElements[i];
      if (element.getPageElementType() === SlidesApp.PageElementType.SHAPE) {
        const shape = element.asShape();
        const text = shape.getText().asString();
        if (text.includes(placeholderText)) {
          const transform = element.getTransform();
          const left = transform.getTranslateX();
          const top = transform.getTranslateY();
          const width = element.getWidth();
          const height = element.getHeight();
          element.remove();
          const imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();
          newSlide.insertImage(imageBlob, left, top, width, height);
          Logger.log(`Inserted image '${placeholderText}' for ${companyName || "Unknown"} at (${left}, ${top}) with size ${width}x${height}`);
          break;
        }
      }
    }
  } catch (err) {
    Logger.log(`Error inserting image for ${companyName || "Unknown"}: ${err}`);
  }
}


function getCompanyNameForField(rowData, fieldName) {
  if (fieldName.endsWith("2") && rowData["[1.1] Company Name2"]) {
    return rowData["[1.1] Company Name2"];
  }
  return rowData["[1.1] Company Name"] || "Unknown";
}