/**
 * Template Requirements Definition
 *
 * This module defines the requirements for different slide templates.
 * It specifies what fields are needed for each template type.
 */

/**
 * Get template requirements for a specific template.
 *
 * @param {string} templateId - The ID or name of the template
 * @param {string} layout - The layout type (single, double)
 * @return {Object} Template requirements
 */
function getTemplateRequirements(templateId, layout) {
  // First check for specific template requirements by ID
  const specificRequirements = getSpecificTemplateRequirements(templateId);
  if (specificRequirements) {
    return specificRequirements;
  }

  // Fall back to layout-based requirements
  return getLayoutRequirements(layout);
}

/**
 * Get requirements for a specific template by ID.
 *
 * @param {string} templateId - The ID of the template
 * @return {Object|null} Template requirements or null if not found
 */
function getSpecificTemplateRequirements(templateId) {
  // Extract template name from URL if needed
  let templateName = templateId;
  if (templateId && templateId.includes('/')) {
    const parts = templateId.split('/');
    templateName = parts[parts.length - 2] || parts[parts.length - 1];
  }

  // Convert to lowercase for case-insensitive matching
  templateName = templateName.toLowerCase();

  // Template-specific requirements
  const specificRequirements = {
    // Example for a specific template
    'startup_pitch': {
      name: 'Pitch Deck Template',
      description: 'Template for pitch presentations',
      fields: [
        { name: 'name', description: 'Name or title', required: true },
        { name: 'tagline', description: 'Short tagline or slogan', required: false },
        { name: 'description', description: 'Brief description (50 words max)', required: true },
        { name: 'problem', description: 'Problem being addressed', required: true },
        { name: 'solution', description: 'Solution being offered', required: true },
        { name: 'model', description: 'Business or operational model', required: true },
        { name: 'market', description: 'Target market information', required: false },
        { name: 'competitors', description: 'Main competitors or alternatives', required: false },
        { name: 'team', description: 'Key team members', required: false },
        { name: 'status', description: 'Current status or stage', required: false },
        { name: 'contact', description: 'Contact information', required: false },
        { name: 'logo', description: 'Logo or main image', required: false }
      ]
    },
    'comparison': {
      name: 'Comparison Template',
      description: 'Template for comparing items',
      fields: [
        { name: 'title', description: 'Comparison title', required: true },
        { name: 'item1Name', description: 'Name of first item', required: true },
        { name: 'item1Description', description: 'Description of first item', required: true },
        { name: 'item1Image', description: 'Image of first item', required: false },
        { name: 'item2Name', description: 'Name of second item', required: true },
        { name: 'item2Description', description: 'Description of second item', required: true },
        { name: 'item2Image', description: 'Image of second item', required: false },
        { name: 'comparisonTable', description: 'Comparison table data', required: false }
      ]
    },
    // Add more specific templates as needed
  };

  // Check if we have specific requirements for this template
  for (const [key, requirements] of Object.entries(specificRequirements)) {
    if (templateName.includes(key)) {
      return requirements;
    }
  }

  return null;
}

/**
 * Get requirements based on layout type.
 *
 * @param {string} layout - The layout type (single, double)
 * @return {Object} Template requirements
 */
function getLayoutRequirements(layout) {
  // Default requirements for different layouts
  const layoutRequirements = {
    'single': {
      name: 'Single Item Template',
      description: 'Template for single item presentations',
      fields: [
        { name: 'name', description: 'Name or title of the item', required: true },
        { name: 'description', description: 'Brief description (50 words max)', required: true },
        { name: 'category', description: 'Category or type', required: false },
        { name: 'details', description: 'Additional details', required: false },
        { name: 'location', description: 'Location information', required: false },
        { name: 'date', description: 'Date or time information', required: false },
        { name: 'features', description: 'Key features or characteristics', required: false },
        { name: 'link', description: 'Related link or URL', required: false },
        { name: 'image', description: 'Image of the item', required: false }
      ]
    },
    'double': {
      name: 'Double Item Template',
      description: 'Template for comparing two items',
      fields: [
        { name: 'item1Name', description: 'Name of the first item', required: true },
        { name: 'item1Description', description: 'Brief description of first item', required: true },
        { name: 'item1Category', description: 'Category of first item', required: false },
        { name: 'item1Image', description: 'Image of the first item', required: false },
        { name: 'item2Name', description: 'Name of the second item', required: true },
        { name: 'item2Description', description: 'Brief description of second item', required: true },
        { name: 'item2Category', description: 'Category of second item', required: false },
        { name: 'item2Image', description: 'Image of the second item', required: false },
        { name: 'comparisonPoints', description: 'Key comparison points', required: false }
      ]
    },
    // Default fallback for unknown layouts
    'default': {
      name: 'Generic Template',
      description: 'Generic presentation template',
      fields: [
        { name: 'title', description: 'Slide title', required: true },
        { name: 'content', description: 'Slide content', required: true },
        { name: 'image', description: 'Slide image', required: false }
      ]
    }
  };

  return layoutRequirements[layout] || layoutRequirements['default'];
}

/**
 * Create template requirements from a Google Slides template by analyzing all text elements.
 * This function detects any text that could be a placeholder without requiring specific formatting.
 *
 * @param {string} templateId - The ID of the template slide deck
 * @return {Object} Generated template requirements with detailed slide context
 */
function createRequirementsFromTemplate(templateId) {
  try {
    // Open the template presentation
    const presentation = SlidesApp.openById(templateId);
    const slides = presentation.getSlides();

    // Store detailed information about each text element
    const textElements = [];
    const placeholders = new Set();

    // Track slide layouts and structure
    const slideStructure = [];

    slides.forEach((slide, slideIndex) => {
      const slideInfo = {
        slideIndex: slideIndex,
        slideNumber: slideIndex + 1,
        elements: []
      };

      // Check shapes for text
      const shapes = slide.getShapes();
      shapes.forEach((shape, shapeIndex) => {
        if (shape.getText) {
          const textRange = shape.getText();
          const text = textRange.asString();

          if (text.trim()) {
            // Store information about this text element
            const elementInfo = {
              type: 'shape',
              index: shapeIndex,
              text: text,
              isTitle: isLikelyTitle(shape, slideIndex),
              fontSize: getApproximateFontSize(textRange),
              isBold: hasStyleAttribute(textRange, 'BOLD'),
              isItalic: hasStyleAttribute(textRange, 'ITALIC'),
              position: getElementPosition(shape)
            };

            slideInfo.elements.push(elementInfo);
            textElements.push({
              slideIndex: slideIndex,
              element: elementInfo
            });

            // Look for potential placeholders
            identifyPotentialPlaceholders(text).forEach(placeholder => {
              placeholders.add(placeholder);
            });
          }
        }
      });

      // Check tables
      const tables = slide.getTables();
      tables.forEach((table, tableIndex) => {
        const numRows = table.getNumRows();
        const numCols = table.getNumColumns();

        const tableInfo = {
          type: 'table',
          index: tableIndex,
          rows: numRows,
          cols: numCols,
          cells: []
        };

        for (let row = 0; row < numRows; row++) {
          for (let col = 0; col < numCols; col++) {
            const cell = table.getCell(row, col);
            const textRange = cell.getText();
            const text = textRange.asString();

            if (text.trim()) {
              const cellInfo = {
                row: row,
                col: col,
                text: text,
                fontSize: getApproximateFontSize(textRange),
                isBold: hasStyleAttribute(textRange, 'BOLD'),
                isItalic: hasStyleAttribute(textRange, 'ITALIC')
              };

              tableInfo.cells.push(cellInfo);

              // Look for potential placeholders
              identifyPotentialPlaceholders(text).forEach(placeholder => {
                placeholders.add(placeholder);
              });
            }
          }
        }

        if (tableInfo.cells.length > 0) {
          slideInfo.elements.push(tableInfo);
        }
      });

      // Add this slide's information to the overall structure
      slideStructure.push(slideInfo);
    });

    // Convert placeholders to field requirements
    const fields = Array.from(placeholders).map(placeholder => {
      // Find examples of where this placeholder appears
      const examples = textElements.filter(item =>
        item.element.text.includes(placeholder)
      ).map(item => ({
        slideIndex: item.slideIndex,
        slideNumber: item.slideIndex + 1,
        context: item.element.text
      }));

      return {
        name: placeholder,
        description: `Replace "${placeholder}" in the template`,
        examples: examples.slice(0, 3), // Limit to 3 examples
        required: true
      };
    });

    return {
      name: presentation.getName(),
      description: 'Auto-detected template structure',
      slideCount: slides.length,
      fields: fields,
      slideStructure: slideStructure
    };

  } catch (error) {
    Logger.log('Error creating requirements from template: ' + error);
    // Return minimal requirements
    return {
      name: "Unknown Template",
      description: "Error analyzing template",
      fields: [],
      error: error.toString()
    };
  }
}

/**
 * Identify placeholders in text using the standardized {{field}} format.
 *
 * @param {string} text - The text to analyze
 * @return {Array} Array of placeholder strings (without the {{ }})
 */
function identifyPotentialPlaceholders(text) {
  const placeholders = [];

  // Only look for the standard {{...}} placeholder syntax
  const bracketMatches = text.match(/\{\{([^}]+)\}\}/g) || [];
  bracketMatches.forEach(match => {
    placeholders.push(match.replace(/\{\{|\}\}/g, '').trim());
  });

  return placeholders;
}

/**
 * Determine if a shape is likely to be a slide title based on position and formatting.
 *
 * @param {Shape} shape - The shape to analyze
 * @param {number} slideIndex - The index of the slide
 * @return {boolean} True if the shape is likely a title
 */
function isLikelyTitle(shape, slideIndex) {
  // Title shapes are usually at the top of the slide
  const top = shape.getTop();

  // First slide titles might be positioned differently
  const isFirstSlide = slideIndex === 0;

  // Check if the shape is in the top portion of the slide
  if (isFirstSlide) {
    return top < 150; // More lenient for first slide
  } else {
    return top < 100; // Typical title position
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
    // Try to get the font size from the first character
    return textRange.getTextStyle().getFontSize();
  } catch (e) {
    // Default size if we can't determine
    return 12;
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
 * Get the position information for an element.
 *
 * @param {Object} element - The element to get position for
 * @return {Object} Position information
 */
function getElementPosition(element) {
  try {
    return {
      left: element.getLeft(),
      top: element.getTop(),
      width: element.getWidth(),
      height: element.getHeight()
    };
  } catch (e) {
    return { left: 0, top: 0, width: 0, height: 0 };
  }
}
