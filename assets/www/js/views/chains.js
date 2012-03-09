(function() {

    var ChainsView = phunt.views.base.extend({

        el: $('#ph-view-chains')[0],

        viewID: 'chains',

        events: {
            fastclick: function() {
                phunt.navigation.go('location');
            },
            back: function() {
                window.navigator.app.exitApp();
            }
        }

    });

    phunt.views.register(new ChainsView());

})();