
define(function() {
    "use strict";

    var device = window.device ? window.device : { uuid: 'dummy-uuid' };

    return {
        getUUID: function() {
            return device.uuid;
        }
    };
});