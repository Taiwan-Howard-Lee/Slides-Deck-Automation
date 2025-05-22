
function slides_double(companies, templateDeckId, finalDeckId) {
  var templateDeck = SlidesApp.openById(templateDeckId);
  var finalDeck = SlidesApp.openById(finalDeckId);
  var templateSlide = templateDeck.getSlides()[0];
  const imageFields = ["Logo", "Logo2", "Product Screenshot", "Product Screenshot2", "Screenshot", "Screenshot2"];
  companies.forEach(company => {
    let newSlide = templateSlide.duplicate();
    Object.keys(company).forEach(key => {
      if (!imageFields.includes(key)) {
        const placeholder = `{{${key}}}`;
        const value = company[key] || "";
        newSlide.replaceAllText(placeholder, value);
      }
    });
    imageFields.forEach(fieldName => {
      if (company[fieldName]) {
        const placeholder = `{{${fieldName}}}`;
        const companyName = getCompanyNameForField(company, fieldName);
          insertImageAtPlaceholder(newSlide, placeholder, company[fieldName], companyName);
      }
    });
    finalDeck.appendSlide(newSlide);
    newSlide.remove();
    Logger.log("Processed slide for row: " + JSON.stringify(company));
  });
  Logger.log(`Created slides for ${companies.length} row(s).`);
}
