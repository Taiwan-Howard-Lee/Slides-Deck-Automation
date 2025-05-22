/**
 * Retrieves template files from the specified Google Drive folder by folderId.
 */
function getTemplateFilesFromFolder(folderId) {
  Logger.log("getTemplateFilesFromFolder(): Folder ID - " + folderId);
  var folder = DriveApp.getFolderById(folderId);
  var files = folder.getFiles();
  var results = [];
  while (files.hasNext()) {
    var file = files.next();
    results.push({ name: file.getName(), url: file.getUrl() });
    Logger.log("Found file: " + file.getName() + " (" + file.getUrl() + ")");
  }
  Logger.log("Total files found: " + results.length);
  return results;
}