define(["modules/navigation", "modules/config", "modules/views", "modules/camupload"], function(navigation, config, views, camupload) {

    var MINUTES_FAST = 5,
        MINUTES_MEDIUM = 30,
        MINUTES_SLOW = 99,
        API_POST_ENDPOINT = config.api.POST_CHAINUPDATE_ENDPOINT;

    var CountdownView = views.base.extend({

        el: $('#ph-view-countdown')[0],

        viewID: 'countdown',

        events: {
            back: function() {
                if (!this.imageBeingSubmitted)
                    navigation.go('location', this.previousChainHead.url);
            },
            enter: function(event, previousChainHead) {

            	var category = previousChainHead.get('category');
            	
            	if (category === 'FAST') {
            		this.entryDeadline = this.deadline(MINUTES_FAST);
            	} else if (category === 'MEDIUM') {
            		this.entryDeadline = this.deadline(MINUTES_MEDIUM);
            	} else {
            		this.entryDeadline = this.deadline(MINUTES_SLOW);
            	}                
                
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
        
        deadline: function(minutes) {
        	return new Date(new Date().getTime() + Math.round(1000 * 60 * minutes));        	
        },        

        startClock: function() {

            var that = this;
            var $remaining = this.$('.ph-remaining').removeClass('ph-text-disabled');

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
        	this.$('.ph-remaining').addClass('ph-text-disabled');
            window.clearInterval(this.clockInterval);

        },

        takePicture: function() { 
        	var that = this;
        	
        	that.stopClock();
        	var $button = this.$('.ph-button');
            
        	camupload.takePicture({
        			chainId: that.previousChainHead.get('chainId')
        		}, 
        		{
	        		cameraSuccess: function() {
	        			that.imageBeingSubmitted = true;
	        			$button.text('Uploading...');
	        		},
	        		cameraError: function() {
	        			that.startClock();
	        		},
	        		locationError: function() {
	        			that.startClock();
	        		},
	        		uploadProgress: function(perc) {
	                    $button.text('Uploading (' + perc + '%)...');
	        		},
	        		uploadCompleting: function() {
	                    $button.text('Finishing up...');
	        		},
	        		uploadComplete: function(locationUri) {
	        		    $button.text('Done!');
	                    _.delay(navigation.go, 1500, 'location', locationUri);
	        		},
	        		uploadError: function(error) {
	        			alert("Upload failed: " + error)
	                    that.imageBeingSubmitted = false;
	                    $button.text('Try again');
	                    that.startClock()
	        		}
        		}
        	);
        	

        }

    });
    
    return CountdownView;
});