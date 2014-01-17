define(['core/model'], function(Model){

    var General = Model.extend({

        getUsefulItemFolders : function(params) {
            
            this.makeRequest({

                method : 'GET',
                url : this.getProperty('baseUrl') + '/ss/usefulitems/folder',
                type : 'json',

                success : function(data) {
       
                    params.success.call(params.context, data);
                },

                error : function() {
                
                    params.error.call(params.context);
                }
            });
        },

        getUsefulFolderItems : function(params) {
            
            this.makeRequest({

                method : 'GET',
                url : this.getProperty('baseUrl') + '/ss/usefulitems/folder/' + params.folderId,
                type : 'json',

                success : function(data) {
       
                    params.success.call(params.context, data.folder[0]);
                },

                error : function() {
                
                    params.error.call(params.context);
                }
            });
        }
    });

    return General;
});
