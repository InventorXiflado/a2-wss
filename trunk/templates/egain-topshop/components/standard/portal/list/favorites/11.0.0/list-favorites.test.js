 define(['components/list/favorites/list-favorites'], function(ListFavoritesComponent){

    return function ListFavoritesTestSuite() {
        
        beforeEach(function(){

            this.component = new ListFavoritesComponent();
            this.component.load()
        });

        afterEach(function(){

            this.component.remove();
        });

        /** Start creating your test cases from here **/

    }
    
});

    