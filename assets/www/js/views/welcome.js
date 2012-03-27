define(["modules/views", "modules/location", "modules/navigation"], function(views, location, navigation) {

    var navigator = window.navigator;

    var WelcomeView = views.base.extend({

        el: $('#ph-view-welcome')[0],

        viewID: 'welcome',

        events: {
            back: function() {
                navigator.app.exitApp();
            },
            enter: function() {
                location.get(function(location) {
                    navigation.go('chains', location);
                }, function() {
                    alert("Couldn't locate you! Try again later, please.");
                    navigator.app.exitApp();
                });
            }
        }

    });

    return WelcomeView;
});

