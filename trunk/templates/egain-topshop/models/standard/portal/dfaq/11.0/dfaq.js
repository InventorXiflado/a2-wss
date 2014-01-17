define(['core/model'], function(Model){

    var DFAQ = Model.extend({

        retrieve : function(params) {
            
            this.makeRequest({

                method : 'GET',
                url : this.getProperty('baseUrl') + '/ss/dfaq',
                type : 'json',

                data : {
                    
                    'topicId':params.topicId,
                    '$rangestart':params.skip,
                    '$rangesize':params.limit
                },

                success : function(data) {
       
                    var article_actual_count = data.pagingInfo.maxRange;
                    
                    params.success.call(params.context, {

                       'articles' : data.article,
                       'article_actual_count' : article_actual_count
                    });
                },

                error : function() {
                
                    params.error.call(params.context);
                }
            });
        }
    });

    return DFAQ;
});
