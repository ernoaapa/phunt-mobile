(function() {

    var ChainsView = phunt.views.base.extend({

        el: $('#ph-view-chains')[0],

        viewID: 'chains',

        events: {
            'fastclick': function() {
                phunt.navigation.go('location');
            }
        }

    });

    phunt.views.register(new ChainsView());

})();