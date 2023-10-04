let latestPick = 0;
let previousPicks = [];

function getDraftResults() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.sheetId);
  const draftResultsDataSheet = getOrCreateSheet(spreadsheet, "Draft Results");
  const teamsData = spreadsheet
    .getSheetByName("Teams")
    .getDataRange()
    .getValues();
  const playersData = spreadsheet
    .getSheetByName("Player Data")
    .getDataRange()
    .getValues();

  draftResultsDataSheet
    .getRange("A1:E1")
    .setValues([["round", "pick", "playerName", "teamId", "manager"]]);

  SpreadsheetApp.flush();

  const lastRow = draftResultsDataSheet.getLastRow();
  previousPicks = draftResultsDataSheet
    .getRange(2, 2, lastRow, 1)
    .getValues()
    .flatMap((pick) => Number(pick));
  console.log(`previousPicks are ${previousPicks}`);

  const draftResults = getDraftResultsFromYahoo();
  if (draftResults.length > 0) {
    draftResultsDataSheet.getRange("I2").clearContent();

    const draftContent = getDraftContent(draftResults, teamsData, playersData);
    if (draftContent.length > 0) {
      draftResultsDataSheet
        .getRange(lastRow + 1, 1, draftContent.length, 5)
        .setValues(draftContent);
      SpreadsheetApp.flush();
    }
  } else {
    draftResultsDataSheet.getRange("I2").setValue("No Draft Results to report");
  }
}

function getOrCreateSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName, 1);
  }
  return sheet;
}

function getDraftResultsFromYahoo() {
  const service = getService();
  if (service.hasAccess()) {
    const url = `https://fantasysports.yahooapis.com/fantasy/v2/league/${yearId}.l.${CONFIG.leagueId}/draftresults`;
    try {
      const draftResponse = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        headers: {
          Authorization: "Bearer " + service.getAccessToken(),
        },
      });
      const draftJson = xmlToJson(draftResponse.getContentText());
      return draftJson.fantasy_content.league.draft_results.draft_result;
    } catch (e) {
      Logger.log(e);
    }
  }
  return null;
}

function getDraftContent(draftResults, teamsData, playersData) {
  return draftResults.reduce((draftContent, result) => {
    if (result.hasOwnProperty("player_key")) {
      const round = result.round.Text;
      const pick = result.pick.Text;
      const playerKey = result.player_key.Text;
      const playerMatch = playersData.findIndex(
        (player) => player[0] === playerKey
      );
      const playerName = playerMatch > -1 ? playersData[playerMatch][1] : "";
      const teamId = result.team_key.Text;
      const teamMatch = teamsData.findIndex((team) => team[0] === teamId);
      const manager = teamMatch > -1 ? teamsData[teamMatch][5] : "";
      // Check if player has a name, team name, and position
      if (!previousPicks.includes(Number(pick))) {
        draftContent.push([round, pick, playerName, teamId, manager]);
      }
    }
    return draftContent;
  }, []);
}
