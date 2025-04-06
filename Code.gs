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
  Logger.log("doPost function started");

  try {
    // Log the request parameters
    Logger.log("Request parameters: " + JSON.stringify(e.parameter || {}));

    // Get or create spreadsheet
    const props = PropertiesService.getScriptProperties();
    let ssId = props.getProperty("SPREADSHEET_ID");

    if (!ssId) {
      Logger.log("No spreadsheet ID found, setting up new spreadsheet");
      ssId = setup();
    } else {
      Logger.log("Using existing spreadsheet ID: " + ssId);
    }

    // Get values from form submission
    let toValue = e.parameter && e.parameter.to ? e.parameter.to : "(empty)";
    let forValue = e.parameter && e.parameter.for ? e.parameter.for : "(empty)";

    Logger.log(
      "Received values - To: '" + toValue + "', For: '" + forValue + "'"
    );

    // Increment counter
    let count = parseInt(props.getProperty("COUNT") || "0");
    count++;
    props.setProperty("COUNT", count.toString());
    Logger.log("Updated count: " + count);

    // Log to spreadsheet
    const ss = SpreadsheetApp.openById(ssId);
    const sheet = ss.getSheets()[0];
    sheet.appendRow([new Date(), toValue, forValue, count]);
    Logger.log("Data successfully logged to spreadsheet");

    // Return simple success response
    Logger.log("doPost completed successfully");
    return HtmlService.createHtmlOutput("Success");
  } catch (error) {
    // Log the error details
    Logger.log("ERROR in doPost: " + error.toString());
    Logger.log("Error stack: " + error.stack);

    // Try to log the error to spreadsheet if possible
    try {
      const props = PropertiesService.getScriptProperties();
      const ssId = props.getProperty("SPREADSHEET_ID");
      if (ssId) {
        const ss = SpreadsheetApp.openById(ssId);
        const sheet = ss.getSheets()[0];
        sheet.appendRow([new Date(), "ERROR", error.toString(), 0]);
        Logger.log("Error logged to spreadsheet");
      }
    } catch (logError) {
      Logger.log("Failed to log error to spreadsheet: " + logError.toString());
    }

    // Return error response
    return HtmlService.createHtmlOutput("Error: " + error.toString());
  }
}
