function getTemplateFiles() {
  var folderId = "1ndVYBE6RwUEuksF7ONl06ZhQ49FxmF9R";  // Replace with your Google Drive folder ID
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFiles();
  
  var templateFiles = [];
  
  while (files.hasNext()) {
    var file = files.next();
    var fileName = file.getName();
    
    // Only add files that match the required pattern (e.g., "AND with single" or "AND with double")
    if (fileName.includes("AND with single") || fileName.includes("AND with double")) {
      templateFiles.push({
        name: fileName,
        url: file.getUrl(),
        layout: fileName.includes("AND with single") ? "single" : "double"
      });
    }
  }
  
  return templateFiles;
}


// This function handles the POST request from the HTML form.
function doPost(e) {
  try {
    var params = JSON.parse(e.postData.contents);
    var layout = params.layout || "single";

    var selectedFileUrl = params.selectedTemplateUrl; // The selected template URL
    
    // Continue with your processing, such as calling Main_single or Main_double.
    // This will now use the URL provided by the user.
    if (layout === "double") {
      Main_double(selectedFileUrl);
    } else {
      Main_single(selectedFileUrl);
    }
    
    return ContentService.createTextOutput(JSON.stringify({result: "Success"}))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({result: "Error", message: error.toString()}))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}