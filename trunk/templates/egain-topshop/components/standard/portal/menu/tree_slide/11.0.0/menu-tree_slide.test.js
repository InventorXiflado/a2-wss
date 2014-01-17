 define(['components/menu/tree_slide/menu-tree_slide'], function(MenuTree_slideComponent){

    return function MenuTree_slideTestSuite() {
        
        beforeEach(function(){

            this.component = new MenuTree_slideComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    