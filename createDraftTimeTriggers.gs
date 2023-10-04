function createDraftTimeTriggers() {
  const numberOfTriggers = 4;
  const timeBetweenTriggers = 60 / numberOfTriggers;
  for (let i = 0; i < numberOfTriggers; i++) {
    console.log("Adding trigger");
    ScriptApp.newTrigger("getDraftResults")
      .timeBased()
      .everyMinutes(1)
      .create();
    Utilities.sleep(timeBetweenTriggers * 1000);
  }
}
