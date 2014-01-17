define(['core/model'], function(Model){

    var Suggestion = Model.extend({
        
        submitSuggestion : function(params){

            return this.makeRequest({

                method : 'POST',
                url : this.getProperty('baseUrl') + '/ss/suggestion',
                type : 'json',
                data : params.data,
                context : this,
                success_codes : [200, 201],
                error_codes : [400, 404, 500],
                success : function() {

                    params.success.call(params.context);
                },

                error : function() {
                    
                    params.error.call(params.context);
                }
            });
        },

        getSuggestion: function (params) {

            return this.makeRequest({

                method: 'GET',

                url: this.getProperty('baseUrl') + '/ss/suggestion/' + params.suggestionId,

                success_codes: [200, 201],
                error_codes: [400, 404, 405, 500],
                type: 'json',
                success: function (data) {

                    params.success.call(params.context, data);
                },

                error: function (data) {
                    
                    params.error.call(params.context, data);
                }
            });
        },

        deleteSuggestion: function (params) {

            return this.makeRequest({

                method: 'DELETE',
                url: this.getProperty('baseUrl') + '/ss/suggestion/' + params.suggestionId,

                success_codes: [200, 201],
                error_codes: [400, 404, 405, 500],
                type: 'json',

                success: function (data) {

                    data.deletedSuggestionId = params.suggestionId;
                    params.success.call(params.context, data);
                },

                error: function (data) {
                    
                    data.suggestionId = params.suggestionId;
                    params.error.call(params.context, data);
                }
            });
        },
        modifySuggestion: function (params) {

            return this.makeRequest({

                method: 'PUT',
                url: this.getProperty('baseUrl') + '/ss/suggestion/' + params.suggestionId,
                data: params.data,

                success_codes: [200, 201],
                error_codes: [400, 404, 405, 500],
                type: 'json',

                success: function (data) {

                    params.success.call(params.context, data);
                },

                error: function (data) {
                    
                    data.suggestionId = params.suggestionId;
                    params.error.call(params.context, data);
                }
            });
        },
        
        getSuggestions: function (params) {
	
	    var data = {};
	
	    return this.makeRequest({
	
	 	method: 'GET',	
	        url: this.getProperty('baseUrl') + '/ss/suggestion/' + params.target,
	
	        success_codes: [200, 201],
	        error_codes: [400, 404, 405, 500],
	        type: 'json',
		data : {

                    '$rangestart' : params.skip,
                    '$rangesize' : params.limit
                },	        
	
	        success: function (data) {
	
	        	data.target = params.target;
	        	params.success.call(params.context, data);
	        },
	
	        error: function (data) {
	        	
	        	params.error.call(params.context, data);
	        }
	
	    });
        }
    });
    
    return Suggestion;
});