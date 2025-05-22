function slides_single(companies, templateDeckId, finalDeckId) {
  var templateDeck = SlidesApp.openById(templateDeckId);
  var finalDeck = SlidesApp.openById(finalDeckId);
  var templateSlide = templateDeck.getSlides()[0];
  const imageFields = ["Logo", "Screenshot", "Product Screenshot"];
  companies.forEach(function(company) {
    let newSlide = templateSlide.duplicate();
    Object.keys(company).forEach(function(key) {
      if (key.endsWith("2")) return;
      const placeholder = `{{${key}}}`;
      const value = company[key] || "";
      if (imageFields.includes(key) && value) {
        insertImageAtPlaceholder(newSlide, placeholder, value, company["Name"] || "Unknown");
      } else {
        newSlide.replaceAllText(placeholder, value);
      }
    });
    finalDeck.appendSlide(newSlide);
    newSlide.remove();
    Logger.log("Processed slide for company: " + JSON.stringify(company));
  });
  Logger.log("Created slides for " + companies.length + " companies.");
}
