define(['underscore', 'core/model'], function(_, Model){

    var Casebase = Model.extend({
        
        /**
         * Gets all casebases available for this portal.
         */
        getAllCasebases : function(params) {

            return this.makeRequest({
                
                method : 'GET',
                type : 'json',
                url : this.getProperty('baseUrl') + '/gh/casebase',
                
                success : function(data) {
                    params.success.call(params.context, data.casebase);
                },

				error : function() {
				    params.error.call(params.context);
				}
            });
        },

        /**
         * Starts a Guided Help session. 
         */
        start : function(params) {
            
            return this.makeRequest({

                method : 'POST',
                url : this.getProperty('baseUrl') + '/gh/search/start',
                type : 'json',
                data : params.data,
                context : this,
                success_codes : [201],
                success : function(data) {
                    params.success.call(params.context, data);
                },
                
                error : function() {
		    		params.error.call(params.context);
                }
            });
        },
        
        /**
         * Submit Guided Help answers.
         * The params.data object should be in the following form:
         * {
         *   Q1-1-1844 : 836,
         *   Q1-3-1854=846,
         *   Q1-3-1854=847  }
         * The answered question format is: 
         * [Q<questionType>-<questionFormat>-<questionId>=<answerValue>].
         * The same question key can be repeated in case of multiple answers.
         */
        submitAnswers : function(params) {
        	
        	return this.makeRequest({
                
                method : 'POST',
                type : 'json',
                url : this.getProperty('baseUrl') + '/gh/search/',
                data : params.data,
                success_codes : [201],
                context : this,
                success : function(data) {
                    params.success.call(params.context, data);
                },

				error : function() {
				    params.error.call(params.context);
				}
            });
        },

        getQuickpicks : function() {

            return this.makeRequest({

                method : 'GET',
                url : this.getProperty('baseUrl') + '/gh/quickpick',
                data : {

                    casebaseId : this.get('id')
                }
            });
        }
    });

    return Casebase;
});
