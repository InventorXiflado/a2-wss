define(['core/model'], function(Model) {
    
    var Community = Model.extend({

        getForums : function(params) {
            
            return this.makeRequest({

                url : this.getProperty('baseUrl') + '/community/forum',
                type : 'json',

                error_codes : [412],

                success : function(data) {
                    
                    params.success && params.success.call(params.context,
                                                          data.forum);
                },

                error : function() {

                    params.error.call(params.context);
                },

                context : this
            });
        },

        getForumInfo : function(params) {

            return this.makeRequest({
                
                url : this.getProperty('baseUrl') + '/community/forum/info/' + params.forumName,
                type : 'json',

                success : function(data) {

                    params.success && params.success.call(params.context, 
                                                          data.forumInfo);
                },

	        error : function() {

		        params.error.call(params.context);
		    },

                context : this
            });
        }
    });

    return Community;
});
