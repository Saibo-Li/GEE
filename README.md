Google Earth Engine Autocomplete Command Plan
==
Aim
---
With the increasing number of users of GEE, the plan aims to solve the problems of the Earth Engine Code Editor, <br>
such as the lack of auto-complete command function and the simple interpretation of Docs documents,<br>
which is not conducive to the public learning and use.

## GEE_Autocomplete plugin

1.Functions
---
![plugin](https://github.com/Jackli9218/GEE/blob/master/public/img/function.png)<br>
* **Copy:** copy the selected function, or click filter results to complete the copy<br>
* **Link:** a demo of this function<br>
to be continue

2.Installation
---
You need chrome and Violentmonkey (firefox is also OK)<br>
* Install Violentmonkey extension in chrome or firefox<br>
* Dashboard → New script → paste the script in GEE_Autocomplete → F5 refresh GEE website<br>
![gif](https://github.com/Jackli9218/GEE/blob/master/public/img/gif.gif)<br>

3.Updates
---
At present, this plug-in is only used for demonstration, <br>
The majority of GEE users are required to supplement the method information according to the data structure of GEEAutocomplete.json file.<br>
Send it to my email address (742187365@qq.com) or submit it on Github.
* [GEEAutocomplete.json](https://github.com/Jackli9218/GEE/blob/master/public/GEEAutocomplete.json)<br>
 ` Specification :` <br>
 {<br>
"label": "function name",<br>
"Arguments":"parameters required by the function",<br>
"Function": "function name with parameters",<br>
"Returns":"return type",<br>
"Link":"function demo"<br>
}<br>
 ` GEEAutocomplete.json demo :` <br>
  {<br>
"label": "ee.Image.cat()",<br>
"Arguments":"var_args (VarArgs<Image>):The images to be combined",<br>
"Function": "ee.Image.cat(var_args)",<br>
"Returns":"Image",<br>
"Link":"https://developers.google.com/earth-engine/image_overview"<br>
}<br>
to be continue<br>
 
### GEEAutocomplete.js<br>
Send email to me ask for GEEAutocomplete.js (742187365@qq.com)

## GEE Download plugin
https://raw.githubusercontent.com/kongdd/gee_monkey


