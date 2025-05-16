# Google Apps Script: Slide Deck Automation

This project automates the generation of Google Slides from Airtable data using a Google Apps Script. The script retrieves records from Airtable, refines company descriptions using an AI API, and generates slides using a predefined Google Slides template. The goal is to provide a user-friendly interface where users can supply dynamic inputs via an HTML form to trigger this automation process.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture and Technical Details](#architecture-and-technical-details)
- [Dynamic Parameters](#dynamic-parameters)
- [Setup and Configuration](#setup-and-configuration)
- [Usage](#usage)
- [API Endpoint](#api-endpoint)
- [Future Enhancements](#future-enhancements)

## Overview

This Google Apps Script project serves as the backend for automating Google Slide deck creation. The main components include:

- Fetching data from an Airtable base.
- Refining company descriptions using an AI API (Gemini-2.0 Flash).
- Creating Google Slides by replacing placeholders in a template slide with actual company data.
- Supporting both **single-company** and **double-company** slide layouts.
- Accepting dynamic configurations via an HTML form interface, where users provide relevant URLs and system instructions.

## Features

### Airtable Integration
- The script retrieves data from an Airtable base using dynamic parameters like `baseId` (the Airtable Base ID) and `tableName` (the table name).
- It fetches Airtable records with a filter to only include items that are ready for presentation.

### Content Refinement Using AI
- Company descriptions are refined using an AI API (Gemini-2.0 Flash), which generates more concise and effective descriptions based on the raw data provided in Airtable.
- This step is facilitated by the `aiAPICalling()` function, which interacts with the AI API.

### Google Slides Automation
- **Single-Company Slide Generation:** 
    - Generates a Google Slide presentation for a single company, with content pulled dynamically from Airtable.
    - The layout and design of the slides are pre-defined using a template.
- **Double-Company Slide Generation:**
    - Similar to single-company slides but designed to handle two companies per slide, allowing for comparative presentations.
    - Separate template and final deck IDs are used for this layout.

### Dynamic Configuration via HTML Form
- **User Interface:**  
  A responsive HTML form allows users to dynamically input:
  - **Airtable URL**: Users simply paste the full Airtable URL; the base ID and table ID are extracted automatically.
  - **Google Slides URLs**: Users paste the full URLs for the slide templates and final deck for both single and double-company layouts.
  - **System Instruction**: A user-defined instruction which is used to refine the content for each company.
  
- **Post Method with JSON**:  
  The form sends the data to the backend using a POST method, and the Google Apps Script processes it and returns feedback.

### Loading Indicator
- A loading spinner is shown while the backend processes the request, providing users with real-time feedback.

### Responsive Design
- The user interface adjusts for different screen sizes and ensures that the form remains user-friendly on mobile devices.

## Architecture and Technical Details

- **Airtable Data Retrieval**  
  The `airtable_transfer(baseId, tableName)` function fetches records from Airtable using the provided `baseId` and `tableName`. It uses Airtable's API to retrieve data and store it in a Google Spreadsheet for processing.
  
- **Spreadsheet Management**  
  All retrieved Airtable data is written to and processed from a Google Spreadsheet sheet named `"companies"`. The spreadsheet serves as a temporary data storage during the automation process.
  
- **Content Refinement**  
  The `aiAPICalling(userMessage, systemInstruction)` function uses the Gemini-2.0 Flash AI model to refine company descriptions. This step is done before generating the slides.
  
- **Slide Generation**  
  - **Single-Company Slides**: The `slides_single(companies, templateDeckId, finalDeckId)` function generates slides for a single company based on the provided template and final deck IDs.
  - **Double-Company Slides**: The `slides_double(companies, templateDeckId, finalDeckId)` function generates slides for two companies per slide using a different template and final deck IDs.
  
- **Dynamic Parameters Handling**  
  The `processData(params)` function is the entry point for handling dynamic input. It processes the JSON payload, extracts the relevant IDs from the URLs, and triggers the appropriate slide generation functions (single or double).
  
- **Server-Side Processing (POST Method)**  
  The `doPost(e)` function accepts incoming POST requests, processes the data, and calls the respective Google Apps Script functions to automate slide creation.

## Dynamic Parameters

The script now accepts dynamic values via a JSON POST request. The expected JSON payload format is as follows:

```json
{
  "airtableUrl": "https://airtable.com/appaC3tF3jXr0rlJ0/tblBygTSOQPGWQX0p/viw73WLa9jNIUE3DW?blocks=hidev",
  "systemInstruction": "Provide a concise description of the company's offerings and business model.",
  "layout": "single",  // or "double"
  "slidesSingle": {
      "templateDeckId": "1b06g0uPg7KXrYzSMhCM4_5RhVXYiZI39Bj4xkn73aH8",
      "finalDeckId": "1-jyzFSDWuBkGIif1hGaq7RC4Rc5ljnmSbtvGv3qs3DQ"
  },
  "slidesDouble": {
      "templateDeckId": "1Iiyx1Pg7eb44RC-ULbKMNmGd4uo4DGkeSBgiDCr7xE4",
      "finalDeckId": "1-jyzFSDWuBkGIif1hGaq7RC4Rc5ljnmSbtvGv3qs3DQ"
  }
}
```
