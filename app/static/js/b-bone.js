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

var Profile = Backbone.Model.extend({
	url: "https://www.googleapis.com/plus/v1/people/me?access_token=" + accessToken,
	fetch: function(options){
		this.url = "https://www.googleapis.com/plus/v1/people/me?access_token=" + accessToken;
		return Backbone.Model.prototype.fetch.call(this, options);
	},
	parse: function(response){
		return response;
	}
});

var Post = Backbone.Model.extend({
});


var Calendar = Backbone.Model.extend({
});

var CalendarList = Backbone.Model.extend({
});

// Collections

var PostCollection = Backbone.Collection.extend({
	model: Post,
	url: "https://www.googleapis.com/plus/v1/people/me?access_token=" + accessToken + "/activities/public?pageToken=" + page_token + "&maxResults=2&key=" + apiKey,
	fetch: function(options){
		this.url = "https://www.googleapis.com/plus/v1/people/me/activities/public?pageToken=" + page_token + "&maxResults=2&access_token=" + accessToken;
		return Backbone.Collection.prototype.fetch.call(this, options);
	},
	parse: function(response){
		var post_collection = [];
		page_token = response.nextPageToken;
		this.url = "https://www.googleapis.com/plus/v1/people/me/activities/public?pageToken=" + page_token + "&maxResults=6&key=" + apiKey;
		_.each(response.items, function(element){
			var temp = new Post(element);
			post_collection.push(temp);
		});
		console.log(post_collection);
		return post_collection;
	}
});

var CalendarID;
var CalendarListCollection = Backbone.Collection.extend({
	model: CalendarList,
	url: "https://www.googleapis.com/calendar/v3/users/me/calendarList?fields=items&access_token=" + accessToken,
	fetch: function(options){
		this.url = "https://www.googleapis.com/calendar/v3/users/me/calendarList?fields=items&access_token=" + accessToken;
		return Backbone.Collection.prototype.fetch.call(this, options);
	},
	parse: function(response){
		_.each(response.items, function(element){
			var temp = new CalendarList(element);
			if(temp.get("primary")){
				CalendarID = temp.get("id");
			}
		});
	}
});

var CalendarCollection = Backbone.Collection.extend({
	model: Calendar,
	// TODO: ADD variable maxResults
	// TODO: Android-App preferences => Calendar settings
	// TODO: Get individual Calendar
	url: " https://www.googleapis.com/calendar/v3/calendars/" + CalendarID + "/events?singleEvents=true&orderBy=startTime&timeMin=" + moment().toISOString() + "&timeMin=" + moment().add(7, 'days').toISOString() + "&maxResults=" + CalendarCount + "&access_token=" + accessToken,
	fetch: function(options){
		this.url = "https://www.googleapis.com/calendar/v3/calendars/" + CalendarID + "/events?singleEvents=true&orderBy=startTime&timeMin=" + moment().toISOString() + "&timeMin=" + moment().add(7, 'days').toISOString() + "&maxResults=" + CalendarCount + "&access_token=" + accessToken;
		return Backbone.Collection.prototype.fetch.call(this, options);
	},
	parse: function(response){
		var cal_collection = [];
		_.each(response.items, function(element){
			var temp = new Calendar(element);
			cal_collection.push(temp);
		});
		console.log(cal_collection);
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

var ProfileView = Backbone.View.extend({
	model: Profile,
	el: ("#profile-container"),
	tagName: 'div',
	initialize: function(){
		_.bindAll(this, 'render');
		this.template = _.template($("#profile_template").html());
		this.render();
	},
	render: function(){
		this.$el.html(this.template(this.model.toJSON()));
	}
});

var PostView = Backbone.View.extend({
	model: Post,
	initialize: function(){
		this.template = _.template($("#google_post_template").html());
	},
	render: function(){
		this.$el = this.template(this.model);
		return this;
	}
});

var PostsView = Backbone.View.extend({
	model: PostCollection,
	el: ("#post-container"),
	initialize: function(){
		this.render();
	},
	render: function(){
		var that = this;
		that.$el.html("");
		if(this.model.length > 0){
			_.each(this.model.toJSON(), function(post){
				that.$el.append(((new PostView({model: post})).render().$el));
			});
		}else{
			this.template = _.template($("#no_posts_template").html());
			that.$el.append(this.template());
		}
		return this;
	}
});

var CalendarView = Backbone.View.extend({
	model: Calendar,
	initialize: function(){
		this.template = _.template($("#google_calendar_template").html());
	},
	render: function(){
		this.$el = this.template(this.model);
		return this;
	}
});

var CalendarsView = Backbone.View.extend({
	model: CalendarCollection,
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

var profile = new Profile();
var weather = new Weather();

var posts = new PostCollection();
var calendars = new CalendarCollection();
var calendarList= new CalendarListCollection();

var weatherView;
var profileView;
var googlePostsView;




// Functions

var getWeather = function(){
	weather.fetch({
		success: function(){
			weatherView = new WeatherView({model: weather});
		}
	});
}

var getProfile = function(){
	profile.fetch({
		success: function(){
			console.log(profile);
			profileView = new ProfileView({model: profile});
		}
	});
}

var getPosts = function(){
	// 107045876535773972576
	posts.fetch({
		success: function(){
			$("#google-posts-container").html("");
			console.log("posts");
			console.log(posts);
			googlePostsView = new PostsView({model: posts});
		}
	});
}

var getCalendarEvents = function(){
	calendarList.fetch({
		success: function(){
			calendars.fetch({
				success: function(){
					$("#google-calendar-container").html("");
					console.log("calendars");
					console.log(calendars);
					googleCalendarsView = new CalendarsView({model: calendars});
				}
			});
		}
	});
}

// Executions

getWeather();
// profile is fetched in index.html -> handleAuthResult()
// posts are fetched in index.html -> handleAuthResult()

// Update Weather every 5 minutes
var weatherInterval = setInterval(function(){getWeather();}, 300000);