"use strict";

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

var CalendarEvent = Backbone.Model.extend({
});

// Collections
var CalendarEventCollection = Backbone.Collection.extend({
	model: CalendarEvent,
	url: "/getCalendar",
	fetch: function(options){
		this.url = "/getCalendar";
		return Backbone.Collection.prototype.fetch.call(this, options);
	},
	parse: function(response){
		var cal_collection = [];
		_.each(response, function(element){
			var temp = new CalendarEvent(element);
			cal_collection.push(temp);
		});
		return cal_collection;
	}
});

// Views

var WeatherView = Backbone.View.extend({
	model: Weather,
	el: ("#weather-container"),
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

var CalendarView = Backbone.View.extend({
	model: CalendarEvent,
	initialize: function(){
		this.template = _.template($("#google_calendar_template").html());
	},
	render: function(){
		this.$el = this.template(this.model);
		return this;
	}
});

var CalendarsView = Backbone.View.extend({
	model: CalendarEventCollection,
	el: ("#calendar-container"),
	initialize: function(){
		this.model.on('change', this.render);
		this.render();
	},
	render: function(){
		var that = this;
		that.$el.html("");
		if(this.model.length > 0){
			_.each(this.model.toJSON(), function(calendar){
				that.$el.append(((new CalendarView({model: calendar})).render().$el));
			});
		}
		return this;
	}
});

// Instances


var weather = new Weather();
var calendarEvents = new CalendarEventCollection();

var weatherView;
var googleCalendarsView;

// Functions

var getWeather = function(){
	weather.fetch({
		success: function(){
			weatherView = new WeatherView({model: weather});
		}
	});
}

getCalendarEvents = function(){
	calendarEvents.fetch({
		success: function(){
			$("#google-calendar-container").html("");
			googleCalendarsView = new CalendarsView({model: calendarEvents});
		}
	});
}

// Executions

getWeather();
getCalendarEvents();

// Update Weather every 5 minutes
var weatherInterval = setInterval(function(){getWeather();}, 300000);