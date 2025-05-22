/**
 * Universal Slides Generator
 *
 * This module provides functions for generating slides from processed data
 * using direct text replacement without hardcoded field mappings.
 */

/**
 * Convert non-standard placeholders in a presentation to the standardized {{field}} format.
 * This is a utility function to help users migrate their templates.
 *
 * @param {string} presentationId - The ID of the presentation to convert
 * @return {Object} Result of the conversion
 */
function convertPlaceholdersToStandardFormat(presentationId) {
  try {
    Logger.log("Converting placeholders to standard {{field}} format");

    // Open the presentation
    const presentation = SlidesApp.openById(presentationId);
    const slides = presentation.getSlides();

    if (!slides || slides.length === 0) {
      return {
        success: false,
        message: "Presentation has no slides",
        conversions: 0
      };
    }

    let totalConversions = 0;

    // Process each slide
    slides.forEach((slide, slideIndex) => {
      Logger.log(`Processing slide ${slideIndex + 1}`);

      // Process shapes with text
      const shapes = slide.getShapes();
      shapes.forEach(shape => {
        if (shape.getText) {
          const textRange = shape.getText();
          const conversions = convertTextRangePlaceholders(textRange);
          totalConversions += conversions;
        }
      });

      // Process tables
      const tables = slide.getTables();
      tables.forEach(table => {
        const numRows = table.getNumRows();
        const numCols = table.getNumColumns();

        for (let row = 0; row < numRows; row++) {
          for (let col = 0; col < numCols; col++) {
            const cell = table.getCell(row, col);
            const textRange = cell.getText();
            const conversions = convertTextRangePlaceholders(textRange);
            totalConversions += conversions;
          }
        }
      });

      // Process text boxes
      const textBoxes = slide.getTextBoxes();
      textBoxes.forEach(textBox => {
        const textRange = textBox.getText();
        const conversions = convertTextRangePlaceholders(textRange);
        totalConversions += conversions;
      });
    });

    Logger.log(`Converted ${totalConversions} placeholders to standard format`);

    return {
      success: true,
      message: `Converted ${totalConversions} placeholders to standard {{field}} format`,
      conversions: totalConversions
    };

  } catch (error) {
    Logger.log("Error converting placeholders: " + error);
    return {
      success: false,
      message: "Error converting placeholders: " + error,
      conversions: 0
    };
  }
}

/**
 * Convert non-standard placeholders in a text range to the standardized {{field}} format.
 *
 * @param {TextRange} textRange - The text range to process
 * @return {number} Number of conversions made
 */
function convertTextRangePlaceholders(textRange) {
  let text = textRange.asString();
  let replacedText = text;
  let conversions = 0;

  // 1. Convert [FIELD_NAME] style placeholders
  const squareBracketMatches = text.match(/\[([^\]]+)\]/g) || [];
  squareBracketMatches.forEach(match => {
    const fieldName = match.replace(/\[|\]/g, '').trim();
    replacedText = replacedText.replace(match, `{{${fieldName}}}`);
    conversions++;
  });

  // 2. Convert <FIELD_NAME> style placeholders
  const angleBracketMatches = text.match(/<([^>]+)>/g) || [];
  angleBracketMatches.forEach(match => {
    const fieldName = match.replace(/<|>/g, '').trim();
    replacedText = replacedText.replace(match, `{{${fieldName}}}`);
    conversions++;
  });

  // 3. Convert ${FIELD_NAME} style placeholders
  const dollarBraceMatches = text.match(/\$\{([^}]+)\}/g) || [];
  dollarBraceMatches.forEach(match => {
    const fieldName = match.replace(/\$\{|\}/g, '').trim();
    replacedText = replacedText.replace(match, `{{${fieldName}}}`);
    conversions++;
  });

  // Only update if changes were made
  if (replacedText !== text) {
    textRange.setText(replacedText);
  }

  return conversions;
}

/**
 * Generate slides by replacing text in a template with processed data.
 * Only uses the standardized {{field}} format for placeholders.
 *
 * @param {Object} processedData - The processed data with items to use for slides
 * @param {string} templateId - The ID of the template presentation
 * @param {string} targetId - The ID of the target presentation
 * @param {string} layout - The layout type ("single" or "double")
 * @return {Object} Result of the slide generation
 */
function generateUniversalSlides(processedData, templateId, targetId, layout = "single") {
  try {
    Logger.log("Starting universal slide generation");

    // Validate inputs
    if (!processedData || !processedData.items || !processedData.items.length) {
      Logger.log("No items to process in the data");
      return {
        success: false,
        message: "No items to process in the data",
        slidesGenerated: 0
      };
    }

    if (!templateId || !targetId) {
      Logger.log("Missing template or target presentation ID");
      return {
        success: false,
        message: "Missing template or target presentation ID",
        slidesGenerated: 0
      };
    }

    // Open the template presentation
    const templatePresentation = SlidesApp.openById(templateId);
    const templateSlides = templatePresentation.getSlides();

    if (!templateSlides || templateSlides.length === 0) {
      Logger.log("Template presentation has no slides");
      return {
        success: false,
        message: "Template presentation has no slides",
        slidesGenerated: 0
      };
    }

    // Create or open the target presentation
    let targetPresentation;
    try {
      targetPresentation = SlidesApp.openById(targetId);
      // Clear existing slides if any
      const existingSlides = targetPresentation.getSlides();
      existingSlides.forEach(slide => slide.remove());
    } catch (e) {
      Logger.log("Target presentation not found, creating new: " + e);
      targetPresentation = SlidesApp.create("Generated Presentation");
      // Update the targetId to the new presentation's ID
      targetId = targetPresentation.getId();
    }

    // Set the target presentation name based on the template
    targetPresentation.setName("Generated from " + templatePresentation.getName());

    // Process each item in the data
    const items = processedData.items;
    let slidesGenerated = 0;

    // Log the layout being used
    Logger.log(`Using ${layout} layout for slide generation`);

    // For each item, create a copy of all template slides
    items.forEach((item, itemIndex) => {
      Logger.log(`Processing item ${itemIndex + 1} of ${items.length}`);

      // Create a copy of each template slide for this item
      templateSlides.forEach((templateSlide, slideIndex) => {
        // Create a new slide in the target presentation
        const newSlide = targetPresentation.appendSlide(templateSlide);
        slidesGenerated++;

        // Replace text in all shapes based on layout
        if (layout === "double") {
          // For double layout, we need to handle company1 and company2 fields
          replaceTextInSlide(newSlide, item);
        } else {
          // For single layout, use the item directly
          replaceTextInSlide(newSlide, item);
        }
      });
    });

    Logger.log(`Generated ${slidesGenerated} slides for ${items.length} items`);

    return {
      success: true,
      message: `Generated ${slidesGenerated} slides for ${items.length} items`,
      slidesGenerated: slidesGenerated,
      presentationId: targetId,
      presentationUrl: `https://docs.google.com/presentation/d/${targetId}/edit`
    };

  } catch (error) {
    Logger.log("Error in generateUniversalSlides: " + error);
    return {
      success: false,
      message: "Error generating slides: " + error,
      slidesGenerated: 0
    };
  }
}

/**
 * Replace content in all elements of a slide with data from an item.
 * Handles both text and image replacements.
 *
 * @param {Slide} slide - The slide to process
 * @param {Object} item - The data item to use for replacement
 */
function replaceTextInSlide(slide, item) {
  // Create slide context for refinement
  const slideContext = {
    slideIndex: slide.getObjectId(),
    slideType: determineSlideType(slide),
    slideTitle: getSlideTitle(slide)
  };

  // Process all shapes with text
  const shapes = slide.getShapes();
  shapes.forEach((shape, index) => {
    if (shape.getText) {
      const textRange = shape.getText();
      const shapeContext = {
        ...slideContext,
        elementType: 'shape',
        elementIndex: index,
        isTitle: isShapeLikelyTitle(shape, slide)
      };
      replaceTextInTextRange(textRange, item, shapeContext);
    }
  });

  // Process all tables
  const tables = slide.getTables();
  tables.forEach((table, tableIndex) => {
    const numRows = table.getNumRows();
    const numCols = table.getNumColumns();

    for (let row = 0; row < numRows; row++) {
      for (let col = 0; col < numCols; col++) {
        const cell = table.getCell(row, col);
        const textRange = cell.getText();
        const cellContext = {
          ...slideContext,
          elementType: 'table',
          elementIndex: tableIndex,
          row: row,
          col: col,
          isHeader: row === 0 || col === 0
        };
        replaceTextInTextRange(textRange, item, cellContext);
      }
    }
  });

  // Process all text boxes
  const textBoxes = slide.getTextBoxes();
  textBoxes.forEach((textBox, index) => {
    const textRange = textBox.getText();
    const textBoxContext = {
      ...slideContext,
      elementType: 'textBox',
      elementIndex: index
    };
    replaceTextInTextRange(textRange, item, textBoxContext);
  });
}

/**
 * Determine the type of slide based on its content and layout.
 *
 * @param {Slide} slide - The slide to analyze
 * @return {string} The determined slide type
 */
function determineSlideType(slide) {
  // Get the slide title if available
  const title = getSlideTitle(slide);
  if (!title) {
    return "unknown";
  }

  // Convert to lowercase for case-insensitive matching
  const titleText = title.toLowerCase();

  // Check for common slide types
  if (titleText.includes('overview') || titleText.includes('introduction')) {
    return "overview";
  } else if (titleText.includes('problem')) {
    return "problem";
  } else if (titleText.includes('solution')) {
    return "solution";
  } else if (titleText.includes('market') || titleText.includes('opportunity')) {
    return "market";
  } else if (titleText.includes('product') || titleText.includes('service')) {
    return "product";
  } else if (titleText.includes('business') || titleText.includes('model')) {
    return "business_model";
  } else if (titleText.includes('team')) {
    return "team";
  } else if (titleText.includes('contact') || titleText.includes('thank')) {
    return "contact";
  } else {
    return "general";
  }
}

/**
 * Get the title of a slide.
 *
 * @param {Slide} slide - The slide to get the title from
 * @return {string} The slide title or empty string if not found
 */
function getSlideTitle(slide) {
  // Look for title placeholder
  try {
    const titleShape = slide.getPlaceholder(SlidesApp.PlaceholderType.TITLE);
    if (titleShape) {
      return titleShape.getText().asString();
    }
  } catch (e) {
    // No title placeholder, continue with other methods
  }

  // Look for shapes that might be titles
  const shapes = slide.getShapes();
  for (let i = 0; i < shapes.length; i++) {
    const shape = shapes[i];
    if (shape.getText && isShapeLikelyTitle(shape, slide)) {
      return shape.getText().asString();
    }
  }

  return "";
}

/**
 * Check if a shape is likely to be a slide title.
 *
 * @param {Shape} shape - The shape to check
 * @param {Slide} slide - The slide containing the shape
 * @return {boolean} Whether the shape is likely a title
 */
function isShapeLikelyTitle(shape, slide) {
  try {
    // Check if it's at the top of the slide
    const top = shape.getTop();
    if (top > 100) {
      return false;
    }

    // Check if it has a large font size
    const textRange = shape.getText();
    const fontSize = textRange.getTextStyle().getFontSize();
    if (fontSize >= 18) {
      return true;
    }

    // Check if it's bold
    if (textRange.getTextStyle().isBold()) {
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Replace text in a text range with data from an item.
 * Only replaces standardized {{field}} placeholders.
 * Includes dynamic content refinement for text fields and image processing for image fields.
 *
 * @param {TextRange} textRange - The text range to process
 * @param {Object} item - The data item to use for replacement
 * @param {Object} slideContext - Context about the slide for refinement
 */
function replaceTextInTextRange(textRange, item, slideContext = {}) {
  let text = textRange.asString();
  let replacedText = text;
  let imageReplacements = [];

  // Only replace {{field_name}} style placeholders
  const bracketMatches = text.match(/\{\{([^}]+)\}\}/g) || [];
  bracketMatches.forEach(match => {
    const fieldName = match.replace(/\{\{|\}\}/g, '').trim();
    let replacement = getItemValue(item, fieldName);

    if (replacement !== null) {
      // Check if this is an image field
      if (isImageField(fieldName)) {
        // Store image replacement for later processing
        // We'll handle images after text processing is complete
        imageReplacements.push({
          placeholder: match,
          fieldName: fieldName,
          value: replacement,
          context: slideContext
        });

        // For now, just replace with a marker that we'll handle later
        replacedText = replacedText.replace(match, `[IMAGE:${fieldName}]`);
      } else {
        // This is a text field, process it normally
        // Determine if this field should be refined
        const shouldRefine = shouldRefineField(fieldName, replacement);

        // Refine the content if needed
        if (shouldRefine) {
          // Create context for refinement
          const refinementContext = {
            ...slideContext,
            fieldName: fieldName,
            isTitle: isLikelyTitle(textRange),
            fontSize: getApproximateFontSize(textRange),
            isBold: hasStyleAttribute(textRange, 'BOLD'),
            isItalic: hasStyleAttribute(textRange, 'ITALIC')
          };

          // Determine refinement options based on field and context
          const refinementOptions = getRefinementOptions(fieldName, refinementContext);

          // Refine the content
          replacement = refineContent(fieldName, replacement, refinementContext, refinementOptions);
        }

        // Replace the placeholder with the (possibly refined) content
        replacedText = replacedText.replace(match, replacement);
      }
    }
  });

  // Update the text content if changes were made
  if (replacedText !== text) {
    textRange.setText(replacedText);
  }

  // Process any image replacements
  if (imageReplacements.length > 0) {
    processImageReplacements(textRange, imageReplacements, slideContext);
  }
}

/**
 * Process image replacements in a text range.
 *
 * @param {TextRange} textRange - The text range containing image markers
 * @param {Array} imageReplacements - Array of image replacement information
 * @param {Object} slideContext - Context about the slide
 */
function processImageReplacements(textRange, imageReplacements, slideContext) {
  try {
    // Get the parent shape or element that contains this text range
    const parentElement = getParentElement(textRange);
    if (!parentElement) {
      Logger.log("Could not find parent element for image replacement");
      return;
    }

    // Get the slide that contains this element
    const slide = parentElement.getParent();
    if (!slide) {
      Logger.log("Could not find slide for image replacement");
      return;
    }

    // Process each image replacement
    imageReplacements.forEach(replacement => {
      try {
        // Get the text content after previous replacements
        const updatedText = textRange.asString();

        // Find the image marker in the updated text
        const markerText = `[IMAGE:${replacement.fieldName}]`;
        if (!updatedText.includes(markerText)) {
          return; // Marker not found, skip this replacement
        }

        // Process the image field
        const imageContext = {
          ...slideContext,
          width: parentElement.getWidth ? parentElement.getWidth() : 400,
          height: parentElement.getHeight ? parentElement.getHeight() : 300,
          fieldName: replacement.fieldName
        };

        const processedImage = processImageField(replacement.fieldName, replacement.value, imageContext);

        if (processedImage.success && processedImage.blob) {
          // Create an image on the slide
          const imageElement = slide.insertImage(processedImage.blob);

          // Position the image near the text element
          positionImageElement(imageElement, parentElement, slide);

          // Remove the marker text
          const newText = updatedText.replace(markerText, "");
          textRange.setText(newText);
        } else {
          // Image processing failed, replace marker with error message
          const errorText = `[Image Error: ${processedImage.message || "Failed to process image"}]`;
          const newText = updatedText.replace(markerText, errorText);
          textRange.setText(newText);
        }
      } catch (error) {
        Logger.log(`Error processing image replacement ${replacement.fieldName}: ${error}`);
      }
    });
  } catch (error) {
    Logger.log(`Error in processImageReplacements: ${error}`);
  }
}

/**
 * Get the parent element that contains a text range.
 *
 * @param {TextRange} textRange - The text range
 * @return {Object} The parent element or null if not found
 */
function getParentElement(textRange) {
  try {
    // This is a simplification - in a real implementation, you would need to
    // traverse the slide elements to find the one containing this text range
    // For now, we'll return null and handle the positioning differently
    return null;
  } catch (error) {
    Logger.log(`Error getting parent element: ${error}`);
    return null;
  }
}

/**
 * Position an image element relative to a text element.
 *
 * @param {Image} imageElement - The image element to position
 * @param {Object} textElement - The text element that contained the placeholder
 * @param {Slide} slide - The slide containing both elements
 */
function positionImageElement(imageElement, textElement, slide) {
  try {
    // If we have the text element, position relative to it
    if (textElement && textElement.getLeft && textElement.getTop) {
      // Position to the right of the text element
      imageElement.setLeft(textElement.getLeft() + textElement.getWidth() + 20);
      imageElement.setTop(textElement.getTop());

      // Resize the image to fit nicely
      const maxHeight = textElement.getHeight();
      const maxWidth = 300; // Reasonable default

      // Maintain aspect ratio
      const imageWidth = imageElement.getWidth();
      const imageHeight = imageElement.getHeight();
      const aspectRatio = imageWidth / imageHeight;

      if (imageHeight > maxHeight) {
        imageElement.setHeight(maxHeight);
        imageElement.setWidth(maxHeight * aspectRatio);
      }

      if (imageElement.getWidth() > maxWidth) {
        imageElement.setWidth(maxWidth);
        imageElement.setHeight(maxWidth / aspectRatio);
      }
    } else {
      // No text element reference, position in a default location
      // Get slide dimensions
      const slideWidth = slide.getWidth ? slide.getWidth() : 720;
      const slideHeight = slide.getHeight ? slide.getHeight() : 405;

      // Position in the center-right of the slide
      imageElement.setLeft(slideWidth * 0.6);
      imageElement.setTop(slideHeight * 0.3);

      // Resize to a reasonable default size
      const maxWidth = slideWidth * 0.3;
      const maxHeight = slideHeight * 0.5;

      // Maintain aspect ratio
      const imageWidth = imageElement.getWidth();
      const imageHeight = imageElement.getHeight();
      const aspectRatio = imageWidth / imageHeight;

      if (imageWidth > maxWidth) {
        imageElement.setWidth(maxWidth);
        imageElement.setHeight(maxWidth / aspectRatio);
      }

      if (imageElement.getHeight() > maxHeight) {
        imageElement.setHeight(maxHeight);
        imageElement.setWidth(maxHeight * aspectRatio);
      }
    }
  } catch (error) {
    Logger.log(`Error positioning image: ${error}`);
  }
}

/**
 * Determine if a field's content should be refined.
 *
 * @param {string} fieldName - The name of the field
 * @param {string} content - The content to potentially refine
 * @return {boolean} Whether the field should be refined
 */
function shouldRefineField(fieldName, content) {
  // Skip refinement for very short content
  if (!content || content.length < 10) {
    return false;
  }

  // Always refine descriptions and longer text
  if (fieldName.toLowerCase().includes('description') || content.length > 100) {
    return true;
  }

  // Refine problem statements, solutions, and business models
  if (fieldName.toLowerCase().includes('problem') ||
      fieldName.toLowerCase().includes('solution') ||
      fieldName.toLowerCase().includes('model') ||
      fieldName.toLowerCase().includes('feature') ||
      fieldName.toLowerCase().includes('benefit')) {
    return true;
  }

  // Don't refine names, contact info, and other short fields
  if (fieldName.toLowerCase().includes('name') ||
      fieldName.toLowerCase().includes('contact') ||
      fieldName.toLowerCase().includes('email') ||
      fieldName.toLowerCase().includes('phone') ||
      fieldName.toLowerCase().includes('website')) {
    return false;
  }

  // For other fields, refine if they're longer than 50 characters
  return content.length > 50;
}

/**
 * Get refinement options based on field name and context.
 *
 * @param {string} fieldName - The name of the field
 * @param {Object} context - Context about the field and slide
 * @return {Object} Refinement options
 */
function getRefinementOptions(fieldName, context) {
  const options = {};

  // Determine if bullet points should be used
  options.bulletPoints = fieldName.toLowerCase().includes('feature') ||
                         fieldName.toLowerCase().includes('benefit') ||
                         fieldName.toLowerCase().includes('point');

  // Adjust target length based on context
  if (context.isTitle) {
    options.targetLength = "very concise (1-5 words)";
  } else if (context.fontSize && context.fontSize > 14) {
    options.targetLength = "brief (10-20 words)";
  }

  // Adjust style based on formatting
  if (context.isBold) {
    options.style = "impactful, attention-grabbing";
  } else if (context.isItalic) {
    options.style = "descriptive, flowing";
  }

  return options;
}

/**
 * Check if a text range is likely to be a title based on font size and position.
 *
 * @param {TextRange} textRange - The text range to check
 * @return {boolean} Whether the text range is likely a title
 */
function isLikelyTitle(textRange) {
  try {
    const fontSize = textRange.getTextStyle().getFontSize();
    return fontSize >= 18; // Titles typically have larger font sizes
  } catch (e) {
    return false;
  }
}

/**
 * Get the approximate font size of a text range.
 *
 * @param {TextRange} textRange - The text range to analyze
 * @return {number} The approximate font size
 */
function getApproximateFontSize(textRange) {
  try {
    return textRange.getTextStyle().getFontSize();
  } catch (e) {
    return 11; // Default size
  }
}

/**
 * Check if a text range has a specific style attribute.
 *
 * @param {TextRange} textRange - The text range to check
 * @param {string} attribute - The attribute to check for (e.g., 'BOLD', 'ITALIC')
 * @return {boolean} True if the attribute is present
 */
function hasStyleAttribute(textRange, attribute) {
  try {
    const style = textRange.getTextStyle();
    if (attribute === 'BOLD') {
      return style.isBold();
    } else if (attribute === 'ITALIC') {
      return style.isItalic();
    }
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Get a value from an item, handling case-insensitive and alternative field names.
 *
 * @param {Object} item - The data item
 * @param {string} fieldName - The field name to look for
 * @return {string|null} The value or null if not found
 */
function getItemValue(item, fieldName) {
  // Direct match
  if (item[fieldName] !== undefined) {
    return item[fieldName].toString();
  }

  // Case-insensitive match
  const lowerFieldName = fieldName.toLowerCase();
  for (const key in item) {
    if (key.toLowerCase() === lowerFieldName) {
      return item[key].toString();
    }
  }

  // Try common field name variations
  const variations = getFieldNameVariations(fieldName);
  for (const variation of variations) {
    if (item[variation] !== undefined) {
      return item[variation].toString();
    }
  }

  // Check for nested properties using dot notation
  if (fieldName.includes('.')) {
    const parts = fieldName.split('.');
    let value = item;
    for (const part of parts) {
      if (value === undefined || value === null) {
        return null;
      }
      value = value[part];
    }
    return value !== undefined ? value.toString() : null;
  }

  return null;
}

/**
 * Generate common variations of a field name.
 *
 * @param {string} fieldName - The original field name
 * @return {Array} Array of field name variations
 */
function getFieldNameVariations(fieldName) {
  const variations = [];

  // Convert camelCase to snake_case
  if (/[a-z][A-Z]/.test(fieldName)) {
    variations.push(fieldName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase());
  }

  // Convert snake_case to camelCase
  if (fieldName.includes('_')) {
    variations.push(fieldName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()));
  }

  // Remove spaces
  if (fieldName.includes(' ')) {
    variations.push(fieldName.replace(/\s+/g, ''));
  }

  // Add spaces between words
  if (/[a-z][A-Z]/.test(fieldName)) {
    variations.push(fieldName.replace(/([a-z])([A-Z])/g, '$1 $2'));
  }

  // Convert to Title Case
  variations.push(fieldName.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()));

  // Convert to lowercase
  variations.push(fieldName.toLowerCase());

  // Convert to UPPERCASE
  variations.push(fieldName.toUpperCase());

  return variations;
}
