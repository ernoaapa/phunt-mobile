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
            'fastclick .ph-foundItButton': 'takePicture'
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

            var $comments = this.$('.ph-comments ul');

            $comments.html('');

            _.each(this.model.get('comments'), function(comment) {
                var $li = $('<li><div class="ph-message"></div><div class="ph-user"></div></li>');
                $li.find('.ph-message').text(comment.message);
                $li.find('.ph-user').text(comment.user.name);
                $comments.append($li);
            });

        },

        takePicture: function() {

            var that = this;

            navigator.camera.getPicture(success, error, {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA
            });

            function success(location) {

                alert('Camera success! location = ' + location);

                that.$('.ph-image').css({
                    'background-image': 'url("' + location + '")'
                });

            }

            function error() {

                alert('Camera gave an error!');

            }

        }

    });

    phunt.views.register(new LocationView());

})();