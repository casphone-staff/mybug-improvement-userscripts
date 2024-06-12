// ==UserScript==
// @name         Eftpos Surcharge Total
// @namespace    https://github.com/junething
// @version      0.7
// @description  Display the Eftpos surcharge total
// @author       Juniper
// @updateURL    https://gist.github.com/junething/49e802f33f6c507a5e7fc4f37cf616be/raw/mybug_show_surcharge.user.js
// @downloadURL  https://gist.github.com/junething/49e802f33f6c507a5e7fc4f37cf616be/raw/mybug_show_surcharge.user.js
// @match        https://mybug.com.au/sell/add*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // collect existing DOM elements
    let total_row = document.querySelector("#sell_details > div > div.csm_page_desc.border-top > div:nth-child(4) > div");
    let totals_box = document.querySelector("#sell_details > div > div.csm_page_desc.border-top");
    let total_div = document.querySelector("#total_gross");
    let total_label = document.querySelector("#sell_details > div:nth-child(2) > div.csm_page_desc.border-top > div:nth-child(6) > div > h2.col-md-4.col-sm-4.col-xs-4.pull-left.text-left");
    let search = document.querySelector("#product_filter");
    let pay_status_row = document.querySelector("#sell_details > div > div.csm_page_desc.border-top > div:nth-child(5)");

    // deposit field, only exists on final payments on repairs where a deposit has been made
    // can be null
    let deposit_span = document.querySelector("#deposit_paid_container > div.col-md-4.col-sm-4.col-xs-4.pull-right.text-right > span");

    // create and setup new elements
    let final_total_row = document.createElement('div');
    final_total_row.className = "row";

    let surcharge_row = document.createElement('div');
    surcharge_row.className = "row";
    surcharge_row.innerHTML =
        `<div class="col-md-4 col-sm-4 col-xs-4 pull-left text-left">
             <span>SURCHARGE (INCLUDED):</span>
         </div>
         <div class="col-md-4 col-sm-4 col-xs-4 pull-right text-right">
             <span id="_surcharge"></span>
         </div>`

    final_total_row.className = "row";
    final_total_row.innerHTML =
        `<div class="csm_page_desc total">
             <h2 class="col-md-4 col-sm-4 col-xs-4 pull-left text-left"  style="margin: 0;">EFTPOS TOTAL:</h2>
             <h2 class="col-md-4 col-sm-4 col-xs-4 pull-right text-right" id="total_gross_surcharge" style="margin-bottom: 0;"></h2>
         </div>`;

    // insert elements
    if(pay_status_row != null) {
        totals_box.insertBefore(surcharge_row, pay_status_row);
        //totals_box.insertBefore(final_total_row, pay_status_row);
    } else {
        totals_box.appendChild(surcharge_row);
    }
    totals_box.appendChild(final_total_row);

    // get new elements
    let final_total_div = document.getElementById("total_gross_surcharge")
    let surcharge_div = document.getElementById("_surcharge");
    window.skipNextCallback = false;
    // update surcharge
    let update = function () {
        if(window.skipNextCallback) {
            window.skipNextCallback = false;
            return;
        }
        // calculate surcharge
        let total = parseFloat(total_div.innerText.substring(1));
        // if a deposit exists it needs to be take from the total
        try {
            if (deposit_span.innerText != "$0.00") {
                let deposit = parseFloat(deposit_span.innerText.substring(1));
                total -= deposit;
                window.skipNextCallback = true;
                total_div.innerText = `\$${total}`;
                total_label.innerHTML = `TOTAL (WITHOUT DEPOSIT)`;
            }
        } catch (error) { console.error(error); }
        let real_total = (Math.round((total*1.009)*Math.pow(10,2))/Math.pow(10,2)).toFixed(2);
        let just_surcharge = (Math.round(((real_total - total)*1.009)*Math.pow(10,2))/Math.pow(10,2)).toFixed(2);
        surcharge_div.innerHTML = `\$${just_surcharge}`
        final_total_div.innerText = `\$${real_total}`;
        console.log(`Final Total with surcharge: \$${real_total}`);
    }

    // listen for updates
    // call update once to set surchage
    update();
    // Options for the observer (which mutations to observe)
    const config = { attributes: true, childList: true, subtree: true };
    // Callback function to execute when mutations are observed
    const callback = update;
    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);
    // Start observing the target node for configured mutations
    observer.observe(total_div, config);
    // Later, you can stop observing
    //observer.disconnect();

})();
