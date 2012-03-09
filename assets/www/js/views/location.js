(function() {

    var LocationView = phunt.views.base.extend({

        el: $('#ph-view-location')[0],

        viewID: 'location',

        events: {
            'fastclick': function() {
                phunt.navigation.go('chains');
            }
        }

    });

    phunt.views.register(new LocationView());

})();