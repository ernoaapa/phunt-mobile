(function() {

    var Location = Backbone.Model.extend({

        // TODO

    });

    var LocationView = phunt.views.base.extend({

        el: $('#ph-view-location')[0],

        viewID: 'location',

        events: {
            back: function() {
                phunt.navigation.go('chains');
            },
            enter: function(event, extraParameters) {
                var location = new Location();
                location.url = extraParameters.get('url');
                this.bindWithLocation(location);
            },
            leave: function() {
                this.unbindWithLocation();
            },
            'fastclick .ph-foundItButton': 'verifyLocation'
        },

        initialize: function() {

            _.bindAll(this, 'render');

        },

        bindWithLocation: function(location) {

            this.model = location;
            this.model.on('change', this.render);

            this.model.fetch();

        },

        unbindWithLocation: function() {

            this.model.off();
            this.model = undefined;

        },

        render: function() {

            this.$('.ph-image').css({
                'background-image': 'url("' + this.model.get('pictureUrl') + '")'
            });

            this.$('.ph-foundItButton').text('Found it!');

            var $comments = this.$('.ph-comments ul');

            $comments.html('');

            _.each(this.model.get('comments'), function(comment) {
                var $li = $('<li><div class="ph-message"></div><div class="ph-user"></div></li>');
                $li.find('.ph-message').text(comment.message);
                $li.find('.ph-user').text(comment.user.name);
                $comments.append($li);
            });

        },

        verifyLocation: function() {

            var that = this;

//            navigator.camera.getPicture(success, error, {
//                destinationType: Camera.DestinationType.FILE_URI,
//                sourceType: Camera.PictureSourceType.CAMERA
//            });
//
//            function success(location) {
//
//                alert('Camera success! location = ' + location);
//
//                that.$('.ph-image').css({
//                    'background-image': 'url("' + location + '")'
//                });
//
//            }
//
//            function error() {
//
//                alert('Camera gave an error!');
//
//            }

            if (this.waitingForLocation)
                return;

            this.$('.ph-foundItButton').text('Locating...');
            this.waitingForLocation = true;

            if (true) { // the Real Deal (tm)

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

            function success(position) {

                alert('Latitude: '          + position.coords.latitude          + '\n' +
                      'Longitude: '         + position.coords.longitude         + '\n' +
                      'Altitude: '          + position.coords.altitude          + '\n' +
                      'Accuracy: '          + position.coords.accuracy          + '\n' +
                      'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
                      'Heading: '           + position.coords.heading           + '\n' +
                      'Speed: '             + position.coords.speed             + '\n' +
                      'Timestamp: '         + new Date(position.timestamp)      + '\n');

                that.$('.ph-foundItButton').text('Correct!');

            }

            function error(error) {

                console.log('Geolocation error, code ' + error.code + ': ' + error.message);
                alert('Could not locate you; ' + error.message);

                that.waitingForLocation = false;
                that.$('.ph-foundItButton').text('Try again!');

            }

        }

    });

    phunt.views.register(new LocationView());

})();