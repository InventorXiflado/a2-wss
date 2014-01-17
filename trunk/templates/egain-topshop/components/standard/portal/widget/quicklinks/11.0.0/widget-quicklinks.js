//Quicklinks Widget
//-----------------
define(['core/component'], function(BaseComponent){

    var WidgetQuicklinksComponent = BaseComponent.extend({

        name : "widget-quicklinks",

        events : {

            'click a[data-link-type="bookmarks"]' : 'onBookmarksLinkClick'
        },
        prepare : function() {

            this.generalModel = this.getModel('general');


            this.generalModel.getUsefulItemFolders({

                success : this._onItemFoldersArrive,
                error : this.declareError,
                context : this
            });

        },

        _onItemFoldersArrive : function(data) {

            var rawLinks = this.getProperty('links') || [];
            // check if Guided Help is enabled
            var isEnabledGuidedHelp = this.app.getPortalSetting("enableGuidedHelp");
            // check if "Make a Suggestion" link is enabled
            var isEnabledMakesSuggestion = this.app.getPortalSetting("enableMakeASuggestionOption");

            var links = [];

            //Add the favorites page
            links.push({
                "text" : this.app.language.compileString("MY_BOOKMARKS"),
                "url" :  this.app.getPageUrl(this.getProperty("bookmarksPage") || "favorites"),
                "link_type" : "bookmarks"
            });

            if(isEnabledGuidedHelp) {

                links.push({
                    "text" : this.app.language.compileString("GUIDED_HELP"),
					"url" : this.app.getPageUrl(this.getProperty("guidedHelpPage") || "casebases")
                });
            }
            /*
            if (isEnabledMakesSuggestion) {
            	links.push({
                    "text" : this.app.language.compileString("MAKE_SUGGEST"),
					"url" : this.app.getPageUrl(this.getProperty("suggestionsPage") || "suggestions")
                });
            }
*/
            _.each(rawLinks, function(rawLink) {

            	links.push({
	            	'text' : rawLink.text,
	            	//turn the page name into the url
	                'url' : this.app.getPageUrl(rawLink.page)
	            });
            }, this);

            //Go through the UsefulItems folder.
            _.each(data.folder, function(folder) {

                links.push({
                    'text' : folder.name,
                    'url' : this.app.getPageUrl(this.getProperty("usefulItemsPage") || "list", folder.id)

                });
            }, this);

            this.render({links:links});
        },

        onBookmarksLinkClick : function(e) {

            e.preventDefault();

            var _this = this;
            var favoriteModelId = 2; // hard-coded value for backward compatibility
            try {
            	favoriteModelId = this.getModel('favorite').id;
            }
            catch(e) {
                // Do nothing, we are already using default value of 2
            }

            var component = this.app.page.createComponent({

                name : 'standard.portal.list.favorites',
                models : {"favorite": {id : favoriteModelId}}

            }, function(component) {

                //Tell the current page to show modal containing 'list.favorites' component that we just created.
                _this.app.page.showModal({

                    component : component
                });
            });
        }
    });

    return WidgetQuicklinksComponent;
});
