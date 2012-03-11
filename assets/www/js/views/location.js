(function() {

    var API_VERIFY_ENDPOINT = 'http://phuntter.herokuapp.com/api/v1/locations/verify';
    var API_COMMENT_ENDPOINT = 'http://phuntter.herokuapp.com/api/v1/comments/create';

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
            'fastclick .ph-foundItButton': 'verifyLocation',
            'fastclick .ph-postCommentButton': 'postComment'
        },

        initialize: function() {

            _.bindAll(this, 'render');

        },

        bindWithLocation: function(location) {
        	
        	this.$el.append('<div class="ph-loading">Loading...</div>');
        	this.$el.children().not('.ph-loading').hide();

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

            this.$('.ph-foundItButton').text('I Know Where');

            var that = this;
            var $comments = this.$('.ph-comments ul');

            $comments.html('');

            _.each(this.model.get('comments'), function(comment) {
                that.addCommentToList(comment.message, comment.user.name);
            });
            
            this.$el.find('.ph-loading').hide();
            this.$el.children().not('.ph-loading').show();            
        },

        addCommentToList: function(message, userName) {

            var $li = $('<li><div class="ph-message"></div><div class="ph-user"></div></li>');

            $li.find('.ph-message').text(message);
            $li.find('.ph-user').text(userName);

            this.$('.ph-comments ul').append($li);

        },

        verifyLocation: function() {

            var that = this;

            if (this.waitingForLocation)
                return;

            this.waitingForLocation = true;

            var $button = this.$('.ph-foundItButton');

            $button.text('Locating...');
            $button.addClass('ph-working');

            phunt.location.get(locationSuccess, locationError);

            function locationSuccess(position) {

                $button.text('Verifying...');

                $.ajax({
                    url: API_VERIFY_ENDPOINT,
                    type: 'GET',
                    dataType: 'text',
                    data: {
                        uuid: phunt.main.getUUID(),
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                        locationId: that.model.id
                    },
                    success: verifySuccess,
                    error: verifyError
                });

            }

            function locationError(error) {

                console.log('Geolocation error, code ' + error.code + ': ' + error.message);
                alert('Could not locate you; ' + error.message);

                that.waitingForLocation = false;
                $button.text('Try again!');
                $button.removeClass('ph-working');

            }

            function verifySuccess() {

                $button.text('Correct!');
                $button.removeClass('ph-working');

                _.delay(phunt.navigation.go, 1000, 'countdown', that.model);

            }

            function verifyError() {

                $button.text("You're NOT there!");
                $button.removeClass('ph-working');
                $button.addClass('ph-negative');

            	_.delay(function() {
                    $button.removeClass('ph-negative');
                    that.waitingForLocation = false;
                    $button.text('Try again!');
            	}, 2000);
            }

        },

        postComment: function() {

            if (this.commentBeingSubmitted)
                return;

            var that = this;
            var $textarea = this.$('textarea');
            var $button = this.$('.ph-postCommentButton');

            this.commentButtonOriginal = $button.text();
            this.commentBeingSubmitted = true;

            $button.text('Posting...');
            $button.addClass('ph-working');
            $textarea.attr('disabled', true);

            $.ajax({
                type: 'POST',
                url: API_COMMENT_ENDPOINT,
                data: {
                    uuid: phunt.main.getUUID(),
                    locationId: that.model.id,
                    comment: $textarea.val()
                },
                success: function() {
                    that.addCommentToList($textarea.val(), 'You');
                    $textarea.val('');
                    done();
                },
                error: function() {
                    $button.text('Unable to post :(');
                    $button.addClass('ph-negative');
                    _.delay(done, 2000);
                }
            });

            function done() {

                $textarea.attr('disabled', false);
                that.commentBeingSubmitted = false;
                $button.removeClass('ph-working');
                $button.removeClass('ph-negative');
                $button.text(that.commentButtonOriginal);

            }

        }

    });

    phunt.views.register(new LocationView());

})();