 define(['core/component'], function(CoreComponent) {

    var WidgetCommunityComponent = CoreComponent.extend({

        name : 'widget-community',

        prepare : function() {
            
            // if community is not enabled in this portal configuration, hide this component
            var isEnableCommunity = this.app.getPortalSetting("enableCommunitySection");
        	if (!isEnableCommunity) {
        		this.trigger("ready");
        		this.hide();
        		return;
        	}
            
            this.community = this.getModel('community');//new Community();

            this.community.getForums({

                success : this._onForumsArrive,
                error : this._onForumsError,
                context : this
            });
        },

        _onForumsArrive : function(forums) {
            
            this.community.getForumInfo({
                
                forumName : forums[0].name,
                success : this._onForumInfoArrive,
                error : this.hide,
                context : this
            });
        },

        _onForumInfoArrive : function(info) {
            
            console.log("FORUM INFO", info);

            this.render({info:info}); 
        },

        _onForumsError : function() {

            this.hide();
        }
    });

    return WidgetCommunityComponent; 
});
