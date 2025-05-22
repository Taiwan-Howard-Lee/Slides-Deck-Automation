/**
 * Test functions for the universal data transformer.
 * These functions can be run manually to test the implementation.
 */

/**
 * Test the universal transformer with raw CSV data.
 */
function testUniversalTransformerWithCSV() {
  // Sample CSV data
  const csvData = `Company Name,Description,Business Model,Industry,Location
Acme Inc,"Acme Inc. is a technology company that specializes in cloud-based solutions for small businesses. Their flagship product, AcmeCloud, provides integrated accounting, inventory, and customer management tools.",B2B,Technology,San Francisco
TechStart,"TechStart develops mobile applications for the education sector. Their apps are used by schools and universities to enhance classroom learning and student engagement.",B2B2C,Education,Boston
GreenEnergy,"GreenEnergy is revolutionizing the renewable energy sector with innovative solar panel technology that increases efficiency by 30% compared to traditional panels.",B2B,Energy,Austin`;

  // Test parameters
  const params = {
    useUniversalTransformer: true,
    dataSource: {
      type: "raw_text",
      connectionInfo: { data: csvData }
    },
    templateInfo: {
      // Replace with actual template and final deck IDs for testing
      templateId: "YOUR_TEMPLATE_ID_HERE",
      finalDeckId: "YOUR_FINAL_DECK_ID_HERE"
    },
    layout: "single",
    systemInstruction: "This is a test of the universal transformer with CSV data."
  };
  
  // Log the test parameters
  Logger.log("Testing universal transformer with CSV data:");
  Logger.log(JSON.stringify(params));
  
  // Call the universal transformer
  const result = universalTransform(params);
  
  // Log the result
  Logger.log("Result:");
  Logger.log(JSON.stringify(result));
  
  return result;
}

/**
 * Test the universal transformer with JSON data.
 */
function testUniversalTransformerWithJSON() {
  // Sample JSON data
  const jsonData = JSON.stringify({
    companies: [
      {
        name: "Acme Inc",
        description: "Acme Inc. is a technology company that specializes in cloud-based solutions for small businesses. Their flagship product, AcmeCloud, provides integrated accounting, inventory, and customer management tools.",
        businessModel: "B2B",
        industry: "Technology",
        location: "San Francisco"
      },
      {
        name: "TechStart",
        description: "TechStart develops mobile applications for the education sector. Their apps are used by schools and universities to enhance classroom learning and student engagement.",
        businessModel: "B2B2C",
        industry: "Education",
        location: "Boston"
      }
    ]
  });

  // Test parameters
  const params = {
    useUniversalTransformer: true,
    dataSource: {
      type: "json",
      connectionInfo: { data: jsonData }
    },
    templateInfo: {
      // Replace with actual template and final deck IDs for testing
      templateId: "YOUR_TEMPLATE_ID_HERE",
      finalDeckId: "YOUR_FINAL_DECK_ID_HERE"
    },
    layout: "single",
    systemInstruction: "This is a test of the universal transformer with JSON data."
  };
  
  // Log the test parameters
  Logger.log("Testing universal transformer with JSON data:");
  Logger.log(JSON.stringify(params));
  
  // Call the universal transformer
  const result = universalTransform(params);
  
  // Log the result
  Logger.log("Result:");
  Logger.log(JSON.stringify(result));
  
  return result;
}

/**
 * Test the LLM data processing directly.
 */
function testLLMDataProcessing() {
  // Sample CSV data
  const csvData = `Company Name,Description,Business Model,Industry,Location
Acme Inc,"Acme Inc. is a technology company that specializes in cloud-based solutions for small businesses. Their flagship product, AcmeCloud, provides integrated accounting, inventory, and customer management tools.",B2B,Technology,San Francisco
TechStart,"TechStart develops mobile applications for the education sector. Their apps are used by schools and universities to enhance classroom learning and student engagement.",B2B2C,Education,Boston`;

  // Sample template requirements
  const templateRequirements = {
    name: "Single Company Template",
    description: "Template for single company presentations",
    fields: [
      { name: "companyName", description: "Name of the company", required: true },
      { name: "description", description: "Brief company description (50 words max)", required: true },
      { name: "businessModel", description: "Business model (B2B, B2C, etc.)", required: true },
      { name: "industry", description: "Industry or sector", required: false }
    ]
  };
  
  // Process the data with LLM
  const result = processDataWithLLM(csvData, templateRequirements, "csv");
  
  // Log the result
  Logger.log("LLM Processing Result:");
  Logger.log(JSON.stringify(result));
  
  return result;
}

/**
 * Test data format detection.
 */
function testDataFormatDetection() {
  // Test various data formats
  const testCases = [
    {
      name: "CSV",
      data: "name,age,city\nJohn,30,New York\nJane,25,Boston"
    },
    {
      name: "TSV",
      data: "name\tage\tcity\nJohn\t30\tNew York\nJane\t25\tBoston"
    },
    {
      name: "JSON Object",
      data: '{"people":[{"name":"John","age":30,"city":"New York"},{"name":"Jane","age":25,"city":"Boston"}]}'
    },
    {
      name: "JSON Array",
      data: '[{"name":"John","age":30,"city":"New York"},{"name":"Jane","age":25,"city":"Boston"}]'
    },
    {
      name: "Plain Text",
      data: "This is just some plain text without any structured format."
    }
  ];
  
  // Test each case
  testCases.forEach(testCase => {
    const format = detectDataFormat(testCase.data);
    Logger.log(`Format detection for ${testCase.name}: ${format}`);
  });
}
