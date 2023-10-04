function getPlayerData() {
  console.log("Getting all player data");

  const ss = SpreadsheetApp.openById(CONFIG.sheetId);
  let sheet = ss.getSheetByName("Player Data");

  if (!sheet) {
    sheet = ss.insertSheet("Player Data", 4);
  }
  sheet
    .getRange("A1:D1")
    .setValues([["playerKey", "player", "team", "position"]]);
  let fetchedPlayerCount = 0;
  const service = getService();

  if (service.hasAccess()) {
    let maxCount = 1200;
    while (fetchedPlayerCount <= maxCount) {
      let count = 100;
      const url = `https://fantasysports.yahooapis.com/fantasy/v2/league/${yearId}.l.${CONFIG.leagueId}/players;sort=AR;start=${fetchedPlayerCount};count=${count}`;

      try {
        const response = UrlFetchApp.fetch(url, {
          headers: {
            Authorization: `Bearer ${service.getAccessToken()}`,
          },
          muteHttpExceptions: true, // Removed unnecessary quotes around muteHttpExceptions
        });

        if (response.getResponseCode() < 300) {
          const json = xmlToJson(response.getContentText());

          const players = json.fantasy_content.league.players.player;
          if (players.length > 0) {
            const playerValues = players.map((player) => [
              player.player_key.Text,
              player.name.full.Text,
              player.editorial_team_abbr.Text,
              player.display_position.Text.replaceAll(",", "/"),
            ]);

            sheet
              .getRange(fetchedPlayerCount + 2, 1, playerValues.length, 4)
              .setValues(playerValues);
            fetchedPlayerCount += Number(
              json.fantasy_content.league.players.count
            );
          } else break;
        }
      } catch (e) {
        Logger.log(`I am in the getAllPlayerData script and the error is ${e}`);
      }
    }
  } else {
    showSidebar();
  }
}
