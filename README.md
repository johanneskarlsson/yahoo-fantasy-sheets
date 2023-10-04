# yahoo-fantasy-sheets

Fetches Yahoo Fantasy draft results and inserts them into your sheet while drafting!

<h1>Get started</h1>

<h3>Step one</h3>

Rename any existing sheets named "League Data", "Draft Results", "Player Data" and "Teams", since these will be cleared by the script.

<h3>Step two</h3>

- Create and open a Google Sheet spreadsheet.
- Create a script, select Extensions > Apps Script from within Google Sheets.
- Import the files from this repo.
- In the main.gs file, replace the CONFIG variables in the script to match your environment.
- This script requires the OAuth2 and the ArrayLib library and optionally the BetterLog library.
  - To add the required libraries, follow these steps:
  - Go to the "Resources" menu and click on "Libraries". Add following libraries:
    - OAuth2: 1B7FSrk5Zi6L1rSxxTDgDEUsPzlukDsi4KGuTMorsTQHhGBzBkMun4iDF, version: 38
    - BetterLog: 1DSyxam1ceq72bMHsE6aOVeOl94X78WCwiYPytKi7chlg4x5GqiNXSw0l, version: 27
    - ArrayLib: 1r9wNWbta3ebuYL4ENAdIp4UYKmyNiWf1AqsXYzfXduRHhTZEeTxS9MhZ, version: 23

<h3>Step three</h3>
In order to use the script, you need to obtain a Yahoo API client ID and Secret. Follow these steps:

- Sign in and register an app at https://developer.yahoo.com/
- Enter https://script.google.com/macros/d/{YOUR SCRIPT ID}/usercallback into the redirect URI form. You can find your script ID in the URL.
- Give at least read permission.
- Once created, add client ID and client secret to the CONFIG variables in main.gs.

<h3>Step four</h3>

- Initialize the scripts by running it from the main.gs file.
- Navigate to your sheet and you will see a sidebar to the right. Click authorize. You will be redirected to a screen that hopefully returns "success".
- Rerun the script from the main.gs file.

<h3>Optional</h3>
Set up time triggers if you want to automatically fetch data during draft:

   * <h4>Option 1<h4>
   
       * Set the number of triggers you want per minute in the createDraftTimeTriggers.gs file. It defaults to 4.
       * Run the createDraftTimeTriggers function. Don't exit the console window since it will stop the run.

   * <h4>Option 2<h4>

       * Open up the script.
       * At the left, click Triggers alarm.
       * At the bottom right, click Add Trigger.
       * Select and configure the type of trigger you want to create.
       * Click Save.

<h3>Credit</h3>
Big credit to @bekd70 and this project of his https://github.com/bekd70/Yahoo-Fantasy-Football-Data.
