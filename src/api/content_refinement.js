/**
 * Content Refinement Module
 *
 * This module provides functions for refining content using LLM before inserting it into slides.
 * It dynamically refines any field content based on context and requirements.
 */

/**
 * Refine content for a specific field using LLM.
 *
 * @param {string} fieldName - The name of the field being refined
 * @param {string} content - The original content to refine
 * @param {Object} context - Additional context about the field and slide
 * @param {Object} options - Refinement options
 * @return {string} The refined content
 */
function refineContent(fieldName, content, context = {}, options = {}) {
  // Skip refinement for empty content
  if (!content || content.trim() === '') {
    return content;
  }

  // Skip refinement for very short content unless forced
  if (content.length < 20 && !options.forceRefinement) {
    return content;
  }

  // Create a prompt for the LLM to refine the content
  const prompt = createRefinementPrompt(fieldName, content, context, options);

  // Define the system instruction for content refinement
  const systemInstruction = "You are a content refinement expert that improves text for presentations. " +
    "Your task is to refine and optimize content to make it more concise, impactful, and suitable for slides. " +
    "Maintain the core information while making it more presentable.";

  // Process with LLM
  try {
    const refinedContent = aiAPICalling(prompt, systemInstruction);

    // Log the refinement
    Logger.log(`Refined content for field: ${fieldName}`);

    return refinedContent.trim();
  } catch (error) {
    // If refinement fails, return the original content
    Logger.log(`Error refining content for field ${fieldName}: ${error}`);
    return content;
  }
}

/**
 * Create a prompt for content refinement.
 *
 * @param {string} fieldName - The name of the field being refined
 * @param {string} content - The original content to refine
 * @param {Object} context - Additional context about the field and slide
 * @param {Object} options - Refinement options
 * @return {string} The prompt for the LLM
 */
function createRefinementPrompt(fieldName, content, context, options) {
  // Determine the content type based on field name
  const contentType = determineContentType(fieldName);

  // Determine target length based on content type and options
  const targetLength = determineTargetLength(contentType, content.length, options);

  // Determine style based on content type and options
  const style = options.style || determineStyle(contentType);

  return `
# Content Refinement Task

## Original Content (Field: ${fieldName})
"""
${content}
"""

## Content Type
${contentType}

## Refinement Instructions
Please refine this content to make it more suitable for a presentation slide:

1. Make it ${targetLength}
2. Use a ${style} style
3. Maintain the core information and key points
4. Optimize for visual presentation and impact
5. Ensure it fits well on a slide
${options.bulletPoints ? "6. Format as bullet points where appropriate" : ""}
${options.additionalInstructions ? "7. " + options.additionalInstructions : ""}

## Output
Provide ONLY the refined content, with no explanations or additional text.
`;
}

/**
 * Determine the content type based on field name.
 * Uses generic content types rather than domain-specific ones.
 *
 * @param {string} fieldName - The name of the field
 * @return {string} The determined content type
 */
function determineContentType(fieldName) {
  // Convert to lowercase for case-insensitive matching
  const field = fieldName.toLowerCase();

  // Check for common field patterns and map to generic content types
  if (field.includes('description') || field.includes('about') || field.includes('summary')) {
    return "Long Description";
  } else if (field.includes('name') || field.includes('title') || field.endsWith('id')) {
    return "Short Identifier";
  } else if (field.includes('problem') || field.includes('challenge') || field.includes('issue')) {
    return "Problem Statement";
  } else if (field.includes('solution') || field.includes('approach') || field.includes('method')) {
    return "Solution Description";
  } else if (field.includes('model') || field.includes('process') || field.includes('system')) {
    return "Process Description";
  } else if (field.includes('market') || field.includes('industry') || field.includes('sector')) {
    return "Market Information";
  } else if (field.includes('competitor') || field.includes('alternative') || field.includes('comparison')) {
    return "Comparative Information";
  } else if (field.includes('team') || field.includes('member') || field.includes('staff') || field.includes('employee')) {
    return "People Information";
  } else if (field.includes('contact') || field.includes('email') || field.includes('phone') || field.includes('address')) {
    return "Contact Information";
  } else if (field.includes('feature') || field.includes('benefit') || field.includes('advantage') || field.includes('capability')) {
    return "Features/Benefits";
  } else if (field.includes('stat') || field.includes('metric') || field.includes('number') || field.includes('percentage')) {
    return "Numerical Data";
  } else if (field.includes('date') || field.includes('time') || field.includes('schedule') || field.includes('deadline')) {
    return "Temporal Information";
  } else if (field.includes('location') || field.includes('place') || field.includes('region') || field.includes('country')) {
    return "Location Information";
  } else {
    return "General Information";
  }
}

/**
 * Determine the target length for the refined content.
 * Uses generic content types rather than domain-specific ones.
 *
 * @param {string} contentType - The type of content
 * @param {number} originalLength - The length of the original content
 * @param {Object} options - Refinement options
 * @return {string} Description of the target length
 */
function determineTargetLength(contentType, originalLength, options) {
  // Use explicit length if provided in options
  if (options.targetLength) {
    return options.targetLength;
  }

  // Default target lengths based on content type
  switch (contentType) {
    case "Short Identifier":
      return "concise (1-5 words)";
    case "Long Description":
      return "brief but comprehensive (30-50 words)";
    case "Problem Statement":
      return "clear and concise (20-40 words)";
    case "Solution Description":
      return "focused and clear (30-50 words)";
    case "Process Description":
      return "concise (20-30 words)";
    case "Market Information":
      return "data-focused (30-40 words)";
    case "Comparative Information":
      return "brief but insightful (30-40 words)";
    case "People Information":
      return "brief highlights (20-30 words)";
    case "Contact Information":
      return "essential only (10-20 words)";
    case "Features/Benefits":
      return "bullet-point friendly (30-50 words)";
    case "Numerical Data":
      return "precise and concise (10-20 words)";
    case "Temporal Information":
      return "clear and specific (10-20 words)";
    case "Location Information":
      return "specific and concise (10-20 words)";
    case "General Information":
    default:
      // For general content, aim for 60-70% of original length
      const targetWords = Math.max(20, Math.round(originalLength * 0.6 / 5));
      return `concise (about ${targetWords} words)`;
  }
}

/**
 * Determine the appropriate style for the content.
 * Uses generic content types rather than domain-specific ones.
 *
 * @param {string} contentType - The type of content
 * @return {string} The appropriate style
 */
function determineStyle(contentType) {
  switch (contentType) {
    case "Short Identifier":
      return "bold, attention-grabbing";
    case "Long Description":
      return "professional, clear";
    case "Problem Statement":
      return "direct, compelling";
    case "Solution Description":
      return "confident, solution-oriented";
    case "Process Description":
      return "straightforward, structured";
    case "Market Information":
      return "data-driven, factual";
    case "Comparative Information":
      return "analytical, comparative";
    case "People Information":
      return "professional, achievement-focused";
    case "Contact Information":
      return "clear, straightforward";
    case "Features/Benefits":
      return "benefit-oriented, impactful";
    case "Numerical Data":
      return "precise, data-focused";
    case "Temporal Information":
      return "chronological, clear";
    case "Location Information":
      return "specific, contextual";
    case "General Information":
    default:
      return "professional, concise";
  }
}
