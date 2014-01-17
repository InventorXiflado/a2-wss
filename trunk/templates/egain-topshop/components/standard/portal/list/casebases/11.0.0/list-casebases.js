 define(['core/component'], function(CoreComponent){

    var ListCasebasesComponent = CoreComponent.extend({

        name : 'list-casebases',

        prepare : function() {
        	
        	var isEnabledGuidedHelp = this.app.getPortalSetting("enableGuidedHelp");
            if(isEnabledGuidedHelp)
        	{
        	    this.caseBaseModel = this.getModel('casebase');
            
        	    this.caseBaseModel.getAllCasebases({

                    success : this._onCasebasesArrive,
                    context : this
                });
        	}
        	else
        	{
        	   this._hideLoadingImage();
        	   this.declareError(this.ERROR_CODES.CONFIG_ERROR, 'ERROR_GUIDED_HELP_NOT_ENABLED');
        	}
        },

        _onCasebasesArrive : function(casebases) {

            this.render({casebases:casebases});
        },

        buildUrl : function(casebase) {

            return this.app.getPageUrl('casebase', casebase.id, this.slugify(casebase.title));
        }
    });

    return ListCasebasesComponent; 
});
    
    
