phunt = window.phunt || {};

(function(exports) {

    "use strict";

    var currentView;

    document.addEventListener('deviceready', function() {
        document.addEventListener('backbutton', exports.back, false);
    }, false);

    exports.back = function() {

        if (currentView)
            currentView.$el.trigger('back');

    };

    exports.go = function(viewID) {

        if (currentView)
            currentView.$el.removeClass('ph-current');

        currentView = phunt.views.get(viewID);

        if (!currentView.hasBeenPrepared) {

            currentView.hasBeenPrepared = true;
            currentView.addFastButtons();

        }

        currentView.$el.addClass('ph-current');

    };

})(phunt.navigation = {});