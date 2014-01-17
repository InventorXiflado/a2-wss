define(['underscore', 
		'core/model'], 
		
function(_, Model) {
    
    var Search = Model.extend({
        
        /**
         * Submits a multisearch request.
         */
    	multiSearch : function(params) {
    	
        	var data = {
        		q:params.query, 
                $rangestart : params.skip,
                $rangesize : params.limit,
                federated : params.federated
            };
        
        	for (var i in params.refinementData) {
        		var attrName = i;
        		var attrValue = params.refinementData[i];
        		
        		data["__" + attrName + "__"] = attrValue.join(",");
        	}
        	
        	this.submitSearchRequest(data, params);
        },

        /** DEPRECATED! Use escalation.escalationAvoidanceSearch() instead.
         *  
         * Submits an escalation avoidance search request.
         */
        escalationAvoidanceSearch : function(params) {

        	var data = {
        		q:params.query, 
                $rangestart : params.skip,
                $rangesize : params.limit,
                topicId : params.topicId,
                subject : params.subject,
                description : params.description,
                restriction : "suggestedarticles"
            };
        
        	this.submitSearchRequest(data, params);
        },
        
        /** 
         * Submits an ajax request to the "search" WS API.
         */
        submitSearchRequest : function(requestData, params) {
        	
        	return this.makeRequest({

                method:'GET',
                context: this,
                url: this.getProperty('baseUrl') + '/ss/search',
                success_codes : [200, 204],
                error_codes : [400, 412, 404],
                type : 'json',
                data : requestData,

                success : function(data){
        			// store the search string in data object to pass back to search results page
        			data.query = params.query;
        			//Pass the results back.
                    params.success.call(params.context, data);
                },

                error : function() {
                    params.error && params.error.call(params.context);
                }
            });
        },

        getSuggestionText : function(params) {

            return this.makeRequest({

                method : 'GET',
                url : this.getProperty('baseUrl') + '/ss/search/autocomplete',
                data : {

                    q:params.query, 
                    expanded:true, 
                    maxCount:params.limit || 5
                },
                context : this,
                type : 'json', 
                success : function(data) {
                    
                    var _suggestions = [];
                    var limit = params.limit || 5;
                    
                    _.each(data.suggestion, function(suggestion, i) {
                        
                        if(i >= limit)
                            return false;

                        _suggestions.push({

                            entity_id : suggestion.entityId,
                            text : suggestion.suggestion,
                            type : suggestion.suggestionType.toLowerCase()
                        });
                    });

                    params.success.call(params.context, _suggestions);
                },

                error : function() {
                    
                    params.error.call(params.context);
                }
            });
        },
        
        /**
         * Submits a WS request to log an external search result viewing event.
         * The data returned contains a redirect url (not currently used).
         */
        getWebItemUrl : function(params) {
        	
        	return this.makeRequest({

                method:'GET',
                context: this,
                url: this.getProperty('baseUrl') + '/general/url',
                success_codes : [200, 204],
                error_codes : [400, 404],
                type : 'json',
                data : params.data
            });
        }
        
    });
    
    return Search;
});
