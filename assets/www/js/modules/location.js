define(function() {

    "use strict";

    var USE_MOCK_LOCATION = true;
    var LOCATION_TIMEOUT = 60 * 1000;
    var _ = window._;

    var exports = {};

    function storeLastLocation(callback) {
    	return function(params) {
    		exports.lastLocation = params.coords;
    		callback(params); 
    	}
    }
    
    exports.get = function(success, error) {

//        alert('Latitude: '          + position.coords.latitude          + '\n' +
//              'Longitude: '         + position.coords.longitude         + '\n' +
//              'Altitude: '          + position.coords.altitude          + '\n' +
//              'Accuracy: '          + position.coords.accuracy          + '\n' +
//              'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
//              'Heading: '           + position.coords.heading           + '\n' +
//              'Speed: '             + position.coords.speed             + '\n' +
//              'Timestamp: '         + new Date(position.timestamp)      + '\n');

        if (!USE_MOCK_LOCATION) { // the Real Deal (tm)

            navigator.geolocation.getCurrentPosition(storeLastLocation(success), error, {
                enableHighAccuracy: true,
                timeout: LOCATION_TIMEOUT
            });

        } else {

            _.delay(storeLastLocation(success), 3000, {
                coords: {
                    latitude: '60.18067853',
                    longitude: '24.83274779',
                    altitude: '28.799999',
                    accuracy: 46
                },
                timeStamp: 0
            });

        }

    };

    return exports;
});