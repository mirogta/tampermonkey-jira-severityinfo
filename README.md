# tampermonkey-jira-severityinfo

Tampermonkey script to add severity info popup to JIRA Service Desk issues.

## What does it do

Adds a Severity info icon next to Severity field on JIRA Service Desk issues.

When you mouse over the info icon, you'll see the Severity levels page in an iframe.

When you click on the icon, a new page will open with the Severity levels wiki page.

### Settings

The script requires configuration in the JIRA's Settings popup.

* Click on the _Settings_ in JIRA Service Desk
* Under the "SEVERITY INFO URLS"
  * Enter a link to a wiki page explaining the severity levels - this will be loaded in a new tab when you click on the Severity info icon
  * Enter a link to an page which contains the Severity Levels - this will be embedded in an iframe and displayed when you mouse over the Severity info icon

## How to install

1. Install Tampermonkey browser extension (for [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/), [Microsoft Edge](https://www.microsoft.com/store/apps/9NBLGGH5162S))
2. Go to [JIRA_Service_Desk_Severity_Info in OpenUserJS](https://openuserjs.org/scripts/mirogta/JIRA_Service_Desk_Severity_Info)
3. Click on the "Install" button

Then you can go to your JIRA Service Desk URL and use the improvements on any issue page which has the Severity field.

## License

Licensed under [MIT License](./LICENSE).

## Technology Used

* JIRA
* VanillaJS
* OpenUserJS
* TamperMonkey
