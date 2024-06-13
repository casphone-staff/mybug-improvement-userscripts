// ==UserScript==
// @name         Price Label Buttons
// @namespace    https://github.com/junething
// @version      0.3
// @description  Add buttons above the search bar to add the color label items in one click.
// @author       Juniper
// @updateURL    https://raw.githubusercontent.com/casphone-staff/mybug-improvement-userscripts/main/price_label_buttons.user.js
// @downloadURL  https://raw.githubusercontent.com/casphone-staff/mybug-improvement-userscripts/main/price_label_buttons.user.js
// @match        https://mybug.com.au/sell/add
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let color_barcodes = {
        'green': '20221990',
        'yellow': '20222990',
        'orange': '20223990',
        'pink': '20224990',
        'red': '20225990',
        'blue': '20226990',
        'white': '20227990',
        'black': '20228990'
    };
    document.body.appendChild(Object.assign(document.createElement("style"), {
        textContent: `
        .dot {
            height: 40px;
            width: 40px;
            margin: 0px 6px 6px 0px;
            background-color: #bbb;
            border-radius: 50%;
            border: 1.5px solid black;
            display: inline-block;
            transition: transform .2s; /* Animation */
        }
        .dot:hover {
            transform: scale(1.3);
        }
        `}))

    let sell_details = document.querySelector('#sell_details');
    let label_row = document.createElement('div');
    let search = document.querySelector("#product_filter");

    document.add_label = function (color) {
        search.value = color_barcodes[color];
        search.dispatchEvent(new Event('input'));
    };

    label_row.className = 'row';
    label_row.innerHTML = `
        <span class="dot" style="background-color: #26a700" onclick="add_label('green')"></span>
        <span class="dot" style="background-color: #ffff00" onclick="add_label('yellow')"></span>
        <span class="dot" style="background-color: #ff9933" onclick="add_label('orange')"></span>
        <span class="dot" style="background-color: #ff66cc" onclick="add_label('pink')"></span>
        <span class="dot" style="background-color: #ff0000" onclick="add_label('red')"></span>
        <span class="dot" style="background-color: #0066ff" onclick="add_label('blue')"></span>
        <span class="dot" style="background-color: #ffffff" onclick="add_label('white')"></span>
        <span class="dot" style="background-color: #000000" onclick="add_label('black')"></span>
    `;
    sell_details.insertBefore(label_row, sell_details.firstChild);
    // Your code here...
})();
