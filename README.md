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
* Install Violentmonkey extension in chrome or firefox
* Dashboard → New script → paste the script in GEE_Autocomplete → F5 refresh GEE website
![gif](https://github.com/Jackli9218/GEE/blob/master/public/img/gif.gif)
3.Updates
---
to be continue

GEEAutocomplete.json specification
---
 {
"label": "ee.Image.cat()",<br>
"Arguments":"var_args (VarArgs<Image>):The images to be combined",<br>
"Function": "ee.Image.cat(var_args)",<br>
"Returns":"Image",<br>
"Link":"https://developers.google.com/earth-engine/image_overview"<br>
}
  
## GEE Download plugin
https://raw.githubusercontent.com/kongdd/gee_monkey
