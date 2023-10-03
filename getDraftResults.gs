let lastAddedPick = 0;

function getDraftResults() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.sheetId);
  const draftResultsDataSheet = getOrCreateSheet(spreadsheet, "Draft Results");
  const teamsData = spreadsheet
    .getSheetByName("Teams")
    .getDataRange()
    .getValues();

  draftResultsDataSheet
    .getRange("A1:G1")
    .setValues([
      [
        "round",
        "pick",
        "teamId",
        "team",
        "playerName",
        "playerPosition",
        "playerTeamName",
      ],
    ]);

  SpreadsheetApp.flush();

  const lastRow = draftResultsDataSheet.getLastRow();
  const lastPickRange = draftResultsDataSheet.getRange(lastRow, 2);
  lastAddedPick =
    lastPickRange.getValue() != "pick" ? lastPickRange.getValue() : 0;

  const playerArray = getPlayerArray();
  const playerInfo = getPlayerInfo(playerArray);

  const draftResults = getDraftResultsFromYahoo();
  if (draftResults.length > 0) {
    const draftContent = getDraftContent(draftResults, teamsData, playerInfo);
    if (draftContent.length > 0) {
      draftResultsDataSheet
        .getRange(lastRow + 1, 1, draftContent.length, 7)
        .setValues(draftContent);
      SpreadsheetApp.flush();
    }
  } else {
    draftResultsDataSheet
      .getRange("A2:G2")
      .setValue("No Draft Results to report");
  }
}

function getOrCreateSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName, 1);
  }
  return sheet;
}

function getPlayerArray() {
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
      const draftResults =
        draftJson.fantasy_content.league.draft_results.draft_result;
      if (draftResults !== undefined) {
        return draftResults
          .filter((result) => result.player_key)
          .map((result) => result.player_key);
      }
    } catch (e) {
      Logger.log(e);
    }
  }
  return [];
}

function getPlayerInfo(playerArray) {
  const service = getService();
  const playerInfo = [];
  const maxResults = 25;

  for (let i = 0; i < playerArray.length; i += maxResults) {
    const playerKeys = playerArray
      .slice(i, i + maxResults)
      .map((player) => player.Text);
    const playerUrl = `https://fantasysports.yahooapis.com/fantasy/v2/league/${yearId}.l.${
      CONFIG.leagueId
    }/players;player_keys=${playerKeys.join(",")}`;

    try {
      const playerResponse = UrlFetchApp.fetch(playerUrl, {
        muteHttpExceptions: true,
        headers: {
          Authorization: "Bearer " + service.getAccessToken(),
        },
      });
      const playerJson = xmlToJson(playerResponse.getContentText());
      const playerResults = playerJson.fantasy_content.league.players.player;

      playerInfo.push(
        ...playerResults.map((player) => [
          player.name.full.Text,
          player.display_position.Text,
          player.editorial_team_full_name.Text,
        ])
      );
    } catch (e) {
      playerName = "";
      playerTeamName = "";
      Logger.log(e);
    }
  }

  return playerInfo;
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

function getDraftContent(draftResults, teamsData, playerInfo) {
  return draftResults.reduce((draftContent, result) => {
    const round = result.round.Text;
    const pick = result.pick.Text;
    const teamId = result.team_key.Text;
    const teamMatch = teamsData.findIndex((team) => team[0] === teamId);
    const team =
      teamMatch > -1
        ? `${teamsData[teamMatch][2]}--${teamsData[teamMatch][5]}`
        : "";
    const playerIndex = draftResults.indexOf(result);
    const playerName = playerInfo[playerIndex]
      ? playerInfo[playerIndex][0]
      : "";
    const playerPosition = playerInfo[playerIndex]
      ? playerInfo[playerIndex][1]
      : "";
    const playerTeamName = playerInfo[playerIndex]
      ? playerInfo[playerIndex][2]
      : "";

    // Check if player has a name, team name, and position
    if (
      playerName.length > 0 &&
      playerPosition.length > 0 &&
      playerTeamName.length > 0 &&
      Number(pick) > lastAddedPick
    ) {
      draftContent.push([
        round,
        pick,
        teamId,
        team,
        playerName,
        playerPosition,
        playerTeamName,
      ]);
    }

    return draftContent;
  }, []);
}
