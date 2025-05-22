// ========================
// Error Wrapper Functions
// ========================

/**
 * Wrapper for processData that adds enhanced error handling
 * This function preserves the original processData functionality
 * but adds structured error handling
 * 
 * @param {Object} params - The parameters from the form
 * @return {Object} Result object with success or error information
 */
function processDataWithErrorHandling(params) {
  try {
    // Validate parameters
    const validationResult = validateParameters(params);
    if (validationResult.valid === false) {
      return validationResult; // Return validation error
    }
    
    // Call the original processData function
    const result = processData(params);
    
    // Check if the result indicates an error
    if (result && result.result === "Error") {
      // Try to map the error to our structured format
      return enhanceErrorResponse(result);
    }
    
    return result;
  } catch (error) {
    Logger.log("Error in processDataWithErrorHandling: " + error);
    return handleError("SYSTEM_ERROR", {}, error);
  }
}

/**
 * Validates the parameters before processing
 * 
 * @param {Object} params - The parameters from the form
 * @return {Object} Validation result
 */
function validateParameters(params) {
  try {
    // Check required parameters
    if (!params.airtableUrl) {
      return handleError("MISSING_AIRTABLE_URL");
    }
    
    // Extract and validate Airtable IDs
    const airtableData = extractAirtableIds(params.airtableUrl);
    if (!airtableData.baseId || !airtableData.tableId) {
      return handleError("INVALID_AIRTABLE_URL", { url: params.airtableUrl });
    }
    
    // Validate layout and corresponding URLs
    if (params.layout === "single") {
      if (!params.slidesSingle || !params.slidesSingle.templateUrl || !params.slidesSingle.finalUrl) {
        return handleError("MISSING_SLIDES_URLS", { layout: "single" });
      }
      
      const templateDeckId = extractSlideId(params.slidesSingle.templateUrl);
      const finalDeckId = extractSlideId(params.slidesSingle.finalUrl);
      
      if (!templateDeckId) {
        return handleError("INVALID_TEMPLATE_DECK", { url: params.slidesSingle.templateUrl });
      }
      
      if (!finalDeckId) {
        return handleError("INVALID_FINAL_DECK", { url: params.slidesSingle.finalUrl });
      }
    } else if (params.layout === "double") {
      if (!params.slidesDouble || !params.slidesDouble.templateUrl || !params.slidesDouble.finalUrl) {
        return handleError("MISSING_SLIDES_URLS", { layout: "double" });
      }
      
      const templateDeckId = extractSlideId(params.slidesDouble.templateUrl);
      const finalDeckId = extractSlideId(params.slidesDouble.finalUrl);
      
      if (!templateDeckId) {
        return handleError("INVALID_TEMPLATE_DECK", { url: params.slidesDouble.templateUrl });
      }
      
      if (!finalDeckId) {
        return handleError("INVALID_FINAL_DECK", { url: params.slidesDouble.finalUrl });
      }
    } else {
      return handleError("INVALID_LAYOUT", { layout: params.layout });
    }
    
    // Validate description fields
    if (params.descriptionFieldsData && params.descriptionFieldsData.length > 0) {
      for (let i = 0; i < params.descriptionFieldsData.length; i++) {
        const field = params.descriptionFieldsData[i];
        if (!field.fieldName || !field.prompt) {
          return handleError("DESCRIPTION_FIELD_MISMATCH", { 
            index: i + 1, 
            fieldName: field.fieldName, 
            hasPrompt: !!field.prompt 
          });
        }
      }
    }
    
    return { valid: true };
  } catch (error) {
    Logger.log("Error in validateParameters: " + error);
    return handleError("VALIDATION_ERROR", {}, error);
  }
}

/**
 * Enhances an error response from the original functions
 * to match our structured error format
 * 
 * @param {Object} errorResponse - The original error response
 * @return {Object} Enhanced error response
 */
function enhanceErrorResponse(errorResponse) {
  // If it's already in our format, return it
  if (errorResponse.errorCode && errorResponse.errorCategory) {
    return errorResponse;
  }
  
  // Try to map common error messages to our error types
  const errorMessage = errorResponse.message || "";
  
  if (errorMessage.includes("API key is not set")) {
    return handleError("MISSING_AIRTABLE_API_KEY");
  } else if (errorMessage.includes("No records")) {
    return handleError("NO_MATCHING_RECORDS");
  } else if (errorMessage.includes("Could not open")) {
    if (errorMessage.includes("template")) {
      return handleError("INVALID_TEMPLATE_DECK");
    } else {
      return handleError("INVALID_FINAL_DECK");
    }
  } else {
    // Generic error with the original message
    return {
      result: "Error",
      errorCode: 999,
      errorCategory: "System Error",
      errorMessage: errorResponse.message || "An unexpected error occurred",
      details: errorResponse
    };
  }
}
