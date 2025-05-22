# Universal Data-to-Slides Transformer

A Google Apps Script project that transforms any data source into professional slide presentations using AI-powered processing.

## 🚀 Features

- **Universal Data Input**: Supports CSV, JSON, Google Sheets, Airtable, and raw text
- **AI-Powered Processing**: Uses LLM to intelligently map data to slide templates
- **Dynamic Content Refinement**: Automatically optimizes content for presentation quality
- **Image Processing**: Handles images from URLs, base64 data, or Google Drive
- **Flexible Templates**: Works with any Google Slides template using {{field}} placeholders
- **Single & Double Layouts**: Supports both single-item and comparison layouts
- **Domain-Agnostic**: Works with any type of data, not just company information

## 🏗️ Architecture

This project implements a truly universal data transformer that:

1. **Analyzes** any input data format using AI
2. **Maps** data fields to template placeholders dynamically
3. **Refines** content based on context and field types
4. **Generates** professional slides with proper formatting
5. **Handles** both text and image content intelligently

## 📁 Project Structure

```
src/
├── main/
│   ├── universal_transformer.js      # Main transformation controller
│   ├── universal_slides_generator.js # Slide generation engine
│   └── template_requirements.js      # Template analysis
├── api/
│   ├── universal_data_processor.js   # AI-powered data processing
│   ├── content_refinement.js         # Dynamic content refinement
│   ├── image_processor.js            # Image handling
│   ├── data_source_adapter.js        # Data source adapters
│   ├── gemini_api.js                 # AI API integration
│   └── airtable.js                   # Airtable integration
├── ui/
│   ├── universal_interface.html      # Main user interface
│   ├── interface.html                # Legacy interface
│   └── getTemplateFiles.js           # Template utilities
├── webapp/
│   ├── doGet.js                      # Web app GET handler
│   ├── doPost.js                     # Web app POST handler
│   └── ui_functions.js               # UI helper functions
└── utils/
    ├── helper.js                     # Utility functions
    ├── processData.js                # Data processing utilities
    └── test_universal_transformer.js # Testing utilities
```

## 🎯 Key Components

### Universal Transformer
- **Dynamic data source detection**
- **Layout-aware processing** (single/double)
- **Template requirement analysis**
- **AI-powered data mapping**

### Content Refinement
- **Context-aware content optimization**
- **Field-type specific refinement**
- **Presentation-quality formatting**
- **Dynamic length and style adjustment**

### Image Processing
- **Multi-format image support** (URL, base64, Drive ID)
- **Automatic image field detection**
- **Smart positioning and sizing**
- **Placeholder generation**

## 🚀 Quick Start

### 1. Setup Google Apps Script Project

1. Go to [Google Apps Script](https://script.google.com)
2. Create a new project
3. Copy all files from this repository to your project

### 2. Configure API Keys

1. Set up Gemini AI API key in `src/api/gemini_api.js`
2. Configure any other API keys as needed

### 3. Create Your Template

Create a Google Slides template with placeholders using the `{{field}}` format:

```
{{name}} - {{description}}
{{image}} - {{details}}
```

### 4. Use the System

```javascript
// Example usage
const result = universalTransform({
  dataSource: {
    type: 'csv',
    connectionInfo: { data: 'your,csv,data' }
  },
  templateInfo: {
    templateId: 'your-template-id',
    finalDeckId: 'your-output-deck-id'
  }
});
```

## 📝 Template Guidelines

### Placeholder Format
- Use `{{fieldName}}` format for all placeholders
- Field names are case-insensitive and flexible
- Image fields are automatically detected (logo, image, photo, etc.)

### Layout Types
- **Single Layout**: One item per slide
- **Double Layout**: Two items per slide (comparison)
- Layout is detected from template name or can be specified

### Field Types
The system automatically handles different field types:
- **Text fields**: Refined for presentation quality
- **Image fields**: Processed and positioned automatically
- **Numerical data**: Formatted appropriately
- **Dates/times**: Standardized formatting

## 🔧 Advanced Features

### Dynamic Content Refinement
Content is automatically refined based on:
- Field type and context
- Slide position and formatting
- Target length requirements
- Presentation style guidelines

### Image Handling
Supports multiple image sources:
- Direct URLs
- Base64 encoded data
- Google Drive file IDs
- Descriptive text (generates placeholders)

### Data Source Flexibility
Built-in adapters for:
- Raw text/CSV
- JSON data
- Google Sheets
- Airtable
- Extensible for new sources

## 🧪 Testing

Run the test utilities to verify functionality:

```javascript
// Test the universal transformer
testUniversalTransformer();
```

## 🛠️ Development

This project uses [clasp](https://github.com/google/clasp) for local development of Google Apps Script.

### Setup

1. Install clasp: `npm install -g @google/clasp`
2. Login to Google: `clasp login`
3. Clone the project: `clasp clone <scriptId>`

### Commands

- Push changes: `clasp push`
- Pull latest: `clasp pull`
- Open in browser: `clasp open`
- Create a version: `clasp version "Description"`
- Deploy: `clasp deploy [version] "Description"`

## 🗺️ Roadmap

See [PROJECT_PLAN.md](PROJECT_PLAN.md) for detailed information about the upcoming enhancements and development roadmap.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review the test files
3. Create an issue on GitHub

## 🎉 Acknowledgments

This project implements a truly universal approach to data-to-slides transformation, moving beyond hardcoded assumptions to create a flexible, AI-powered system that can handle any data type and template structure.

## Legacy Features

This project also maintains backward compatibility with the original Airtable-specific automation features:

### Airtable Integration
- Retrieves data from Airtable bases using dynamic parameters
- Supports both single-company and double-company slide layouts
- Includes content refinement using AI API (Gemini-2.0 Flash)

### Dynamic Configuration
- HTML form interface for user inputs
- Automatic extraction of base IDs and table IDs from URLs
- POST method with JSON for backend processing

## Script ID

The script ID for this project is: `1fHT-8rM7QCB-WngePreK4F5OzKpJYYy5132bSrl4AKg5yzYjucLTNCF-`
