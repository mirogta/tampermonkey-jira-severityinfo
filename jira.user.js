// ==UserScript==
// @name         JIRA Service Desk Severity Info
// @namespace    http://github.com/mirogta/
// @version      0.0.4
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

    const configKeys = {
        wikiUrl: 'configWikiUrlKey',
        iframeUrl: 'configIframeUrlKey',
    };

    let preventDuplicate = false;

    GM_addStyle(`
body._blur::after { background-color: #563d7c; content: ""; display: block; position: fixed; top: 0px; left: 0px; width: 100%; height: 100%; z-index: 1000; opacity: 0.5; }
#_severity_info { z-index: 9999; position: absolute; }
#_severity_info:hover { cursor: pointer }
#_severity_info::before { content: " \\1F4AC"; padding: 10px }
#_severity_info span {
    display: none;
    position: absolute;
    width: 880px;
    background: #eee;
    padding: 20px;
    border-radius: 4px;
    right: 100px;
    height: 600px;
}
#_severity_info:hover span { display: inline }
#_severity_info iframe { width: 100%; height: 100%; background-color: #eee }
._severity_wrap { justify-content: left }
#_severity_description ul { list-style-type: none; padding-left: 0 }
._severity_url { display: block; width: 400px; margin: 10px 20px; border: 1px solid #ccc; }
`);

    function ensureSeverityInfo() {
        if(preventDuplicate === true || document.getElementById('_severity_info')) {
            return;
        }
        preventDuplicate = true;

        // delay loading, because JIRA elements are loading async
        // and elements' positions are jumping up/down
        setTimeout(addSeverityInfo, 2000);
    }

    function addSeverityInfo() {
        // find the severity field
        // NOTE: the DOM is obfuscated so we can't find it by element id or classname
        // but can find it via this selector
        const severityButton = document.body.querySelector('button[aria-label="Edit Severity"]');
        if(null == severityButton) {
            preventDuplicate = false;
            return;
        }
        const severityLabel = Array.from(document.querySelectorAll('h2')).find(el => el.textContent === 'Severity');
        if(null == severityLabel) {
            preventDuplicate = false;
            return;
        }
        const container = severityLabel.parentElement;
        container.classList.add('_severity_wrap');
        if(null == container) {
            preventDuplicate = false;
            return;
        }
        console.log(`- adding severity info`);
        const severityLevel = parseInt(severityButton.parentElement.innerText, 0);
        const infoEl = document.createElement('div');
        infoEl.id = '_severity_info';
        const descriptionEl = document.createElement('span');
        descriptionEl.id = '_severity_description';
        descriptionEl.dataset.severityLevel = severityLevel;

        const bodyRect = document.body.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offsetTop = containerRect.top - bodyRect.top;
        const offsetLeft = containerRect.left - bodyRect.left;
        infoEl.style.top = `${offsetTop}px`;
        infoEl.style.left = `${offsetLeft + severityLabel.offsetWidth}px`;

        infoEl.append(descriptionEl);
        document.body.append(infoEl);

        infoEl.addEventListener('click', loadWiki, false);
        infoEl.addEventListener('mouseover', function() {document.body.classList.add('_blur');}, false);
        infoEl.addEventListener('mouseout', function() {document.body.classList.remove('_blur');}, false);

        updateSeverityDescription();
    }

    function loadWiki() {
        const wikiUrl = GM_getValue(configKeys.wikiUrl);
        if(wikiUrl) {
            window.open(wikiUrl, '_severity_link');
        }
    }

    function updateSeverityDescription() {
        const descriptionEl = document.getElementById('_severity_description');
        if(null == descriptionEl) {
            return;
        }
        const iframeUrl = GM_getValue(configKeys.iframeUrl);
        if(iframeUrl) {
            descriptionEl.innerHTML = `<iframe src="${iframeUrl}"></iframe>`;;
        } else {
            descriptionEl.innerHTML = 'Please configure the severity URLs in the Settings…';
        }
    }

    function addSeveritySettings() {
        // don't add the settings popup if already present
        if(document.getElementById('_severity_config')) {
            return;
        }
        const settingsPopup = Array.from(document.querySelectorAll('h3')).find(el => el.textContent === 'Settings');
        const personalSettings = Array.from(document.querySelectorAll('div')).find(el => el.textContent === 'Personal settings');
        if(settingsPopup && personalSettings) {
            console.log(`- adding severity info settings`);

            const container = settingsPopup.parentElement;
            const configHeaderEl = document.createElement('div');
            configHeaderEl.id = '_severity_config';
            configHeaderEl.innerText = 'Severity Info URLs'
            configHeaderEl.className = personalSettings.className;

            const configEl = document.createElement('input');
            configEl.className = '_severity_url';
            configEl.placeholder = "Please enter Severity Levels wiki URL…";
            configEl.dataset.configKey = configKeys.wikiUrl;
            configEl.addEventListener('change', saveConfig, false);

            const configIframeEl = document.createElement('input');
            configIframeEl.className = '_severity_url';
            configIframeEl.placeholder = "Please enter Severity Levels iframe URL…";
            configIframeEl.dataset.configKey = configKeys.iframeUrl;
            configIframeEl.addEventListener('change', saveConfig, false);

            const content = GM_getValue(configKeys.wikiUrl);
            if(content) {
                console.log(`- found severity wiki URL: ${content}`);
                configEl.value = content;
            }

            const iframeUrl = GM_getValue(configKeys.iframeUrl);
            if(iframeUrl) {
                console.log(`- found severity iframe URL: ${iframeUrl}`);
                configIframeEl.value = iframeUrl;
            }

            container.append(configHeaderEl);
            container.append(configEl);
            container.append(configIframeEl);
        }
    }

    function saveConfig(event) {
        const content = event.target.value;
        const key = event.target.dataset.configKey;
        GM_setValue(key, content);
        console.log(`- saved severity ${key}: ${content}`);

        updateSeverityDescription();
    }


    let ob = new window.MutationObserver(function() {
        console.debug(`- content changed`);
        addSeveritySettings();
        ensureSeverityInfo();
    });

    ob.observe(document, {
        childList: true,
        subtree: true,
    });
})();