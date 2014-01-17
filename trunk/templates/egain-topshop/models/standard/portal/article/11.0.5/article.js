define(['underscore', 'core/model'], function(_, Model) {
    
    var Article = Model.extend({
        
        retrieve : function (params) {

            var data = {};

            if(params.articleViewContext) {
            	data['context'] = params.articleViewContext; 
            }

            if(params.highlightingQuery) {

                data['q'] = params.highlightingQuery;
            }
            
            return this.makeRequest({

                method : 'GET',
                context: this,
                url : this.getProperty('baseUrl') + '/ss/article/' +
                      params.articleId,
                type : 'json',

                data : data,
                success : function(data){
                    
                    params.success.call(params.context, data.article[0]);
                },

                error : function(){

                    if(!params.error)
                        return;

                    params.error.call(params.context);
                }
            });
        },
        
        getRelatedCases: function(params){

            return this.makeRequest({

                method:'GET',
                url : this.getProperty('baseUrl') + '/ss/solution/cases/' + params.articleId || this.get('id'),
                type : 'json',

                data : {

                    '$attribute' : 'name',
                    'usertype' : 3
                },

                success : function(data) {

                    console.log("RELATED CASES", data.cases);

                    params.success.call(params.context, data.cases);
                },

                error : function() {
                    if(!params.error)
                        return;
                    params.error.call(params.context);
                }
            });
        },

        getRelatedArticles : function(params){
            
            return this.makeRequest({
                
                method:'GET',
                url : this.getProperty('baseUrl') + '/ss/article/related/' + params.articleId || this.get('id'),
                type : 'json',

                data : {

                    '$attribute' : 'name'
                },

                success : function(data) {
                    
                    params.success.call(params.context, data);
                },

                error : function() {

                    params.error.call(params.context);
                }
            });
        },
        
        getRatings : function(params){
            
            return this.makeRequest({

                method : 'GET',
                url : this.getProperty('baseUrl') + '/ss/article/rating/' + this.get('id'),

                success : function() {

                    params.success.call(params.context);
                },

                error : function() {

                    params.error.call(params.context);
                }
            });
        },

        assignRating : function(params) {

            return this.makeRequest({
                
                method:'PUT',
                url : this.getProperty('baseUrl') + '/ss/article/rating/' + params.articleId || this.get('id'),
                type : 'json',
                data : {

                    score : params.score
                },

                success_codes : [201],

                success : function() {
                    
                    params.success.call(params.context); 
                },

                error : function() {

                    params.error.call(params.context);
                }
            });
        },

        getAttachment : function(params){

            return this.makeRequest({

                method:'GET',
                url: this.getProperty('baseUrl') + '/ss/article/attachment/' + params.attachmentId,
                type : 'json',
                
                success : function(data){
                    params.success.call(params.context, data);
                },

                error : function(){
                    params.error.call(params.context);
                }
            });
        },

        getTopicArticles : function(params) {

            return this.makeRequest({

                method : 'GET',
                url : this.getProperty('baseUrl') + '/ss/article',
                type : 'json',
                data : {

                    topicId : params.topicId,
                    '$rangestart' : params.skip,
                    '$rangesize' : params.limit,
                    '$attribute' : (params.attributes || []).join(','),
                    'context' : params.viewContext
                },

                success : function(data) {

                    params.success.call(params.context, {

                        articles : data.article,
                        article_actual_count : data.pagingInfo.maxRange 
                    });
                },

                error : function(){

                    params.error.call(params.context);
                },

                context : this
            });
        },

        getAnnouncements : function(params) {

            return this.makeRequest({

                method : 'GET',
                type : 'json',
                url : this.getProperty('baseUrl') + '/ss/article/announcement',
                context : this,
                
                success : function(data) {
                
                    var skip = params.skip || 0;
                    
                    var announcementsActualCount = data.pagingInfo.maxRange;

                    params.success.call(params.context, {
                    	'announcements' : data.article.slice(skip, skip + params.limit),
                    	'announcementsActualCount' : announcementsActualCount
                    });
                },

                error : function(){

                    params.error.call(params.context);
                }
            });
        },

        sendFeedback : function(params) {

            return this.makeRequest({

                method : 'POST',
                type : 'json',
                url : this.getProperty('baseUrl') + '/gh/feedback',

                data : {
                    
                    articleId : params.articleId,
                    feedback : params.feedback
                },

                success : function() {

                    params.success.call(params.context);
                },

                error : function() {

                    params.error.call(params.context);
                },

                context : this
            });
        },

		addToCRMCase : function(params) {

			return this.makeRequest({

				method:'PUT',
				url : this.getProperty('baseUrl') + '/ss/solution/article/' + params.articleId || this.get('id'),
				type : 'json',
				data : {

					articleId : params.articleId,
					subject : params.subject,
					crmCaseId : params.crmCaseId
				},

				success_codes : [201],

				success : function() {

					params.success.call(params.context);
				},

				error : function() {

					params.error.call(params.context);
        }
            });
		},
		
		/*
		* Submits a WS call to log an event for external related article being viewed.
		*/
		logExternalUrlEvent : function(params) {
			    return this.makeRequest({

                method:'GET',
                context: this,
                url: this.getProperty('baseUrl') + '/general/url',
				
                type : 'json',
                data : params.data
            });
        }
    });

    return Article;
});
