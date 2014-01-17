 define(['underscore',
     'core/component',
     'core/helpers'],

 function(_,
        CoreComponent,
        helpers){
    
    var ListFavoritesComponent = CoreComponent.extend({

        name : 'list-favorites',

        events : {
            
            'click li i.remove' : 'removeFavorite',
            'click a.close-favorites' : 'close'
        },

        prepare : function() {

            this.favoriteModel = this.getModel('favorite'); 

            var favorites = this.favoriteModel.getFavorites() || [];
            //Strip out the html tags.
            favorites = _.map(favorites, function(favorite, index) {

                if(favorite['name'])  {

                    var fN = helpers.stripHtmlTags(favorite['name']);
                    favorite['name'] = fN.length>50 ? fN.substring(0, 50) + '...' : fN;
                }

                return favorite;
            });

            this.render({favorites:favorites});
        },

        removeFavorite : function(e) {

            //Get the favorite id.
            var fav_id = $(e.target).attr('data-favorite-id');

            this.favoriteModel.removeFavorite(fav_id);
            
            //Run the whole prepare all over again.
            this.prepare();
        },
        
        /** 
         * Closes the modal window when a user clicks on an article link.
         */
        close : function() {
        	
        	var currentModal = this.app.page['_currentModal'];
        	currentModal.close();
        },

        buildUrl : function(article) {

            return this.app.getPageUrl('article', article.id, this.slugify(article.name));
        }
    });

    return ListFavoritesComponent; 
});
