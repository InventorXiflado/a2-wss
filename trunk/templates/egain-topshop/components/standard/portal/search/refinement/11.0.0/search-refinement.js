define(['underscore', 'core/component'], function(_, CoreComponent){

    var SearchRefinementComponent = CoreComponent.extend({

        name : 'search-refinement',
        
        events : {
            
            "submit form" : "onFormSubmit",
            'click .filter-button' : 'onFormSubmit'
        },

        prepare : function() {
        
        	var isEnableSearchResultFiltering = this.app.getPortalSetting("enableSearchResultFiltering"); 	
        	var filterAttributes = this.app.getPortalSetting("searchFilterAttribute");
        	
        	if (!isEnableSearchResultFiltering || !filterAttributes || filterAttributes.length == 0) {
        		this.trigger("ready");
        		this.hide();
        		return;
        	}
        	
        	var priorSelection = this.getState('refinement-options');
        	
        	for (var i in filterAttributes) {
        		
        		var internalName = filterAttributes[i].internalName;
        		var priorValues = [];
        		
        		if (!$.isEmptyObject(priorSelection)) {
	        		for (var j in priorSelection) {
	        			if (internalName == j) {
	        				priorValues = priorSelection[j];
	        			}
	        		}
        		}
        		
        		// this is a 'list' attribute
        		if (filterAttributes[i].isEnumerated) {
        			var values = filterAttributes[i].value;
        			
        			for (var j in values) {
        				values[j].attrInternalName = internalName;
        				
        				for (var k in priorValues) {
        					if (values[j].internalValue == priorValues[k]) {
        						values[j].isChecked = "checked";
        					}
        				}
        			}
        		}
        		// it's a text-box
        		else if (priorValues) {        			
        			filterAttributes[i].priorText = priorValues[0];
        		}
        	}
        	
        	this.render({
        		filterAttributes : filterAttributes
        			
        	});
		},
		
		onFormSubmit : function(e) {
                
            e.preventDefault();
            
            // clear the previously saved refinement options
            this.saveState('refinement-options', {});
            
            var $inputs = $('#refinement-form :input');
			
			var values = {};
    		$inputs.each(function() {
    			
    			var attrName = this.name;
    			var optionValue = $(this).val();
    			
    			if ((this.type == "radio" || this.type == "checkbox") && $(this).is(':checked')) {
    				if (!values[attrName]) {
		    			values[attrName] = [];
		    		}
    				values[attrName].push(optionValue);
    			}
    			
    			if (this.type == "text" && optionValue) {
    				if (!values[attrName]) {
	    				values[attrName] = [];
	    			}
    				values[attrName].push(optionValue);
    			}
    		});
            
            if ($.isEmptyObject(values)) {
            	alert("Please choose an option for search refinement");
            	return;
            }
                        
            this.saveState('refinement-options', values);
            
            this.send('egain11.product.search.refine', values);
        }
	});

    return SearchRefinementComponent; 
});