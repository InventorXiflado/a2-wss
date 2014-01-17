 define(['core/component', 'core/models/article'], 
 
 function(CoreComponent, Article){

    var ListAnnouncementsComponent = CoreComponent.extend({

        name : 'list-announcements',

        prepare : function() {
            
            this.limit = this.getProperty('limit', 4);

            //this.render({announcements:[]});

            (new Article()).getAnnouncements({

                success : this._onAnnouncementsArrive,
                limit : this.limit,
                context : this
            });
        },

        _onAnnouncementsArrive : function(announcements) {
             
            var html = this.compileTemplate('main', {
                
                announcements:announcements    
            });

            //this.render({announcements:announcements});
            this.$el.html(html);

            var imgs = [

                './selfservice/themes/unitel/images/widget-custom_box-img-coverage.jpg',
                './selfservice/themes/unitel/images/widget-custom_box-img-acessories.jpg',
                './selfservice/themes/unitel/images/widget-custom_box-img-unitel.jpg',
                './selfservice/themes/unitel/images/widget-custom_box-img-chips.jpg',
            ];
        
            //HACK
            var $imgs = this.$el.find('.selfservice-box-wrap img');

            $imgs.each(function(i) {
                
                $(this).attr('src', imgs[i]);
            });
        },

        buildUrl : function(topic) {

            return this.app.getPageUrl('topic', topic.id, this.slugify(topic.name));
        }
    });

    return ListAnnouncementsComponent; 
});
    
    
