This folder is to be used for custom language files.
Use the Custom language file to define:
	* The new entries you want to use in the portal.
	* Overwrite the existing strings in the portal.

CREATING CUSTOM LANGUAGE FILES
****************************************************************
In order to use custom language entries:

1) Create a file(s) with the same name as your standard language file(s) and place it in this folder. 
	For example, if your self-service portals are in English US, create the file en-US.js. If your self-service portals exist in French and Spanish, create two files - fr-FR.js and es-ES.js.

2) Add new entries you wish to use to the created file(s). You should also place the entries you wish to overwrite here.
For example, if your your file looks like this:

       define({
          
		"ENTRY1" : "My wonderful topic 1",
		"ENTRY2" : "My wonderful topic 2",
		"ENTRY3" : "My wonderful topic 3",
        "TOPICS" : "Customized Topics Header"
       });
       
	In the example, the first three entries are additional language strings to be used in the portals, and the last one is ovewriting the entry with the same key from the standard language file. At runtime, both standard and custom language files are merged. If there are any of the out-of-the box entries defined in the custom file, values from the custom file are used.

	IMPORTANT THINGS TO NOTE:
	* The names of the keys, which you are overwriting, should exactly match the keys defined in standard language file. 
	* Make sure you follow the syntax above in your custom file. Note that there is no comma after the last entry.


3) Make sure that the custom language file(s) are present in the /custom folder in all the languages that your self-service portals support.
    	  
UPDATING MANIFEST.JSON FILE
****************************************************************
After you have created the custom file, update the manifest.json file at \<egain_home>\eService\templates\selfservice\<template_folder_name>.

* Modify the following attribute in your manifest.json under portal variables:
      "isCustomLangFilePresent" : false,
	- change it to true.
If your manifest.json is of an older version than 11.0.4 and doesn't contain the above attribute, you need to add it manually to your manifest.json and set it to true. 
Add this new attribute after the following line:  "language":"$PORTAL_INFO:defaultContentLanguageTag",

IMPORTANT: Make sure that if the isCustomLangFilePresent flag is set to true, the custom language file(s) are present in the /custom folder in all the languages that your self-service portals support.


