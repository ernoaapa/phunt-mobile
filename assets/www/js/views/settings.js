define(["modules/config", "modules/views", "modules/util", "modules/navigation"], function(config, views, util, navigation) {

    var API_ENDPOINT = config.api.SETTINGS_ENDPOINT;

    var SettingsView = views.base.extend({

        el: $('#ph-view-settings')[0],

        viewID: 'settings',

        events: {
        	'fastclick #ph-save-settings': 'save',
        	back: function() {
        		if (!this.settingsBeingSaved)
        			navigation.go('chains');
            },
            
            enter: function() {
            	this.fetchName();
            }
        },

        initialize: function() {
        },
        
        fetchName: function() {
        	var that = this;
        	$.ajax({
                url: API_ENDPOINT + "?uuid=" + util.getUUID(),
                type: 'GET',
                success: function(data) {
                	that.$('#ph-name-input').val(data.name);
                }
            });
        },
        
        save: function() {

            var that = this;

            if (this.settingsBeingSaved)
                return;

            this.settingsBeingSaved = true;

            this.$('#ph-save-settings').addClass('ph-working').text('Saving...');

            $.ajax({
                url: API_ENDPOINT,
                type: 'POST',
                dataType: 'text',
                data: {
                    uuid: util.getUUID(),
                    username: that.$('#ph-name-input').val()
                },
                success: saveSuccess,
                error: saveError
            });
            
            function saveSuccess()  {
                that.$('#ph-save-settings').text('Success!');
                _.delay(function() {
                    that.$('#ph-save-settings').removeClass('ph-working').text('Save');
                    that.settingsBeingSaved = false;
                }, 1500);
            }
            
            function saveError() {
                that.$('#ph-save-settings').removeClass('ph-working');
            }
        }
    });


    return SettingsView;
});
