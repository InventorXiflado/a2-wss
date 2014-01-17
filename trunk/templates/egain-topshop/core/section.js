define(['underscore',
        'backbone',
        'core/helpers'],

function(_,
         Backbone,
         helpers) {

    var Section = Backbone.View.extend({

        initialize : function() {

            //Get the current section name
            this.name = $(this.el).attr('section');
            this.page = this.options.page;

            this.manifest = this.options.manifest;

            //Stores the reference to all components.
            this._components = [];

            //Initialize the component count.
            this._loadedComponentCount = 0;

            //Add a 'section' class to each section element.
            $(this.el).addClass('section');

            //Start applying the styles.
            this._applySectionStyles();

            //Start inserting the components.
            this._loadComponents();
        },

        _applySectionStyles : function() {

            for(var selector in this.manifest.styles) {

                if(selector === '__root__') {

                    this.$el.css(this.manifest.styles[selector]);

                } else {

                    this.$el.find(selector).css(this.manifest.styles[selector]);
                }
            }
        },

        _loadComponents : function() {

            if(this.manifest.components) {

                for(var i = 0; i < this.manifest.components.length; i++) {

                    var componentManifest = this.manifest.components[i];

                    if(!componentManifest) {

                        continue;
                    }

                    //console.log("MANIFEST COMP", JSON.stringify(componentManifest));

                    this._loadComponent(componentManifest, i);
                }

            } else {

                this.isReady = true;
                //Just directly trigger ready if the section doesn't have
                //any section to load.
                this.trigger('ready');
            }

            //Upon creating all the components placeholder, append
            //a clearing div when the section is declared floatable
            //to make sure it looks good on IE when the section
            //includes floating components.

            //if(this.isFloatable())
            //TODO: only do this when the section is declared floatable.
            this.$el.append('<div class="selfservice-clear"></div>');
        },

        /* This will be called when a cached copy of a section is used. */
        useCachedCopy: function() {
            var c = this._components;
            for (var i=0; i< c.length; i++) {
                // Call components function if defined by the component for any special handling, else call delegateEvents to reattach events defined in the component.
                c[i].useCachedCopy ? c[i].useCachedCopy() : c[i].delegateEvents();
            }
        },
        /**

            Loads the component.

        **/
        _loadComponent : function(componentManifest, index) {
            var componentId = componentManifest.id;

            //Check if the component with that id is cached.
            if(app.cache.isComponentCached(componentId)) {

                var component = app.cache.getCachedComponent(componentId);

                //If manifest says the component should be hidden,
                //then hide it.
                if(componentManifest.hidden) {

                    component.$el.hide();
                }

                this.$el.append(component.$el);
                if (component.useCachedCopy) {
                    component.useCachedCopy()
                }
                else {
                    component.delegateEvents();
                }

                this._incrementLoadedComponentCount();

            } else {

                //Create the component wrapper.
                var el = $('<div class="component"/>')[0];

                //Append the component wrapper to the section while
                //we're waiting for the actual component content
                //to load.
                this.$el.append(el);

                //Ask the page to create the component for us while passing
                //the wrapper element.
                this.page.createComponent(componentManifest, el, function(component) {

                    //Save the reference to the components
                    this._components[index] = component;

                    //Cache the component if the manifest tells it's cacheable
                    //TODO : I think the page object should be the one that
                    //does the caching. Gary
                    if(componentManifest.cacheable) {

                        app.cache.cacheComponent(componentId, component);
                    }

                    //Increment the componentLoadedCount after the component is
                    //ready
                    //
                    if(component.isReady) {

                        this._incrementLoadedComponentCount();

                    } else {

                        component.bind('ready', this._incrementLoadedComponentCount,
                                    this);
                    }

                    //If manifest says the component should be hidden,
                    //then hide it.
                    if(componentManifest.hidden) {

                        component.hide();
                    }

                }, this);
            }
        },

        onComponentReady : function() {

            this._incrementLoadedComponentCount();
        },

        _incrementLoadedComponentCount : function() {

            //Increment component count.
            this._loadedComponentCount++;

            //If we have all the component ready, then trigger the ready event on this component.
            if(this._loadedComponentCount == this.manifest.components.length) {

                this.isReady = true;

                //Pass itself to the trigger event.
                this.trigger('ready', this);
            }
        },

        /**

            Insert component at certain index.

        **/
        insertComponent : function(component, index) {

            var $components = $(this.el).find('.component'),
                len = $components.length;

            //If it's index is 0, then just simply prepend.
            if(index == 0) {

                $(this.el).prepend(component.el);

            } else if(len < index) {

                //If its siblings with lesser index don't come yet,
                //then just append it.
                $(this.el).append(component.el);

            } else {

                $components.eq(index-1).after(component.el);
            }
        },

        getComponents : function() {

            return this._components;
        },

        getComponent : function(name) {

            return this._components[name];
        },

        //Get the ID of the section.
        getId : function() {

            if(this.options.manifest)
                return this.options.manifest.id;
        }
    });

    return Section;
});
