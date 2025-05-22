/**
 * Data Source Adapter Framework
 * 
 * This module provides adapters for different data sources.
 * It serves as the input layer for the universal data-to-slides transformer.
 */

/**
 * Base class for all data source adapters.
 */
class DataSourceAdapter {
  constructor() {
    this.sourceType = 'base';
  }
  
  /**
   * Connect to the data source.
   * 
   * @param {Object} connectionInfo - Information needed to connect
   * @return {boolean} Success status
   */
  connect(connectionInfo) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Fetch data from the source.
   * 
   * @param {Object} options - Options for fetching data
   * @return {string} Raw data as string
   */
  fetchData(options) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Get the source type.
   * 
   * @return {string} Source type identifier
   */
  getSourceType() {
    return this.sourceType;
  }
}

/**
 * Adapter for raw text data (CSV, JSON, etc.).
 */
class RawTextAdapter extends DataSourceAdapter {
  constructor() {
    super();
    this.sourceType = 'raw_text';
    this.data = '';
  }
  
  /**
   * Connect to the data source (store the raw text).
   * 
   * @param {Object} connectionInfo - Contains the raw text data
   * @return {boolean} Success status
   */
  connect(connectionInfo) {
    if (!connectionInfo || !connectionInfo.data) {
      Logger.log('No data provided to RawTextAdapter');
      return false;
    }
    
    this.data = connectionInfo.data;
    return true;
  }
  
  /**
   * Fetch the stored raw text data.
   * 
   * @return {string} The raw text data
   */
  fetchData() {
    return this.data;
  }
}

/**
 * Adapter for Google Sheets data.
 */
class GoogleSheetsAdapter extends DataSourceAdapter {
  constructor() {
    super();
    this.sourceType = 'google_sheets';
    this.spreadsheet = null;
    this.sheetName = '';
  }
  
  /**
   * Connect to a Google Sheet.
   * 
   * @param {Object} connectionInfo - Contains spreadsheetId and optional sheetName
   * @return {boolean} Success status
   */
  connect(connectionInfo) {
    if (!connectionInfo || !connectionInfo.spreadsheetId) {
      Logger.log('No spreadsheet ID provided to GoogleSheetsAdapter');
      return false;
    }
    
    try {
      this.spreadsheet = SpreadsheetApp.openById(connectionInfo.spreadsheetId);
      this.sheetName = connectionInfo.sheetName || '';
      return true;
    } catch (error) {
      Logger.log('Error connecting to Google Sheet: ' + error);
      return false;
    }
  }
  
  /**
   * Fetch data from the Google Sheet.
   * 
   * @param {Object} options - Options like headerRow
   * @return {string} CSV representation of the sheet data
   */
  fetchData(options = {}) {
    if (!this.spreadsheet) {
      Logger.log('No spreadsheet connected');
      return '';
    }
    
    try {
      // Get the sheet
      const sheet = this.sheetName ? 
        this.spreadsheet.getSheetByName(this.sheetName) : 
        this.spreadsheet.getActiveSheet();
      
      if (!sheet) {
        Logger.log('Sheet not found: ' + this.sheetName);
        return '';
      }
      
      // Get the data range
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      // Convert to CSV
      return values.map(row => 
        row.map(cell => {
          // Handle different cell types
          if (cell === null || cell === undefined) return '';
          if (typeof cell === 'string') return '"' + cell.replace(/"/g, '""') + '"';
          return cell.toString();
        }).join(',')
      ).join('\n');
      
    } catch (error) {
      Logger.log('Error fetching data from Google Sheet: ' + error);
      return '';
    }
  }
}

/**
 * Adapter for Airtable data.
 */
class AirtableAdapter extends DataSourceAdapter {
  constructor() {
    super();
    this.sourceType = 'airtable';
    this.baseId = '';
    this.tableName = '';
    this.apiKey = '';
    this.filterFormula = '';
  }
  
  /**
   * Connect to an Airtable base.
   * 
   * @param {Object} connectionInfo - Contains baseId, tableName, and optional apiKey
   * @return {boolean} Success status
   */
  connect(connectionInfo) {
    if (!connectionInfo || !connectionInfo.baseId || !connectionInfo.tableName) {
      Logger.log('Missing required Airtable connection info');
      return false;
    }
    
    this.baseId = connectionInfo.baseId;
    this.tableName = connectionInfo.tableName;
    
    // Use provided API key or get from script properties
    this.apiKey = connectionInfo.apiKey || 
      PropertiesService.getScriptProperties().getProperty("AIRTABLE_API");
    
    this.filterFormula = connectionInfo.filterFormula || '';
    
    return !!this.apiKey;
  }
  
  /**
   * Fetch data from Airtable.
   * 
   * @return {string} JSON representation of the Airtable data
   */
  fetchData() {
    if (!this.baseId || !this.tableName || !this.apiKey) {
      Logger.log('Incomplete Airtable connection info');
      return '';
    }
    
    try {
      let url = `https://api.airtable.com/v0/${this.baseId}/${encodeURIComponent(this.tableName)}`;
      
      // Add filter if provided
      if (this.filterFormula) {
        url += `?filterByFormula=${encodeURIComponent(this.filterFormula)}`;
      }
      
      const options = {
        method: "get",
        headers: {
          "Authorization": "Bearer " + this.apiKey,
          "Content-Type": "application/json"
        },
        muteHttpExceptions: true
      };
      
      const response = UrlFetchApp.fetch(url, options);
      
      if (response.getResponseCode() !== 200) {
        Logger.log("Error retrieving Airtable records: " + response.getContentText());
        return '';
      }
      
      return response.getContentText();
      
    } catch (error) {
      Logger.log('Error fetching data from Airtable: ' + error);
      return '';
    }
  }
}
