(function() {

    var API_POST_ENDPOINT = 'http://phuntter.herokuapp.com/api/v1/chains/create';

    var CreateView = phunt.views.base.extend({

        el: $('#ph-view-create')[0],

        viewID: 'create',

        events: {
            back: function() {
                phunt.navigation.go('chains');
            },
            'fastclick .ph-button:nth-child(2)': function(event) {
                this.takePicture('FAST', $(event.target));
            },
            'fastclick .ph-button:nth-child(3)': function() {
                this.takePicture('MEDIUM', $(event.target));
            },
            'fastclick .ph-button:nth-child(4)': function() {
                this.takePicture('SLOW', $(event.target));
            }
        },

        takePicture: function(categoryName, $button) { // TODO: Shared functionality with countdown.js

            if (this.imageBeingSubmitted)
                return;

            var that = this;
            var fileToUpload;
            var alreadyCompleting;
            var buttonOrigText = $button.text();

            navigator.camera.getPicture(cameraSuccess, cameraError, {
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.CAMERA
            });

            function cameraSuccess(imageFileLocation) {

                that.$('.ph-button').addClass('ph-working');

                $button.removeClass('ph-working');

                that.imageBeingSubmitted = true;
                fileToUpload = imageFileLocation;

                $button.text('Uploading...');

                phunt.location.get(locationSuccess, locationError);

            }

            function cameraError() {

                // This can also just mean the user just pressed the Cancel-button

            }

            function locationSuccess(position) {

                var options = {
                    fileUri: fileToUpload,
                    uploadUrl: API_POST_ENDPOINT,
                    uuid: phunt.main.getUUID(),
                    category: categoryName,
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };

                phunt.picUploader.upload(options, uploadSuccess, uploadError);

            }

            function locationError() {

                alert('Could not locate you :(((');

                that.imageBeingSubmitted = false;

            }

            function uploadSuccess(result) {

                if (!alreadyCompleting && result.status == "PROGRESS") {

                    $button.text('Uploading (' + Math.round(result.progress * 100 / result.total) + '%)...');

                } else if (result.status == "COMPLETING") {

                    alreadyCompleting = true;

                    $button.text('Finishing up...');

                } else if (result.status == "COMPLETE") {

                    $button.text('Done!');

                    _.delay(function() {
                        phunt.navigation.go('location', result.result);
                        $button.text(buttonOrigText);
                        that.$('.ph-button').removeClass('ph-working');
                        that.imageBeingSubmitted = false;
                    }, 1500);

                }

            }

            function uploadError(error) {

                alert("Upload failed: " + error)
                that.imageBeingSubmitted = false;
                $button.text('Try again');

            }

        }

    });

    phunt.views.register(new CreateView());

})();