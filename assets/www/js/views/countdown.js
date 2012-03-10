(function() {

    var MINUTES_TIME = 0.25;

    var Location = Backbone.Model.extend({

        // TODO

    });

    var CountdownView = phunt.views.base.extend({

        el: $('#ph-view-countdown')[0],

        viewID: 'countdown',

        events: {
            back: function() {
                phunt.navigation.go('location', this.previousChainHead.url);
            },
            enter: function(event, previousChainHead) {
                this.entryDeadline = new Date(new Date().getTime() + Math.round(1000 * 60 * MINUTES_TIME));
                this.deadlineExpired = false;
                this.previousChainHead = previousChainHead;
                this.$('.ph-button').text('Take next image');
                this.startClock();
            },
            leave: function() {
                this.stopClock();
            },
            'fastclick .ph-button': 'takePicture'
        },

        initialize: function() {

            _.bindAll(this, 'render');

        },

        startClock: function() {

            var that = this;
            var $remaining = this.$('.ph-remaining');

            update();

            this.clockInterval = window.setInterval(update, 1000);

            function update() {

                var secs = Math.round((that.entryDeadline.getTime() - new Date().getTime()) / 1000);
                var mins = Math.floor(secs / 60);
                var dispSecs = secs - mins * 60;

                $remaining.text(mins + ':' + (dispSecs > 9 ? dispSecs : '0' + dispSecs));

                if (secs <= 0) {

                    that.stopClock();
                    $remaining.text('0:00');
                    that.deadlineExpired = true;
                    that.$('.ph-button').text('Go back');

                }

            }

        },

        stopClock: function() {

            window.clearInterval(this.clockInterval);

        },

        takePicture: function() {

            if (this.deadlineExpired)
                return this.$el.trigger('back');

            var that = this;

            navigator.camera.getPicture(success, error, {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA
            });

            function success(location) {

                if (that.deadlineExpired)
                    return alert('Sorry, the deadline expired while you were pointing and shooting!');

                alert('Camera success! location = ' + location);
                
                var uploadSuccess = function(result) {
                	if (status.result == plugins.picUploader.PROGRESS) {
                		console.log("Some progress: " + result.progress);
                		return;
                	}
                	
                	alert("Upload succeeded");
                }
                
                var uploadFail = function(e) {
                	alert("Upload failed: "+e)
                }
                
               // phunt.picUploader.upload(location, 'http://86.50.128.250:9001/api/v1/chains/update', "oogabooga", "1", "65.232", "23.232", uploadSuccess, uploadFail);
                phunt.picUploader.upload(location, 'http://phuntter.herokuapp.com/api/v1/chains/update', "oogabooga", "1", "65.232", "23.232", uploadSuccess, uploadFail);
                
                that.$('.ph-image').css({
                    'background-image': 'url("' + location + '")'
                });

            }

            function error() {

                alert('Camera gave an error!');

            }

        },

        render: function() {

            // TODO

        }

    });

    phunt.views.register(new CountdownView());

})();