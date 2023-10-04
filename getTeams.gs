/**
 * Gets the teams and managers for your league
 */
function getTeams() {
  console.log("Getting Teams data");

  const ss = SpreadsheetApp.openById(CONFIG.sheetId);
  let sheet = ss.getSheetByName("Teams");

  if (!sheet) {
    sheet = ss.insertSheet("Teams", 4);
  }

  const service = getService();

  if (service.hasAccess()) {
    sheet.clearContents(); // Use clearContents instead of clear to preserve formatting
    sheet.appendRow([
      "teamKey",
      "teamId",
      "teamName",
      "teamUrl",
      "teamLogo",
      "teamManager",
    ]);

    const url = `https://fantasysports.yahooapis.com/fantasy/v2/league/${yearId}.l.${CONFIG.leagueId}/teams`;

    try {
      const response = UrlFetchApp.fetch(url, {
        headers: {
          Authorization: `Bearer ${service.getAccessToken()}`,
        },
        muteHttpExceptions: true, // Removed unnecessary quotes around muteHttpExceptions
      });

      if (response.getResponseCode() < 300) {
        const json = xmlToJson(response.getContentText());

        if (json.fantasy_content.league.teams.team.length > 0) {
          const teamValues = json.fantasy_content.league.teams.team.map(
            (team) => [
              team.team_key.Text,
              team.team_id.Text,
              team.name.Text,
              team.url.Text,
              team.team_logos.team_logo.url.Text,
              team.managers.manager.nickname.Text,
            ]
          );

          sheet.getRange(2, 1, teamValues.length, 6).setValues(teamValues);
        }
      }
    } catch (e) {
      Logger.log(`I am in the getTeams script and the error is ${e}`);
    }
  } else {
    showSidebar();
  }
}
