define(['backbone', 'handlebars'], function(Backbone, Handlebars) {
        
    //Language is the module that holds all the 
    //language-related functionalities of the application.
    var Language = Backbone.Model.extend({

        initialize : function(options) {
            
            this.isReady = false;
        },

        /** Loads the standard language file */
        load : function(lang, isCustomLangFilePresent) {
        	
        	var lang = lang || 'en-US';
            this._lang = lang;
            this._isCustomLangFilePresent = isCustomLangFilePresent;

            require(['languages/' + lang], _.bind(this._onLanguageFileLoad, this));
        },

        /** Saves created language object and tries to load custom language file if the flag in the manifest
         * indicates such a file exists.
         */
        _onLanguageFileLoad : function(standardLangObject) {

        	console.log('LANGUAGE FILE is loaded.', standardLangObject);
        	
        	this._langObject = standardLangObject;
            
            // load custom language file if present
            if (this._isCustomLangFilePresent) {
	            require(['languages/custom/' + this._lang], _.bind(this._onCustomLanguageLoad, this));
            }
            else {            
	            this.isReady = true;
	            this.trigger('ready');
            }
        },
        
        /** Merges the standard language file with the custom one. */
        _onCustomLanguageLoad : function(customLangObject) {
        	
        	console.log('CUSTOM LANGUAGE FILE is loaded.', customLangObject);
        	
        	if (customLangObject)
        		$.extend(this._langObject, customLangObject);
        	
        	this.isReady = true;
            this.trigger('ready');
        },

        getString : function(stringName) {
            
            if(app.page.getQueryString('__testlang__') == "1") {

                return "xxxx";

            } else {

                return this._langObject[stringName];
            }
        },

        compileString : function(stringName, argObject) {

            var langStr = this.getString(stringName) || '';

            return new Handlebars.compile(langStr)(argObject);
        }
    });
    
    return Language;
});
