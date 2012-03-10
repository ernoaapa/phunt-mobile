(function() {

    var API_ENDPOINT = 'http://phuntter.herokuapp.com/api/v1/locations/verify';

    var Location = Backbone.Model.extend({

        // TODO

    });

    var LocationView = phunt.views.base.extend({

        el: $('#ph-view-location')[0],

        viewID: 'location',

        events: {
            back: function() {
                if (!this.waitingForLocation)
                    phunt.navigation.go('chains');
            },
            enter: function(event, locationURL) {
                var location = new Location();
                location.url = locationURL + '?uuid=' + phunt.main.getUUID();
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

            this.waitingForLocation = false;

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

            if (this.waitingForLocation)
                return;

            this.waitingForLocation = true;
            this.$('.ph-foundItButton').text('Locating...');

            phunt.location.get(locationSuccess, locationError);

            function locationSuccess(position) {

                that.$('.ph-foundItButton').text('Verifying...');

//                _.delay(verifySuccess, 1000); return;

                $.ajax({
                    url: API_ENDPOINT,
                    type: 'GET',
                    data: {
                        uuid: phunt.main.getUUID(),
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    },
                    success: verifySuccess,
                    error: verifyError
                });

            }

            function locationError(error) {

                console.log('Geolocation error, code ' + error.code + ': ' + error.message);
                alert('Could not locate you; ' + error.message);

                that.waitingForLocation = false;
                that.$('.ph-foundItButton').text('Try again!');

            }

            function verifySuccess() {

                that.$('.ph-foundItButton').text('Correct!');

                _.delay(phunt.navigation.go, 1000, 'countdown', that.model);

            }

            function verifyError() {

                alert("Sorry, you're NOT at the right place!");

                that.waitingForLocation = false;
                that.$('.ph-foundItButton').text('Try again!');

            }

        }

    });

    phunt.views.register(new LocationView());

})();