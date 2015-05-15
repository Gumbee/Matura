// Models

var Weather = Backbone.Model.extend({
	url: "https://api.wunderground.com/api/" + weatherApiKey + "/conditions/astronomy/q/autoip.json",
	parse: function(response){
		return response;
	},
	defaults: {
		'style': 'png'
	}
});


// Views

var WeatherView = Backbone.View.extend({
	model: Weather,
	el: ("#weather-box"),
	tagName: 'div',
	initialize: function(){
		_.bindAll(this, 'render');
		// Rerender View when any attribute of our model changes
		this.model.on('change', this.render);
		// Set Template
		this.template = _.template($("#weather_template").html());
		this.render();
	},
	render: function(){
		var mdl = this.model.toJSON();
		var sunrise = moment({h: mdl.sun_phase.sunrise.hour, m: mdl.sun_phase.sunrise.minute});
		var sunset = moment({h: mdl.sun_phase.sunset.hour, m: mdl.sun_phase.sunset.minute});
		var icon = this.model.get('current_observation').icon;
		var stateurl;
		// Show day/night Icons according to time
		if(moment().isBefore(sunset) && moment().isAfter(sunrise)){
			this.model.get('current_observation').state = 'day';
			stateurl = 'day/';
		}else{
			this.model.get('current_observation').state = 'night';
			stateurl = 'night/';
		}
		if(this.model.toJSON().style == "gif"){
			// Change to gif Icons
			icon = icon.concat('.gif?v=10');
			this.model.get('current_observation').iconurl = icon;
		}else{
			// Change to png Icons
			icon = icon.concat('.png?v=10');
			icon = stateurl.concat(icon);
			this.model.get('current_observation').iconurl = icon;
		} 
		// Render Template
		this.$el.html(this.template(this.model.toJSON()));
	}
});


// Instances

var weather = new Weather();
var weatherView;

// Executions

weather.fetch({
	success: function(){
		weatherView = new WeatherView({model: weather});
	}
});
// Update Weather every 5 minutes
var weatherInterval = setInterval(function(){weather.fetch();}, 300000);
