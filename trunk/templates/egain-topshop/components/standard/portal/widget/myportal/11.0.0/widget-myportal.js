 define(['core/component'], function(CoreComponent){

    var WidgetMyportalComponent = CoreComponent.extend({

         name: 'widget-myportal',

         prepare: function () {

             this.generalModel = this.getModel('general');

             var rawLinks = this.getProperty('links') || [];
             var isEnabledMyCases = this.app.getPortalSetting("enableMyCasesOption");
             var isEnabledMyProfile = this.app.getPortalSetting("enableMyProfileOption");
             var isEnabledMySuggestions = this.app.getPortalSetting("enableMySuggestionsOption");

             var links = [];
             var isShowMyPortal = true;
             var anySettingEnabled = false;

             if (!window.app.isAgentPortal() && !window.app.getPortalSetting('isAuthenticated')) 
             {
             	isShowMyPortal = false;
             }

             /*if (isEnabledMyCases) {

                 links.push({
                     "text": this.app.language.compileString("MY_CASES"),
                     "url": this.app.getPageUrl("casebases")
    		 });
                 anySettingEnabled = true;
             }*/

             if (isEnabledMyProfile && !window.app.isAgentPortal()) {
                 links.push({
                     "text": this.app.language.compileString("MY_PROFILE"),
                     "url": this.app.getPageUrl("myprofile")
                 });
                 anySettingEnabled = true;
             }

             if (isEnabledMySuggestions) {
                 links.push({
                     "text": this.app.language.compileString("MY_SUGGEST"),
                     "url": this.app.getPageUrl("mysuggestions")
                 });
                 anySettingEnabled = true;
             }

             if (!anySettingEnabled) 
             	 isShowMyPortal = false;

             if (!isShowMyPortal) {
                 this.trigger("ready");
                 this.hide();
                 return;
             }

             _.each(rawLinks, function (rawLink) {

                 links.push({
                     'text': rawLink.text,
                     //turn the page name into the url
                     'url': this.app.getPageUrl(rawLink.page)
                 });
             }, this);

             this.render({
                 links: links
             });
         }
});
    
     return WidgetMyportalComponent;
 });