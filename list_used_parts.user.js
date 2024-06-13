// ==UserScript==
// @name         List Used Parts
// @namespace    https://github.com/junething
// @version      0.1
// @description  Collate a list of parts used over the selected period.
// @author       Juniper
// @match        https://mybug.com.au/repair/find
// @icon         https://www.google.com/s2/favicons?sz=64&domain=mybug.com.au
// @updateURL    https://raw.githubusercontent.com/casphone-staff/mybug-improvement-userscripts/main/list_used_parts.user.js
// @downloadURL  https://raw.githubusercontent.com/casphone-staff/mybug-improvement-userscripts/main/list_used_parts.user.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    // Add button
    let exportList = document.getElementById('exportlist');
    let parts_button = document.createElement('a');
    parts_button.innerHTML = '<div>PARTS</div>'
    parts_button.style.cssText = `float: left; margin: 5px; padding: 0px 2px; cursor: pointer; border: 1px solid #29AAE2; border-radius: 5px; background-color: #29AAE2; color: #ffffff; font-weight: bold; text-decoration: none;`;
    exportList.appendChild(parts_button);
    let store = document.querySelector("#wrapper > div.csm_needhelp > span.csm_page_desc.current_store.static").innerHTML.replace('! ', '');
    parts_button.addEventListener('click', async function () {
        console.log(`Fetching part information`);
        try {
            const parser = new DOMParser();
            let part_table = {};
            window.__part_list = part_table; // for debugging only

            let count = 0;
            let table_body = undefined
            parts_button.innerHTML = `<div><i class="fa fa-spinner fa-spin"></i> Waiting</div>`;
            do {
                // wait for table to load.
                table_body = document.querySelector("#tablecontent > table > tbody");
            } while(!table_body);
            let from_date = document.querySelector("#from").value.replace(/(\d+:\d+)/, '').replace(',', '').trim();;
            let to_date = document.querySelector("#to").value.replace(/(\d+:\d+)/, '').replace(',', '').trim();

            let next_button = document.querySelector("#paginator > a > i.fa-forward")?.parentElement;
            let pages = 1;
            if(next_button != undefined) {
                pages = next_button.parentElement.childElementCount - 4;
            }
            let urls = [];
            for(let p = 0; p < pages; p++, next_button?.click()) {
                table_body = document.querySelector("#tablecontent > table > tbody");
                let page_urls = Array.from(table_body.rows).map(row => row.querySelector('[data-title="Repair Number"] > a').href);
                console.log(`Page ${p}: ${page_urls.length} repairs`);
                urls= urls.concat(page_urls);
            }
            let total = urls.length;
            parts_button.innerHTML = `<div><i class="fa fa-spinner fa-spin"></i> ${count}/${total}</div>`;
            console.log(urls);
            async function process_url(url) {
                console.log(`loading ${url}`);
                try {
                    let response = await fetch(url);
                    let text = await response.text();
                    let repair_page = parser.parseFromString(text, "text/html");
                    let device = repair_page.getElementById("printaction_device").textContent.trim();
                    console.log(`Repair page for a ${device} loaded`);
                    // for each repair/product in the repair
                    [...repair_page.querySelector("#repair_types_list > table").rows].slice(1).forEach(repair => {
                        let repair_name = repair.querySelector('.repair-type-product_type').textContent;
                        let part = repair_name.replace(/replacement/gi, '');

                        // ensure part is in the 'list'
                        if(!(device in part_table)) part_table[device] = {};
                        if(!(part in part_table[device])) part_table[device][part] = 0;
                        // increment part count by one
                        part_table[device][part] += 1;

                    });
                    count++;
                    parts_button.innerHTML = `<div><i class="fa fa-spinner fa-spin"></i> ${count}/${total}</div>`;
                } catch {}
            }
            while(urls.length > 0) {
                await Promise.all([process_url(urls.pop()),process_url(urls.pop()),process_url(urls.pop()),process_url(urls.pop())]);
            }
            let content = '';
            content = `<html><head><style>
                body * { font-family: 'Roboto', serif !important;  color: #000 !important;  -webkit-font-smoothing: antialiased; }
                body { padding: 37px 20px !important; }
                .casphone_img_div { margin: 0 auto; }
                .casphone_img_div { max-height: none; max-width: none; width: 100%; }
                .casphone_img_div img { max-width: 100%; width: auto; }
                #wrapper h1 { font-size: 30px; width: 100%; margin-top: 25px; margin-bottom: 5px; text-align: center; font-weight: 500; }
                #wrapper .welcome-text { margin-bottom: 15px; padding: 0; text-align: center; }
                #wrapper { font-size: 16px; line-height: 1.2em; }
                table.part_list { width: 100%; margin: 15px 0 0 0; }
                table { border-spacing: 0; border-collapse: collapse; }
                .right { text-align: right; }
                .border-top { border-top: 1px solid black; }
                .border-bottom { border-bottom: 1px solid black; }
            </style>
            </head>
            <body>
            <div id="wrapper"><div class="container-fluid">
            <div class="casphone_img_div">
                <img class="casphone_image" alt="Casphone" src="https://mybug.com.au/modules/template/template/default/images/logo-full-bw.png">
            </div>
            <h1>PARTS USED</h1>
            <div class="welcome-text">${store}</div>
            <div>FROM: ${from_date}</div>
            <div>TO: ${to_date}</div>
            `;
            content += `<table class="part_list">`;
            content += `<tr class="border-bottom"><td style="text-align: center;"><strong>PARTS USED SUMMARY</strong></td><tr>`;
            let total_parts = 0;
            for (const [device, parts] of Object.entries(part_table)) {
                content += `<tr><td colspan="2"><strong>${device}</strong></td></tr>`;
                for (const [part, amount] of Object.entries(parts)) {
                    content += `<tr><td>${part}</td><td class="right">${amount} </td></tr>`
                    total_parts += amount;
                }
            }
            content += `<tr class="border-top"><td>TOTAL:</td><td class="right">${total_parts}</td><tr>`;
            content += `</table>`;
            //modalMsg(content);
             content += `</div></div></body></html>`;

            var newWin = window.open('about:blank', 'Sell Summary Receipt', 'width=365,height=815');
            if(!newWin || newWin.closed || typeof newWin.closed=='undefined')
            {
                //POPUP BLOCKED
                window.modalMsg('Print Popup was blocked! Please add this site to your exception list.');
                return false;
            }
            newWin.document.write(content);

        } catch (e) {
            throw e;
        } finally {
            parts_button.innerHTML = '<div>PARTS</div>'
        }
        console.log(`Done`);
    });
})();
