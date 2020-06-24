// ==UserScript==
// @name         JIRA Service Desk Severity Info
// @namespace    http://github.com/mirogta/
// @version      0.0.1
// @description  Add an explanation to severity levels on JIRA Service Desk issues
// @author       mirogta
// @license      MIT
// @homepageURL  https://github.com/mirogta/tampermonkey-jira-severityinfo
// @match        https://*.atlassian.net/browse/*
// @match        https://*.atlassian.net/jira/servicedesk/*
// @inject-into  content
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @compatible   firefox >=14
// @compatible   chrome >=18
// ==/UserScript==
// ==OpenUserJS==
// @author mirogta
// ==/OpenUserJS==

(function() {
    'use strict';

    console.log(`Initialising JIRA Service Desk Tampermonkey Script`);

    const severityDescriptions = {
        1: 'A critical incident with high impact',
        2: 'A major incident with significant impact',
        3: 'A minor incident with low impact',
        4: 'Bugs or support issues that don\'t impact product usability',
    };

    const configWikiUrlKey = 'configWikiUrlKey';

    GM_addStyle(`
#_severity_info { display: inline-block }
#_severity_info::before { content: " \\1F4AC"; margin: 10px }
#_severity_info span { display: none; position: absolute; width: 320px; background: #eee; padding: 4px; border-radius: 2px; }
#_severity_info:hover span { display: inline }
._severity_wrap { justify-content: left }
#_severity_url { width: 400px; margin: 10px 20px; border: 1px solid #ccc; }
`);

    function addSeverityInfo() {
        const noteEl = document.getElementById('_severity_info');
        if(noteEl) {
            return;
        }
        // find the severity field
        // NOTE: the DOM is obfuscated so we can't find it by element id or classname
        // but can find it via this selector
        const severityButton = document.body.querySelector('button[aria-label="Edit Severity"]');
        if(null == severityButton) {
            return;
        }
        const severityLabel = Array.from(document.querySelectorAll('h2')).find(el => el.textContent === 'Severity');
        if(null == severityLabel) {
            return;
        }
        const severityLevel = parseInt(severityButton.parentElement.innerText, 0);
        const container = severityLabel.parentElement;
        container.classList.add('_severity_wrap');
        if(null == container) {
            return;
        }
        console.log(`- adding severity info`);
        const infoEl = document.createElement('div');
        infoEl.id = '_severity_info';
        const descriptionEl = document.createElement('span');
        descriptionEl.id = '_severity_description';
        descriptionEl.dataset.severityLevel = severityLevel;

        infoEl.append(descriptionEl);
        container.append(infoEl);

        updateSeverityDescription();
    }

    function updateSeverityDescription() {
        const descriptionEl = document.getElementById('_severity_description');
        if(null == descriptionEl) {
            return;
        }
        const severityLevel = descriptionEl.dataset.severityLevel;
        const title = severityDescriptions[severityLevel];
        if(title) {
            let severityHeader = `Severity Level ${severityLevel}`;
            const severityUrl = GM_getValue(configWikiUrlKey);
            if(severityUrl) {
                severityHeader = `<a href="${severityUrl}" target="_severity_link">${severityHeader} (link)</a>`;
            }
            descriptionEl.innerHTML = `${severityHeader}:<br>${title}`;
        }
    }

    function addSeveritySettings() {
        // find the settings popup
        const severityConfigEl = document.getElementById('_severity_config');
        if(severityConfigEl) {
            return;
        }
        const settingsPopup = Array.from(document.querySelectorAll('h3')).find(el => el.textContent === 'Settings');
        const personalSettings = Array.from(document.querySelectorAll('div')).find(el => el.textContent === 'Personal settings');
        if(settingsPopup && personalSettings) {
            console.log(`- adding severity info settings`);

            const container = settingsPopup.parentElement;
            const configHeaderEl = document.createElement('div');
            configHeaderEl.id = '_severity_config';
            configHeaderEl.innerText = 'Severity Info URL'
            configHeaderEl.className = personalSettings.className;
            const configEl = document.createElement('input');
            configEl.id = '_severity_url';
            configEl.placeholder = "Please enter URL to a page explaning the severity levels…";
            configEl.addEventListener('change', saveConfig, false);

            const content = GM_getValue(configWikiUrlKey);
            if(content) {
                console.log(`- found severity config URL: ${content}`);
                configEl.value = content;
            }

            container.append(configHeaderEl);
            container.append(configEl);
        }
    }

    function saveConfig(event) {
        const content = event.target.value;
        GM_setValue(configWikiUrlKey, content);
        console.log(`- saved severity config URL: ${content}`);

        updateSeverityDescription();
    }


    let ob = new window.MutationObserver(function() {
        console.debug(`- content changed`);
        addSeveritySettings();
        addSeverityInfo();
    });

    ob.observe(document, {
        childList: true,
        subtree: true,
    });
})();