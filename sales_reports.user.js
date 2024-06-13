// ==UserScript==
// @name         More Sales Numbers
// @namespace    https://github.com/junething
// @version      0.1
// @description  Create a report that includes sales AND repairs as seperate values for better comparison.
// @author       Juniper
// @match        https://mybug.com.au/sell/findendofday
// @updateURL    https://raw.githubusercontent.com/casphone-staff/mybug-improvement-userscripts/main/sales_reports.user.js
// @downloadURL  https://raw.githubusercontent.com/casphone-staff/mybug-improvement-userscripts/main/sales_reports.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mybug.com.au
// @grant        none
// ==/UserScript==
/* eslint no-multi-spaces: 0 */  // --> OFF
(function() {
    'use strict';
    // exportToCsv source: https://stackoverflow.com/a/24922761
    function exportToCsv(filename, rows) {
        var processRow = function (row) {
            var finalVal = '';
            for (var j = 0; j < row.length; j++) {
                var innerValue = row[j] === null ? '' : row[j].toString();
                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                };
                var result = innerValue.replace(/"/g, '""');
                if (result.search(/("|,|\n)/g) >= 0) {
                    result = '"' + result + '"';
                }
                if (j > 0) {
                    finalVal += ', ';
                }
                finalVal += result;
            }
            return finalVal + '\n';
        };
        var csvFile = '';
        for (var i = 0; i < rows.length; i++) {
            csvFile += processRow(rows[i]);
        }

        var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
    function date_range_filter_from_name(date_range_name) {
        let current = /this/.test(date_range_name);
        let period = date_range_name.split('_')[1];
        let today = new Date();
        let d = today.getDate();
        let m = today.getMonth();
        let y = today.getFullYear();
        let inflection;
        let last;
        switch(period) {
            case 'month':
                inflection = new Date(y, m, 1);
                last = new Date(y, m - 1, 1);
                break;
            case 'year':
                inflection = new Date(y, 0, 1);
                last = new Date(y - 1, 0, 1);
                break;
            default:
                throw new Error(`Unknown period ${period}`);
                break;
        }
        let to = current ? today : inflection;
        let from = current ? inflection : last;
        return { from: from, to: to};
    }
    window.date_range_filter = date_range_filter_from_name;
    // parses dates in the format dd/mm/yyyy to a JS Date object
    function parse_date(datestr) {
        return new Date(datestr.split('/').reverse().join('-'))
    }
       
    // Add button
    let exportList = document.getElementById('exportlist');
    let report_button = document.createElement('a');
    report_button.innerHTML = `<div>REPAIR REPORT (CSV)</div>`;
    let report_period_select = document.createElement('select');
    report_period_select.innerHTML = `
    <option value="this_month">This month</option>
    <option value="last_month" selected="selected">Last month</option>
    <option value="this_year">This year</option>
    <option value="last_year">Last year</option>
    `;

    let button_style = `float: left; margin: 5px; padding: 0px 2px; cursor: pointer; border: 1px solid #29AAE2; border-radius: 5px; background-color: #29AAE2; color: #ffffff; font-weight: bold; text-decoration: none;`;
    report_button.style.cssText = `${button_style} margin-right: 0; border-radius: 5px 0 0 5px`;
    report_period_select.style.cssText = `${button_style} margin-left: 0; border-radius: 0 5px 5px 0; padding: 2px; border-color: #098AC2 !important; background-color: #098AC2 !important;`;

    exportList.appendChild(report_button);
    exportList.appendChild(report_period_select);
    report_button.addEventListener('click', async function () {
        console.log(`Fetching EOD information`);
        let range = date_range_filter_from_name(report_period_select.value);
        const parser = new DOMParser();
        let rows = [];
        window.__days_rows = rows; // for debugging only
        let table_body = null;
        while(!table_body) {
            //await (new Promise(r => setTimeout(r, 100)));
            table_body = document.querySelector("#tablecontent > table > tbody");
        }
        let count = 0;
        let next_button = document.querySelector("#paginator > a > i.fa-forward")?.parentElement;
        let pages = 1;
        if(next_button != undefined) {
            pages = next_button.parentElement.childElementCount - 4;
        }
        // to stop an infinite loop if there is an issue. Should be over the maximum numner of rows needed to iterate over.
        let max = 1000
        let urls = [];
        for(let p = 0; p < pages && urls.length < max; p++, next_button?.click()) {
            next_button = document.querySelector("#paginator > a > i.fa-forward")?.parentElement; // needs redefining each time is clicked
            console.log(`Page {p}`);
            table_body = document.querySelector("#tablecontent > table > tbody");
            let page_urls = Array.from(table_body.rows).map(row => {return {
                url: `https://mybug.com.au/sell/receipteod/${row.querySelector('[data-title="ID"]')?.textContent?.replace(".", "")}`,
                date: parse_date(row.querySelector('[data-title=" From"]')?.textContent),
                daily_total: row.querySelector('[data-title=" Daily total"]')?.textContent,
                refunds: parseFloat(row.querySelector('[data-title="Cash refunds"]')?.textContent) + parseFloat(row.querySelector('[data-title="Eftpos refunds"]')?.textContent),
                grand_total: row.querySelector('[data-title=" Grand total"]')?.textContent,
            }}).filter(row => row.date >= range.from && row.date < range.to);
            console.log(`Page ${p}: ${page_urls.length} EODs`);
            urls = urls.concat(page_urls);
            if(urls.length > 0 && page_urls.length == 0) {
                console.log(`Found ${urls.length} EOD's in range ${range.from} to ${range.to}`);
                break;
            }
        }
        console.log("Finished iterating rows");
        document.querySelector("#paginator > a:nth-child(1)")?.click();
        urls = urls.slice(0, max);
        let total = urls.length;
        report_button.innerHTML = `<div><i class="fa fa-spinner fa-spin"></i> ${count}/${total}</div>`;
        // The CSV headers
        rows.push(['Date', 'Accessories', 'Repairs', 'Gross Total', 'Refunds', 'Grand Total']);
        async function process_url(eod) {
            if(!eod) return;
            console.log(eod);
           // try {
                let response = await fetch(eod.url);
                let text = await response.text();
                let eod_printout = parser.parseFromString(text, "text/html");
                let queryPrefix = '#page-content > div > div > ';
                let accessories = parseFloat(eod_printout.querySelector(queryPrefix + "table:nth-child(5) > tbody > tr:nth-child(2) > td:nth-child(3)").textContent.replace(",", ""));
                let repairs = parseFloat(eod_printout.querySelector(queryPrefix + "table:nth-child(5) > tbody > tr:nth-child(3) > td:nth-child(3)").textContent.replace(",", ""));
                       // "total": parseFloat(),
                let expenses =     parseFloat(eod_printout.querySelector(queryPrefix + "table:nth-child(7) > tbody > tr:nth-child(4) > td:nth-child(3)").textContent.replace(",", ""));
                count++;
            rows.push([eod.date.toISOString().split('T')[0].replaceAll('-', '/'), accessories, repairs, eod.daily_total, eod.refunds, eod.grand_total]);
                report_button.innerHTML = `<div><i class="fa fa-spinner fa-spin"></i> ${count}/${total}</div>`;
            //} catch {}
        }
        while(urls.length > 0) {
            await Promise.all([process_url(urls.pop()),process_url(urls.pop()),process_url(urls.pop()),process_url(urls.pop())]);
        }
        console.log(rows);
        exportToCsv("summary.csv", rows);
        report_button.innerHTML = '<div>REPAIR REPORT (CSV)</div>'
    });
})();
