/**
 * Image Processor Module
 * 
 * This module provides functions for processing image fields in slides.
 * It handles image URLs, base64 data, and image generation requests.
 */

/**
 * Process an image field from the data item.
 * 
 * @param {string} fieldName - The name of the image field
 * @param {*} fieldValue - The value of the image field (URL, base64, etc.)
 * @param {Object} context - Additional context about the field and slide
 * @return {Object} Processed image information
 */
function processImageField(fieldName, fieldValue, context = {}) {
  // Skip processing for empty values
  if (!fieldValue) {
    return { 
      success: false, 
      message: "No image data provided",
      type: "none"
    };
  }
  
  // Determine the type of image data
  const imageType = determineImageType(fieldValue);
  
  // Process based on image type
  switch (imageType) {
    case "url":
      return processImageUrl(fieldValue, context);
    case "base64":
      return processBase64Image(fieldValue, context);
    case "drive_id":
      return processDriveImage(fieldValue, context);
    case "placeholder":
      return generateImagePlaceholder(fieldValue, context);
    default:
      return { 
        success: false, 
        message: "Unsupported image format",
        type: "unknown"
      };
  }
}

/**
 * Determine the type of image data provided.
 * 
 * @param {*} imageData - The image data to analyze
 * @return {string} The determined image type
 */
function determineImageType(imageData) {
  // Convert to string if it's not already
  const data = String(imageData);
  
  // Check for URL patterns
  if (data.startsWith('http://') || data.startsWith('https://')) {
    return "url";
  }
  
  // Check for base64 data
  if (data.startsWith('data:image/') || data.startsWith('base64,')) {
    return "base64";
  }
  
  // Check for Google Drive file ID pattern
  if (/^[a-zA-Z0-9_-]{25,}$/.test(data)) {
    return "drive_id";
  }
  
  // Default to placeholder (description for image generation)
  return "placeholder";
}

/**
 * Process an image URL.
 * 
 * @param {string} url - The image URL
 * @param {Object} context - Additional context
 * @return {Object} Processed image information
 */
function processImageUrl(url, context) {
  try {
    // Fetch the image from the URL
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    
    if (response.getResponseCode() !== 200) {
      return { 
        success: false, 
        message: `Failed to fetch image: HTTP ${response.getResponseCode()}`,
        type: "url",
        url: url
      };
    }
    
    // Get the image blob
    const imageBlob = response.getBlob();
    
    return {
      success: true,
      type: "url",
      url: url,
      blob: imageBlob,
      contentType: imageBlob.getContentType(),
      size: imageBlob.getBytes().length
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Error processing image URL: ${error}`,
      type: "url",
      url: url
    };
  }
}

/**
 * Process a base64 encoded image.
 * 
 * @param {string} base64Data - The base64 encoded image data
 * @param {Object} context - Additional context
 * @return {Object} Processed image information
 */
function processBase64Image(base64Data, context) {
  try {
    // Extract the actual base64 data if it includes the data URL prefix
    let cleanData = base64Data;
    if (base64Data.includes('base64,')) {
      cleanData = base64Data.split('base64,')[1];
    }
    
    // Determine content type
    let contentType = "image/png"; // Default
    if (base64Data.includes('data:image/')) {
      contentType = base64Data.split('data:')[1].split(';')[0];
    }
    
    // Decode the base64 data
    const decodedData = Utilities.base64Decode(cleanData);
    const blob = Utilities.newBlob(decodedData, contentType, "image");
    
    return {
      success: true,
      type: "base64",
      blob: blob,
      contentType: contentType,
      size: decodedData.length
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Error processing base64 image: ${error}`,
      type: "base64"
    };
  }
}

/**
 * Process a Google Drive image by ID.
 * 
 * @param {string} fileId - The Google Drive file ID
 * @param {Object} context - Additional context
 * @return {Object} Processed image information
 */
function processDriveImage(fileId, context) {
  try {
    // Get the file from Drive
    const file = DriveApp.getFileById(fileId);
    
    if (!file) {
      return { 
        success: false, 
        message: "File not found in Drive",
        type: "drive_id",
        fileId: fileId
      };
    }
    
    // Check if it's an image
    const mimeType = file.getMimeType();
    if (!mimeType.startsWith('image/')) {
      return { 
        success: false, 
        message: "File is not an image",
        type: "drive_id",
        fileId: fileId,
        mimeType: mimeType
      };
    }
    
    // Get the image blob
    const imageBlob = file.getBlob();
    
    return {
      success: true,
      type: "drive_id",
      fileId: fileId,
      fileName: file.getName(),
      blob: imageBlob,
      contentType: mimeType,
      size: imageBlob.getBytes().length,
      url: `https://drive.google.com/uc?export=view&id=${fileId}`
    };
  } catch (error) {
    return { 
      success: false, 
      message: `Error processing Drive image: ${error}`,
      type: "drive_id",
      fileId: fileId
    };
  }
}

/**
 * Generate a placeholder image based on a description.
 * This could be enhanced with AI image generation in the future.
 * 
 * @param {string} description - The image description
 * @param {Object} context - Additional context
 * @return {Object} Processed image information
 */
function generateImagePlaceholder(description, context) {
  try {
    // For now, create a simple colored rectangle with text
    const width = context.width || 400;
    const height = context.height || 300;
    
    // Create a placeholder URL (could be replaced with actual image generation)
    const placeholderUrl = `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(description)}`;
    
    // Fetch the placeholder image
    return processImageUrl(placeholderUrl, context);
  } catch (error) {
    return { 
      success: false, 
      message: `Error generating image placeholder: ${error}`,
      type: "placeholder",
      description: description
    };
  }
}

/**
 * Check if a field is likely to be an image field based on its name.
 * 
 * @param {string} fieldName - The name of the field
 * @return {boolean} Whether the field is likely an image field
 */
function isImageField(fieldName) {
  if (!fieldName) return false;
  
  // Convert to lowercase for case-insensitive matching
  const field = fieldName.toLowerCase();
  
  // Check for common image field patterns
  return field.includes('image') || 
         field.includes('logo') || 
         field.includes('photo') || 
         field.includes('picture') || 
         field.includes('icon') || 
         field.includes('thumbnail') ||
         field.endsWith('img') ||
         field.startsWith('img');
}
