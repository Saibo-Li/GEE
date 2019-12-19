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
* **Details:** a  official document of this function<br>
* **Demo:** a demo of this function<br>
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
The majority of GEE users are required to supplement `demo` of the method information according to the data structure of GEEAutocomplete.json file.<br>
Send it to my email address (742187365@qq.com) or submit it on Github.
* [GEEAutocomplete.json](https://github.com/Jackli9218/GEE/blob/master/public/GEEAutocomplete.json)<br>
 ` GEEAutocomplete.json demo :` <br>
 {<br>
	"label": "ee.Algorithms.CannyEdgeDetector()",<br>
	"Details": "https://developers.google.com/earth-engine/api_docs#ee.algorithms.cannyedgedetector",<br>
	"Usage": "ee.Algorithms.CannyEdgeDetector(image, threshold, sigma)",<br>
	"Returns": "Image",<br>
	"Link": "https://github.com/Jackli9218/GEE/blob/master/public/GEEAutocomplete.json"<br>
}<br>
to be continue<br>
 
### GEEAutocomplete.js<br>
Send email to me ask for GEEAutocomplete.js (742187365@qq.com)

## GEE Download plugin
https://github.com/kongdd/gee_monkey


