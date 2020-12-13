This directory contains scripts that generate static files that are included in AntAlmanac client.

When ran, their outputs will be placed in the `output` directory.

### catalogue_builder.js
This builds `buildingCatalogue.js` by scraping information from `https://map.uci.edu`.
#### Usage
`node catalogueBuilder.js`
#### How it works
https://map.uci.edu uses an API to get its data. The script uses the API to retrieve location data. Locations belong to
categories like "Facilities", "Food and Dining" etc. We have manually selected most of these categories of locations to 
be included in the data. We excluded irrelevant locations such as bathrooms, parking lots, mail boxes etc.

The script then runs through all the locations retrieved and adds their information to the output if it belongs to any 
of the relevant categories.

To see the relevant categories and locations go [here](https://map.uci.edu/?id=463#!s/?ct/8424,8309,8311,8392,8405,44392,44393,44394,44395,44396,44397,44398,44400,44401,44402,44538,44537,44399,8396,11907,8400,10486,11906,11889,8310,8312,8393,8394,8397,8398,8399,8404,8407,8408,11891,11892,11899,11900,11902,21318,8406,11908,11935).