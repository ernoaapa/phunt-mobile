phunt = window.phunt || {};

(function(exports) {

    "use strict";

    exports.start = function() {

        phunt.navigation.go('welcome');

    };

    exports.getUUID = function() {

        return window.device && window.device.uuid ? window.device.uuid : 'dummy-uuid';

    };

})(phunt.main = {});