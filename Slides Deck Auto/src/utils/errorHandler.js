// ========================
// Error Handling Module
// ========================

/**
 * Error classification system for better organization and user feedback
 */
const ErrorTypes = {
  CONFIGURATION: {
    code: 100,
    category: "Configuration Error"
  },
  AIRTABLE: {
    code: 200,
    category: "Airtable Integration Error"
  },
  SPREADSHEET: {
    code: 300,
    category: "Spreadsheet Operation Error"
  },
  AI_API: {
    code: 400,
    category: "AI API Error"
  },
  SLIDES: {
    code: 500,
    category: "Google Slides Error"
  },
  VALIDATION: {
    code: 600,
    category: "Input Validation Error"
  },
  SYSTEM: {
    code: 700,
    category: "System Error"
  }
};

/**
 * Specific error definitions with user-friendly messages and resolution hints
 */
const ErrorDefinitions = {
  // Configuration errors
  MISSING_AIRTABLE_API_KEY: {
    ...ErrorTypes.CONFIGURATION,
    code: 101,
    message: "Airtable API key is not configured",
    userMessage: "The Airtable API key is missing. Please contact the administrator to set up the API key.",
    resolution: "Set the AIRTABLE_API key in Script Properties"
  },
  MISSING_AI_API_KEYS: {
    ...ErrorTypes.CONFIGURATION,
    code: 102,
    message: "No valid Gemini API keys found",
    userMessage: "AI processing is unavailable due to missing API keys. Please contact the administrator.",
    resolution: "Set at least one GEMINI_API_KEY in Script Properties"
  },
  
  // Airtable errors
  MISSING_AIRTABLE_URL: {
    ...ErrorTypes.AIRTABLE,
    code: 201,
    message: "Airtable URL is missing",
    userMessage: "Please provide an Airtable URL to continue.",
    resolution: "Enter a valid Airtable URL in the form"
  },
  INVALID_AIRTABLE_URL: {
    ...ErrorTypes.AIRTABLE,
    code: 202,
    message: "Could not extract Base ID or Table ID from Airtable URL",
    userMessage: "The Airtable URL format is invalid. Please provide a valid Airtable URL.",
    resolution: "Use the URL from your Airtable browser address bar"
  },
  AIRTABLE_AUTHENTICATION_ERROR: {
    ...ErrorTypes.AIRTABLE,
    code: 203,
    message: "Airtable authentication failed",
    userMessage: "Could not authenticate with Airtable. The API key may be invalid or expired.",
    resolution: "Check and update the Airtable API key"
  },
  AIRTABLE_RESOURCE_NOT_FOUND: {
    ...ErrorTypes.AIRTABLE,
    code: 204,
    message: "Airtable base or table not found",
    userMessage: "The specified Airtable base or table could not be found. Please check the URL.",
    resolution: "Verify the Airtable URL is correct and accessible"
  },
  AIRTABLE_RATE_LIMIT: {
    ...ErrorTypes.AIRTABLE,
    code: 205,
    message: "Airtable rate limit exceeded",
    userMessage: "Too many requests to Airtable. Please try again in a few minutes.",
    resolution: "Wait and try again later"
  },
  NO_MATCHING_RECORDS: {
    ...ErrorTypes.AIRTABLE,
    code: 206,
    message: "No records match the filter criteria",
    userMessage: "No records with '[4.4] Ready for preso' = 1 were found in the Airtable. Please check your data.",
    resolution: "Ensure some records have the '[4.4] Ready for preso' checkbox checked"
  },
  MISSING_READY_FIELD: {
    ...ErrorTypes.AIRTABLE,
    code: 207,
    message: "The '[4.4] Ready for preso' field is missing",
    userMessage: "The required field '[4.4] Ready for preso' was not found in your Airtable.",
    resolution: "Add a checkbox field named '[4.4] Ready for preso' to your Airtable"
  },
  
  // Spreadsheet errors
  SPREADSHEET_ACCESS_ERROR: {
    ...ErrorTypes.SPREADSHEET,
    code: 301,
    message: "Could not access or create the spreadsheet",
    userMessage: "There was an error accessing the temporary storage spreadsheet.",
    resolution: "Check spreadsheet permissions and quotas"
  },
  
  // AI API errors
  AI_API_ALL_ATTEMPTS_FAILED: {
    ...ErrorTypes.AI_API,
    code: 401,
    message: "All AI API attempts failed",
    userMessage: "Could not process descriptions with AI. All API keys have been exhausted or are invalid.",
    resolution: "Check and update the Gemini API keys or try again later"
  },
  
  // Google Slides errors
  MISSING_TEMPLATE_DECK_ID: {
    ...ErrorTypes.SLIDES,
    code: 501,
    message: "Template deck ID is missing",
    userMessage: "Please select a template slide deck to continue.",
    resolution: "Select a template from the dropdown"
  },
  MISSING_FINAL_DECK_ID: {
    ...ErrorTypes.SLIDES,
    code: 502,
    message: "Final deck ID is missing",
    userMessage: "Please provide a URL for the final slide deck.",
    resolution: "Enter a valid Google Slides URL for the final deck"
  },
  INVALID_TEMPLATE_DECK: {
    ...ErrorTypes.SLIDES,
    code: 503,
    message: "Could not open template slide deck",
    userMessage: "The template slide deck could not be accessed. Please check the URL and permissions.",
    resolution: "Ensure the template deck exists and has proper sharing settings"
  },
  INVALID_FINAL_DECK: {
    ...ErrorTypes.SLIDES,
    code: 504,
    message: "Could not open final slide deck",
    userMessage: "The final slide deck could not be accessed. Please check the URL and permissions.",
    resolution: "Ensure the final deck exists and has edit access for anyone with the link"
  },
  EMPTY_TEMPLATE_DECK: {
    ...ErrorTypes.SLIDES,
    code: 505,
    message: "Template deck has no slides",
    userMessage: "The selected template deck is empty. Please select a template with at least one slide.",
    resolution: "Choose a different template or add slides to the current one"
  },
  
  // Validation errors
  MISSING_SLIDES_URLS: {
    ...ErrorTypes.VALIDATION,
    code: 601,
    message: "Missing slide deck URLs",
    userMessage: "Please provide both template and final deck URLs.",
    resolution: "Fill in all required fields"
  },
  INVALID_LAYOUT: {
    ...ErrorTypes.VALIDATION,
    code: 602,
    message: "Invalid layout type",
    userMessage: "The selected template has an invalid layout type. Please select a template with 'single' or 'double' in its name.",
    resolution: "Choose a template with 'single' or 'double' in its name"
  },
  DESCRIPTION_FIELD_MISMATCH: {
    ...ErrorTypes.VALIDATION,
    code: 603,
    message: "Description field name and prompt mismatch",
    userMessage: "Please provide both field name and AI prompt for each description field.",
    resolution: "Fill in both field name and prompt, or remove the field"
  }
};

/**
 * Handles errors by logging details and returning a structured error object
 * This function doesn't modify the original application flow but provides
 * enhanced error information for the UI
 * 
 * @param {string} errorType - The type of error from ErrorDefinitions
 * @param {Object} details - Additional details about the error
 * @param {Error} originalError - The original error object if available
 * @return {Object} Structured error object for UI display
 */
function handleError(errorType, details = {}, originalError = null) {
  const error = ErrorDefinitions[errorType];
  
  if (!error) {
    // Handle unknown error type
    return handleUnknownError(details, originalError);
  }
  
  // Log detailed error for debugging
  Logger.log(`ERROR [${error.code}]: ${error.message}`);
  if (details) Logger.log(`Details: ${JSON.stringify(details)}`);
  if (originalError) Logger.log(`Original error: ${originalError}`);
  
  // Return structured error object for UI
  return {
    result: "Error",
    errorCode: error.code,
    errorCategory: error.category,
    errorMessage: error.userMessage,
    details: details,
    suggestions: error.resolution
  };
}

/**
 * Handles unknown errors that don't match predefined types
 * 
 * @param {Object} details - Additional details about the error
 * @param {Error} originalError - The original error object if available
 * @return {Object} Structured error object for UI display
 */
function handleUnknownError(details, originalError) {
  Logger.log(`UNKNOWN ERROR: ${originalError}`);
  return {
    result: "Error",
    errorCode: 999,
    errorCategory: "Unknown Error",
    errorMessage: "An unexpected error occurred. Please try again or contact support.",
    details: details,
    originalError: originalError ? originalError.toString() : null
  };
}

/**
 * Analyzes an error response from an API and returns a structured error object
 * 
 * @param {Object} response - The HTTP response object
 * @param {string} apiType - The type of API ("airtable" or "gemini")
 * @return {Object} Structured error object
 */
function analyzeApiError(response, apiType) {
  const statusCode = response.getResponseCode();
  const responseText = response.getContentText();
  
  if (apiType === "airtable") {
    if (statusCode === 401 || statusCode === 403) {
      return handleError("AIRTABLE_AUTHENTICATION_ERROR", { statusCode });
    } else if (statusCode === 404) {
      return handleError("AIRTABLE_RESOURCE_NOT_FOUND", { statusCode });
    } else if (statusCode === 429) {
      return handleError("AIRTABLE_RATE_LIMIT", { retryAfter: response.getHeaders()["Retry-After"] });
    }
  } else if (apiType === "gemini") {
    if (statusCode === 401 || statusCode === 403) {
      return handleError("AI_API_AUTHENTICATION_ERROR", { statusCode });
    } else if (statusCode === 429) {
      return handleError("AI_API_RATE_LIMIT", { statusCode });
    }
  }
  
  // Generic error for other cases
  return handleError("API_ERROR", { 
    apiType, 
    statusCode, 
    response: responseText.substring(0, 500) // Limit response text length
  });
}
