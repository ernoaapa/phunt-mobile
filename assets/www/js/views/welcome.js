(function() {

    var WelcomeView = phunt.views.base.extend({

        el: $('#ph-view-welcome')[0],

        viewID: 'welcome',

        events: {
            back: function() {
                window.navigator.app.exitApp();
            },
            enter: function() {
                phunt.location.get(function(location) {
                    phunt.navigation.go('chains', location);
                }, function() {
                    alert("Couldn't locate you!  Try again later, plz.");
                    window.navigator.app.exitApp();
                });
            }
        }

    });

    phunt.views.register(new WelcomeView());

})();