 define(['core/component'], function(CoreComponent){

    var WidgetLogoutComponent = CoreComponent.extend({

        name : 'widget-logout',

        events : {
            'click .logout-button' : 'onLogoutClick'
        },

        /**
         * Initializes the component and renders a proper template based on the user authentication state.
         */
        prepare : function() {
        	
        	// get authentication state (it's only saved for customer portal)
        	var isAuthenticated = this.getState('isAuthCustomer', null, true);
        	
        	// for an agent portal or an authenticated customer portal, render the main template
        	// (with user greeting and logout buttom)
        	if (this.app.isAgentPortal() || isAuthenticated) {
	        	
	        	this.sessionModel = this.getModel('session');
	        	
	        	// pull the user name from the browser storage
	        	var userName = this.getState('userName', null, true);
	        	
	        	if (userName) {
		        	// truncate the user name if it's too long and add a tooltip
		        	if(userName.length > 15) {
		        		var userNameTooltip = userName;
		        		userName = userName.substring(0, 14) + "...";
		        	}
	        	}
	        	else { // hide the user greeting if the user name is unavailable
	        		var hideGreeting = "hide-greeting";
	        	}
	        	
	        	// render the main template
	        	this.render({ 
	        		'username' : userName,
	        		'userNameTooltip' : userNameTooltip,
	        		'hide-greeting' : hideGreeting
	        	});
        	}
        	// for anonymous customer, render 'anonymous' template
        	else {
        		this.render(this.getTemplate('anonymous'));
        	}
        },
        
        /** Submits logout ajax request. */
        onLogoutClick : function() {
        	
        	this.sessionModel.logout({
                
                success : this._onLogoutSuccess,
                error : this._onLogoutError,
                context : this
            });
        },
        
        /** Clears authentication state and navigates to login page. */
        _onLogoutSuccess : function() {
        	
        	// clear this user's userName and authentication state from the browser storage
        	this.saveState('userName', null, true);
        	this.saveState('isAuthCustomer', null, true);
        	
        	// remove session ID
        	this.sessionModel._removeSessionId();
        	
        	// navigate to the login page
        	var loginPage = this.app.manifest.getProjectVar('loginPage') || 'login';
        	this.navigateToPage(loginPage);
        },
        
        /** 
         * Not much  we can do in case of an error (which is most likely due to session expiration).
         * So send user to the login page and clear authentication state (same as success).
         */
        _onLogoutError : function() {
        	this._onLogoutSuccess();
        }
        
    });

    return WidgetLogoutComponent; 
});
    
    
