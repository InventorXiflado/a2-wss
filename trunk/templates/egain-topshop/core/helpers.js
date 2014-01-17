define(['jquery'], function($){ 

    //Helpers.
    var Helpers = {
        
        //Generate component paths.
        generateComponentPaths : function(name, lang, baseUrl) {
            
            var base_folder = 'components/standard/portal/' + name.replace('-', '/') + '/11.0.0';

            if(baseUrl) {

                base_folder = baseUrl + '/' + base_folder;

            } else {
                
                //TODO: should be automatic instead of getting from pathName
                //TODO : remove picasso hacking
                if(app.getDeployConfigKey('studioMode') === true) {

                    base_folder = '/selfservice/' + base_folder;

                } else {
                    
                    //We have to resolve the base folder from 
                    //the current pathName, the specified baseUrl.
                    //TODO : make this cleaner and more sturdy.
                    base_folder = URL.resolve(window.location.pathname,
                                              app.getDeployConfigKey('baseUrl'))
                                                + '/' + base_folder;
                }
            }

            var base_path = base_folder + '/' + name; 
            
            //Returns an object containing all 
            //the paths of the modules of the component.
            var paths = {

                css : 'text!' + base_path + '.css',
                html :  'text!' + base_path + '.html', 
                js : base_path + '.js',
                test : base_path + '.test',
                lang : base_folder + '/langs/' + 
                name + '.lang.' + (lang || 'en') + '.js'
            }

            //console.log("HELPER PATHS : ", paths);

            return paths;
        },

        generateNewComponentPaths : function(name, version, baseUrl) {

            var version = version || '11.0.0';

            // Take care of bad versions prior to 11.0.4
            var dotIndex = version.indexOf('.');
            if (dotIndex > 0) {
                var majorVersion = version.substring(0, dotIndex);
                if (parseInt(majorVersion, 10) < 11) {
                    version = "11.0.0";
                }
            }

            //Name would be in the format of standard.portal.article.content
            var componentPath = name.replace(/\./g, '/');
            var componentPathArray = name.split('.');
            var fileName = componentPathArray[2] + '-' + componentPathArray[3];
            var base_folder = 'components/'+ componentPath + '/' + version;

            //console.log('component path', componentPath);
            //console.log('file name', fileName);

            if(baseUrl) {

                base_folder = baseUrl + '/' + base_folder;

            } else {
            
                var pathname = window.location.pathname;

                    
                //We have to resolve the base folder from 
                //the current pathName, the specified baseUrl.
                //TODO : make this cleaner and more sturdy.
                base_folder = URL.resolve(pathname, app.getDeployConfigKey('baseUrl')).replace('?', '')
                                            + '/' + base_folder;

                //console.log("BASE URL", base_folder);

                if(base_folder.indexOf('/') != 0) base_folder = '/' + base_folder;
            }
            
            //Create the base path
            var base_path = base_folder + '/' + fileName;

            //console.log('BASE PATH', base_path);
            
            //Returns an object containing all 
            //the paths of the modules of the component.
            var paths = {

                css : 'text!' + base_path + '.css',
                html :  'text!' + base_path + '.html', 
                js : base_path + '.js',
                test : base_path + '.test'
            }

            //console.log("HELPER PATHS : ", JSON.stringify(paths));

            return paths;
        },
        
        //Generate layout paths.
        generateLayoutPaths : function(name){
            
            var base_path = 'text!layouts/' + name;

            return {

                css : base_path + '/' + name + '.css',
                html: base_path + '/' + name + '.html'
            }
        },

        generateTemplatePath : function(name) {
            
            return 'text!templates/' + name + '/' + name + '.yaml';
        },

        generateThemePath : function(name) {
            
            var fileName = name.indexOf("custom/") == 0 ?  name.substring(name.indexOf("/") + 1) :  name;
            return 'text!themes/' + name + '/' + fileName + '.css';
        },
        
        //Append css style to the page.
        applyStyle : function(css_text, doc, id){
        
            var doc = document;
            var ss1 = doc.createElement('style');
            ss1.setAttribute('type', 'text/css');
            var hh1 = doc.getElementsByTagName('head')[0];

            
            if(id) {

                ss1.setAttribute('id', id);
            }

            console.log(id, $('#'+id).length);

            if(id == 'theme-style' || id == 'layout-style' || $('#'+(id.replace(/\./g, '\\.'))).length == 0) {

                try {

                    hh1.appendChild(ss1);
                    if(ss1.styleSheet) {

                        ss1.styleSheet.cssText = css_text || "";

                    } else {

                        var tt1 = doc.createTextNode(css_text);
                        ss1.appendChild(tt1);
                    }

                } 
                catch(e) {
                
                    console.log('error on applyStyle : ' + e);
                }
            }
        },

        removeThemeStyle : function() {
        
            $("#theme-style").remove();
        },

        includeFBSDK : function() {
            
            $("body").prepend("<div id='fb-root'></div>");
            (function(d, s, id) {
                  var js, fjs = d.getElementsByTagName(s)[0];
                  if (d.getElementById(id)) return;
                  js = d.createElement(s); js.id = id;
                  js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=137047473060373";
                  fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk')); 
        },

        includeTwitterJS : function() {

           !function(d,s,id){
                var js,fjs=d.getElementsByTagName(s)[0];
                if(!d.getElementById(id)){
                    js=d.createElement(s);
                    js.id=id;
                    js.src="//platform.twitter.com/widgets.js";
                    fjs.parentNode.insertBefore(js,fjs);
                }

            }(document,"script","twitter-wjs"); 
        },

        getUrlParameter : function(query, default_value) {
            
            query = query.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
            var expr = "[\\?&]"+query+"=([^&#]*)";
            var regex = new RegExp( expr );
            var results = regex.exec( window.location.href );

            if( results !== null ) {

                return results[1];
                return decodeURIComponent(results[1].replace(/\+/g, " "));

            } else {

                return default_value;
            } 
        },

        capitalizeString : function(string) {

            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        
        prettify :  function(title) {
                
            // Clean up the title       
            var url = title
                //.toLowerCase() // change everything to lowercase
                .replace(/^\s+|\s+$/g, "") // trim leading and trailing spaces      
                .replace(/[_|\s]+/g, "-") // change all spaces and underscores to a hyphen
                .replace(/[^a-z0-9-]+/gi, "") // remove all non-alphanumeric characters except the hyphen
                .replace(/[-]+/g, "-") // replace multiple instances of the hyphen with a single instance
                .replace(/^-+|-+$/g, "") // trim leading and trailing hyphens               
                ; 
            return url;
        },
        
        compileUrl : function(url, arguments) {


        },

        parseQueryString : function(queryString) {

            var vars = queryString.split("&");
            var queryObject = {};

            for (var i = 0; i < vars.length; i++) {

                var pair = vars[i].split("=");

                if(pair[0] && pair[1]) {

                    queryObject[pair[0]] = pair[1];
                }

            }
            return queryObject;
        },
        
        /** Parses the content of GHS (Guided Help Session) article.
         * The content is usually a string like 
         * "&CB=1000000001&FI=1&PR=10004&Q1-1-1844=836&Q1-3-1854=846&Q1-3-1854=847", 
         * where CB is the case base Id, FI - filter Id (optional), PR - profile ID (optional,
         * and the rest of the string is pre-answered questions. The questions part
         * is optional as well. The answered question format is: 
         * [Q<questionType>-<questionFormat>-<questionId>=<answerValue>].
         * If a question has multiple answers, its key will be repeated with a different value like in the example
         * above for a questionId 1854.
         * 
         * After parsing this method will return an object in the format:
         *    CB: Array[1],
         *    FI : Array[1],
         *    PR : Array[1],
		 *    Q1-1-1000000844: Array[1],
		 *    Q1-3-1000000854: Array[2],
         */
        parseGHSarticleContent : function(queryString) {
        	
        	var vars = queryString.split("&");
            
        	if(console)
        		console.log("vars", vars);
            var queryObject = {};

            for (var i = 0; i < vars.length; i++) {

                var pair = vars[i].split("=");
                var key = pair[0];
                var value = pair[1];
                
                if(key && value) {
                	if(queryObject[key]) {
                    	queryObject[key].push(value);
                    }
                    else {
                    	queryObject[key] = [value];
                    }
                }
            }

            return queryObject;
        },

        stripHtmlTags : function(rawString) {

            return rawString.replace(/<(?:.|\n)*?>/gm, '');
        },

        highlightText : function(origSnippet, characterRanges) {

            if(!characterRanges.length) return origSnippet;

            var newSnippet = [];
            var currentCRIndex = 0;
            
            //Go through each character
            for(var i = 0; i < origSnippet.length; i++) {
                
                var CR = characterRanges[currentCRIndex];

                if(i == CR.firstPos) 
                    newSnippet.push('<span style="background:yellow;">');

                newSnippet.push(origSnippet.charAt(i));

                if(i == CR.lastPos - 1) {
                    
                    newSnippet.push('</span>');

                    if(characterRanges.length > currentCRIndex + 1) 
                        currentCRIndex++;
                }
            }

            //Join the list into a string.
            return newSnippet.join('');
        },
        
        /*
        * This function makes bold all occurances of boldPart in originalString.
        */
        makePartStringBold : function(originalString , boldPart)
        {
        	var replaceStringPart = '<span style="font-weight:bold;">' + boldPart + '</span>';
        	var newString = originalString.replace(boldPart , replaceStringPart);
        	return newString;
        },

        decodeHtml : function(encodedStr) {

            var decoded = $("<div/>").html(encodedStr).text();

            return decoded;
        },
        
        /**
         * Updates the content of meta description tag in the html header for a given tag name.
         * Creates a new meta tag if the tag with the given name doesn't exist.
         */
        createOrUpdateMetaTag : function(name, content) {
            
        	// if content is empty, do nothing
        	if(content) {
	            var metaTagObject = $('meta[name="' + name + '"]');
	            
	            if (metaTagObject.length === 0) {
	            	// create a new tag and append to head
	            	var metaTagStr = '<meta name="' + name + '" />';
	            	metaTagObject = $(metaTagStr).appendTo('head');
	            }
	            
	            // update the content of the tag we are working with
	            metaTagObject.attr('content', content);
        	}
        }
        
    }

    return Helpers;
});
