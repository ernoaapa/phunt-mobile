phunt = window.phunt || {};

(function(exports) {

    "use strict";

    var currentView;

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