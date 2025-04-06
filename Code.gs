// Create a spreadsheet to log submissions if it doesn't exist
function setup() {
  // Check if spreadsheet ID is stored
  const props = PropertiesService.getScriptProperties();
  let ssId = props.getProperty("SPREADSHEET_ID");

  if (!ssId) {
    // Create new spreadsheet
    const ss = SpreadsheetApp.create("Shoutout Tracker");
    ssId = ss.getId();

    // Set up headers
    const sheet = ss.getSheets()[0];
    sheet.appendRow(["Timestamp", "To", "For", "Count"]);

    // Save ID to properties
    props.setProperty("SPREADSHEET_ID", ssId);
    props.setProperty("COUNT", "0");

    // Log URL for reference
    Logger.log("Spreadsheet created: " + ss.getUrl());
  }

  return ssId;
}

// Handle POST requests from form submission
function doPost(e) {
  try {
    // Get or create spreadsheet
    const props = PropertiesService.getScriptProperties();
    let ssId = props.getProperty("SPREADSHEET_ID");
    if (!ssId) {
      ssId = setup();
    }

    // Get values from form submission
    let toValue = e.parameter && e.parameter.to ? e.parameter.to : "(empty)";
    let forValue = e.parameter && e.parameter.for ? e.parameter.for : "(empty)";

    // Increment counter
    let count = parseInt(props.getProperty("COUNT") || "0");
    count++;
    props.setProperty("COUNT", count.toString());

    // Log to spreadsheet
    const ss = SpreadsheetApp.openById(ssId);
    const sheet = ss.getSheets()[0];
    sheet.appendRow([new Date(), toValue, forValue, count]);

    // Return simple success response
    return HtmlService.createHtmlOutput("Success");
  } catch (error) {
    // Return error response
    return HtmlService.createHtmlOutput("Error: " + error.toString());
  }
}
