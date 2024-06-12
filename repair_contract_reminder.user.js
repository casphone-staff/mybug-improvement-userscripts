// ==UserScript==
// @name         Repair Contract Reminder
// @namespace    https://github.com/junething
// @version      0.4
// @description  Remind staff to have the customer sign a contract adress the risk of breaking the screen when repairing iPhones 12 and up.
// @author       Juniper
// @match        https://mybug.com.au/repair*
// @updateURL    https://gist.github.com/junething/49e802f33f6c507a5e7fc4f37cf616be/raw/repair_contract_reminder.user.js
// @downloadURL  https://gist.github.com/junething/49e802f33f6c507a5e7fc4f37cf616be/raw/repair_contract_reminder.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // check if device string needs and warning and then warn
    function add_warning(message, id="generic", style = "") {
        console.log(`adding warning "${message} for ${id}`);
        let details = document.getElementById("details");
        if(!details) {
            details = document.getElementById("add_repair_form");
        }
        let reminder = document.getElementById('warning_' + id);
        if(!reminder) {
            reminder = document.createElement('div');
            reminder.id = 'warning_' + id;
            details.insertBefore(reminder, details.firstChild);
        }
        reminder.innerHTML = message
        reminder.style = `
                    background: #FAA;
                    border-radius: 20px;
                    color:#fff;
                    padding: 5px 10px;
                    font-size: 1.5em;
                    line-height: normal;
                    margin: 0;` + style;
    }
    function check_and_warn (device, details_page = true, repairs = []) {
        if (!device) return;
        // Opening device
        let gen = device.match(/\d+/)[0]
        if ( (/iPhone/i.test(device) && gen >= 12)
          || (/iPad Air/i.test(device) && gen > 1)
          || (/iPad Mini/i.test(device) && gen > 3)
          || /Surface/i.test(device)
          || /iPad Pro/i.test(device)) {
            if(!repairs.includes("Screen Replacement")) {
                let message = `<i class="fa fa-warning"></i> This is an ${device}! There is risk involved with removing the screen, please have the customer sign the appropriate form and explain the risk?`;
                add_warning(message, 'screen');
                if (!details_page) window.alert(message);
            }
        }
        if(repairs.includes("Water Damage")) {
            let message = `<i class="fa fa-tint"></i> This is a water damage repair! Please have the customer sign the water damage disclaimer form and inform them about the risks and lack of warranty!`;
            add_warning(message, 'water', 'background: #4fa0d6;');
            if (!details_page) window.alert(message);
        }
    }
    // if page is the details page
    if (/details/.test(window.location.href)) {
        let device = document.getElementById("printaction_device").textContent.trim();
        let repair_html = document.querySelector("#printaction_product_type").innerHTML;
        let repairs = [];
        if(/water damage/i.test(repair_html)) {
            repairs.push("Water Damage");
        }
        if(/screen replacement/i.test(repair_html)) {
            repairs.push("Screen Replacement");
        }
        check_and_warn(device, true, repairs);
        return;
    }

    // otherwise must be the new repair page
    let device_select = document.querySelector("#device_chosen");
    if(!device_select) throw 'no device chooser found';

    const config = { attributes: true, childList: true, subtree: true };
    // Callback function to execute when mutations are observed
    const callback = function() { check_and_warn(device_select.firstChild.firstChild.textContent) };
    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);
    // Start observing the target node for configured mutations
    observer.observe(device_select, config);
    // Later, you can stop observing
    //observer.disconnect();
})();
