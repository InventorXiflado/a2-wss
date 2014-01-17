define(['core/model', 'amplify'], function(Model, amplify) {
    
    var Favorite = Model.extend({
        
        /** Defines the key for storing current portal's bookmarks in the browser */
    	initialize : function() {
    		this.storeKey = 'bookmarks';
        },

        /** Adds a bookmark (article) to the storage. */
        addFavorite : function(article) {
        	
            // if this article has already been bookmarked, do nothing
        	if(this.isFavorite(article.id))
            	return;
        	
        	var favorites = this.getFavorites() || [];
        	// we only need articleId and name to store in a bookmark
        	var favorite = { 
        		id : article.id,
        		name : article.name
        	};
        	
        	favorites.push(favorite);
        	window.app.saveInBrowser(this.storeKey, favorites, false, this.modelPath);
        },

        /** Returns all bookmarks for the current portal. */
        getFavorites : function() {

        	this.modelPath = this.getModelPath();
        	return window.app.getSavedValue(this.storeKey, null, false, this.modelPath);
        },

        /** Removes the bookmark (article) with the given Id from the storage. */
        removeFavorite : function(id) {

            var favorites = this.getFavorites();

            favorites = _.filter(favorites, function(favorite) {
                return favorite.id != id;
            });

            window.app.saveInBrowser(this.storeKey, favorites, false, this.modelPath);
        },

        /** Checks if the article with the given Id has already been bookmarked. */
        isFavorite : function(id) {

        	// if there are no favorites yet, return false
        	if(!this.getFavorites())
        		return false;
        	
        	return _.find(this.getFavorites(), function(fav) {
        		return fav.id == id;
            });
        }
    });

    return Favorite;
});
