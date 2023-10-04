/**
 * Gets the league information from Yahoo to save the info to a sheet
 */
function getLeagueData() {
  console.log("Getting league data");

  const ss = SpreadsheetApp.openById(CONFIG.sheetId);
  let leagueDataSheet = ss.getSheetByName("League Data");

  if (!leagueDataSheet) {
    leagueDataSheet = ss.insertSheet("League Data", 1);
  }
  const service = getService();
  if (service.hasAccess()) {
    try {
      leagueDataSheet.clearContents();
      const url = `https://fantasysports.yahooapis.com/fantasy/v2/league/${yearId}.l.${CONFIG.leagueId}`;
      const response = UrlFetchApp.fetch(url, {
        headers: {
          Authorization: `Bearer ${service.getAccessToken()}`,
        },
      });
      const xml = response.getContentText();
      const json = xmlToJson(xml);
      Logger.log(JSON.stringify(json));

      updateLeagueDataSheet(leagueDataSheet, json);
    } catch (e) {
      Logger.log(e);
      leagueDataSheet.clearContents();
    }
  } else {
    showSidebar();
  }
}

function updateLeagueDataSheet(sheet, json) {
  const leagueData = json.fantasy_content.league;
  const keys = Object.keys(leagueData);
  const leagueValues = keys.map((key) => leagueData[key].Text);

  sheet.appendRow(keys);
  sheet.appendRow(leagueValues);
}
