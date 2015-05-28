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
	parse: function(response){
		return response;
	}
});

var Post = Backbone.Model.extend({
});

// Collections

var PostCollection = Backbone.Collection.extend({
	model: Post,
	url: "https://www.googleapis.com/plus/v1/people/me?access_token=" + accessToken + "/activities/public?pageToken=" + page_token + "&maxResults=2&key=" + apiKey,
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

// Instances

var post = new Post();
var profile = new Profile();
var weather = new Weather();

var posts = new PostCollection();

var weatherView;
var profileView;
var googlePostsView;


// Executions

weather.fetch({
	success: function(){
		weatherView = new WeatherView({model: weather});
	}
});

// profile is fetched in index.html -> handleAuthResult()
// posts are fetched in index.html -> handleAuthResult()


// Update Weather every 5 minutes
var weatherInterval = setInterval(function(){weather.fetch();}, 300000);
