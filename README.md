# tampermonkey-jira-severityinfo

Tampermonkey script to add severity info popup to JIRA Service Desk issues.

## What does it do

Adds an info icon next to Severity field on JIRA Service Desk issues.

When you mouse over the info icon, you'll see the Severity level explanation.

### Advanced Usage

The script also adds a configurable link to the JIRA's Settings popup.

* Click on the _Settings_ in JIRA Service Desk
* Enter a link to a page explaining the severity levels under "SEVERITY INFO URL"

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
