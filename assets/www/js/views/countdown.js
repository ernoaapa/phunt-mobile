(function() {

    var MINUTES_TIME = 5;
    var API_POST_ENDPOINT = 'http://phuntter.herokuapp.com/api/v1/chains/update';

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
                this.imageBeingSubmitted = false;
                this.previousChainHead = previousChainHead;
                this.$('.ph-button').text('Take next image');
                this.startClock();
            },
            leave: function() {
                this.stopClock();
            },
            'fastclick .ph-button': 'takePicture'
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

            if (this.imageBeingSubmitted)
                return;

            if (this.deadlineExpired)
                return this.$el.trigger('back');

            var that = this;
            var fileToUpload;
            var $button = this.$('.ph-button');

            this.stopClock();

            navigator.camera.getPicture(cameraSuccess, cameraError, {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA
            });

            function cameraSuccess(imageFileLocation) {

                that.imageBeingSubmitted = true;
                fileToUpload = imageFileLocation;

                $button.text('Uploading...');

                phunt.location.get(locationSuccess, locationError);

            }

            function cameraError() {

                that.startClock(); // This can also just mean the user just pressed the Cancel-button

            }

            function locationSuccess(position) {

                phunt.picUploader.upload(
                    fileToUpload,
                    API_POST_ENDPOINT,
                    phunt.main.getUUID(),
                    that.previousChainHead.get('chainId'),
                    position.coords.latitude,
                    position.coords.longitude,
                    uploadSuccess,
                    uploadError);

            }

            function locationError() {

                alert('Could not locate you :(((');

                that.imageBeingSubmitted = false;
                that.startClock();

            }

            function uploadSuccess(result) {

                if (result.status == "PROGRESS") {

                    $button.text('Uploading (' + Math.round(result.progress * 100 / result.total) + '%)...');

                } else if (result.status == "COMPLETE") {

                    $button.text('Done!');

                    _.delay(phunt.navigation.go, 1000, 'chains');

                }

            }

            function uploadError(error) {

                alert("Upload failed: " + error)
                that.imageBeingSubmitted = false;
                that.startClock();

            }

        }

    });

    phunt.views.register(new CountdownView());

})();