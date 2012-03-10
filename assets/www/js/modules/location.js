phunt = window.phunt || {};

(function(exports) {

    "use strict";

    var USE_MOCK_LOCATION = true;
    var _ = window._;

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

            navigator.geolocation.getCurrentPosition(success, error, {
                enableHighAccuracy: true,
                timeout: 30000
            });

        } else {

            _.delay(success, 3000, {
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

})(phunt.location = {});