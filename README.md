# Juniper's Repairbug Enhancement Scripts

## Installation
1. Install [Tampermonkey](https://www.tampermonkey.net/) ([Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo))([Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search))([Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd))([Safari](https://apps.apple.com/us/app/tampermonkey/id1482490089)).
2. Click on the link of each script you would like to install.
3. You can open the Tampermonkey Dashboard at any time to disable or enable each script.

## The scripts
### [Eftpos Surcharge Total](https://gist.github.com/junething/49e802f33f6c507a5e7fc4f37cf616be/raw/mybug_show_surcharge.user.js)
Displays the eftpos total with surcharge added below the standard total. Also fixes the issue where the repair total showed the full cost of the repair instead of taking into account the deposit and showing the amount owed.

### [Price Label Buttons](https://gist.github.com/junething/49e802f33f6c507a5e7fc4f37cf616be/raw/price_label_buttons.user.js)
Adds coloured buttons above the search bar that add the colour label items in one click.

### [List Used Parts](https://gist.github.com/junething/49e802f33f6c507a5e7fc4f37cf616be/raw/list_used_parts.user.js)
Adds a button on the Find Repairs page to generate a list of parts used over the selected period. Output is formated like an EOD report for easy printing on a receipt printer.

**NOTE: Generating the report takes a long time (depending on how many repairs are in the table).** This is to not stress the MyBug server or the store internet, as every repair is a seperate request to the server and internally loads and parses the entire repair page.

### [Repair Contract Reminder](https://gist.github.com/junething/49e802f33f6c507a5e7fc4f37cf616be/raw/repair_contract_reminder.user.js)
Adds a banner reminding staff to make sure the customer signs contracts about certain repairs, including for all iPhones 12 and up. Not all stores use these contracts and the script does not know everything, use your discretion.

### [More Sales Numbers](https://gist.github.com/junething/49e802f33f6c507a5e7fc4f37cf616be/raw/sales_reports.user.js)
Adds a button on the *FIND END OF DAYS* page to generate a CSV of daily sales numbers with seperate *Accessories* and *Repairs* columns. Choose between *This Month*, *Last Month*, *This Year*, and *Last Year*. 
