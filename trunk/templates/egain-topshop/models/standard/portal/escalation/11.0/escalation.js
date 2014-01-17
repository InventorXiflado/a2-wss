define(['core/model'], function(Model) {

    var Escalation = Model.extend({

        /**
         * Submits a 'commence escalation' request to the server.
         */
    	startEscalation : function(params) {

            return this.makeRequest({

                method : 'GET',
                url : this.getProperty('baseUrl') + '/ss/escalate/start',
                type : 'json',
                context : this,
                success_codes : [200, 201],
                error_codes : [400, 403, 412, 500]
            });
        },

    	/**
         * Submits an escalation request to the server.
         */
    	submitEscalation : function(params) {

			if(params.data.attachment && params.data.attachment.length > 0){
				params.success.call(params.context);
			}else{
					return this.makeRequest({

						method : 'POST',
						url : this.getProperty('baseUrl') + '/ss/escalate',
						type : 'json',
						data : params.data,
						context : this,
						success_codes : [200, 201],
						error_codes : [400, 403, 500],

						success : function() {
							params.success.call(params.context);
						},

						error : function() {
							params.error.call(params.context);
						}
					});
			}
        },

        /**
         * Submits an escalation avoidance search request.
         */
        escalationAvoidanceSearch : function(params) {

        	var data = {
        		q:params.query,
                $rangestart : params.skip,
                $rangesize : params.limit,
                topicId : params.topicId,
                subject : params.subject,
                description : params.description
            };

        	return this.makeRequest({

                method:'GET',
                context: this,
                url: this.getProperty('baseUrl') + '/ss/escalate/search',
                success_codes : [200, 204],
                error_codes : [400, 412, 404],
                type : 'json',
                data : data,

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

        /**
         * Submits an 'avert escalation' request to the server.
         */
    	avertEscalation : function(params) {

            return this.makeRequest({

                method : 'GET',
                url : this.getProperty('baseUrl') + '/ss/escalate/avert',
                type : 'json',
                context : this,
                success_codes : [200, 201],
                error_codes : [400, 403, 412, 500]
            });
        }

    });

    return Escalation;
});