from flask import Flask, render_template, session, jsonify, request
from app import app 
from app.models import *
from ghost import Ghost 
from app.config import *

import datetime

ghost = Ghost()


@app.route('/')
def index():
	return render_template('index.html', weatherApiKey=weatherApiKey, googleApiKey=googleApiKey, googleClientId=googleClientId)

@app.route('/csstest')
def csstest():
	return render_template('csstest.html')

@app.route('/gapi&q=<query>')
def gapi(query):
	# Creates headless browser
	# Opens the web page
	ghost.open('https://www.google.ch/webhp?hl=de#safe=off&hl=en-CH&q=' + query)
	ghost.wait_for_page_loaded()
	# Gets desired element
	ghost.sleep(1)
	el = ghost.main_frame.findAllElements(".kp-blk")
	txt = ""
	if not (el.count()>0):
		# If no elements are found, search for another possible element
		el = ghost.main_frame.findFirstElement(".ct-cs")
		txt = el.toOuterXml()
		if (txt == ""):
			ghost.wait_for_page_loaded()
			el = ghost.main_frame.findFirstElement(".obcontainer")
			ghost.sleep(1)
			txt = el.toOuterXml()
	else:
		# Opens 'show more infos' buttons if available
		# ghost.sleep is needed to give it time to open the button
		ghost.evaluate("""if(document.getElementsByClassName('exp-txt _ubf vk_arc')[0]){document.getElementsByClassName('exp-txt _ubf vk_arc')[0].click();}
			if(document.getElementsByClassName('exp-txt _qxg vk_arc')[0]){document.getElementsByClassName('exp-txt _qxg vk_arc')[0].click();}""")
		ghost.sleep(1)
		# If the elements were found, add all to our text 
		for i in range(0, el.count()):
			txt += el.at(i).toOuterXml()
	# Refer to google
	txt = txt.replace('src="//', 'src="https://')
	txt = txt.replace('src="/', 'src="https://google.com/')
	txt = txt.replace('href="/search', 'href="https://google.com/search')
	txt = txt.replace('<select', '<select class="form-control" disabled')
	txt = txt.replace('<input', '<input class="form-control" disabled')
	txt = txt.replace('<button', '<button class="btn btn-primary" disabled')
	txt = txt.replace('rows="', 'rows="0.')
	return render_template('api.html', apicode=unicode(txt), query=query)

@app.route('/logkey', methods=['POST'])
def logkey():
	key = request.form["key"]
	name = request.form["name"]
	email = request.form["email"]
	weather = request.form["weather"]
	profile = request.form["profile"]
	posts = request.form["posts"]
	calendar = request.form["calendar"]
	calendarCount = request.form["calendarCount"]
	# Get key and user from our database
	check = Key.query.filter_by(keycode=key).first()
	user = User.query.filter_by(email=email).first()
	# Set results as python variables
	if(weather == "true"):
		weather = True
	elif(weather == "false"):
		weather = False
	if(profile == "true"):
		profile = True
	elif(profile == "false"):
		profile = False
	if(posts == "true"):
		posts = True
	elif(posts == "false"):
		posts = False
	if(calendar == "true"):
		calendar = True
	elif(calendar == "false"):
		calendar = False
	calendarCount = int(calendarCount)
	# Declare a new user
	newuser = User(name, email, weather, profile, posts, calendar, calendarCount)
	if (user is None):
		# If the user is nonexistent in our databse, add him
		db.session.add(newuser)
		db.session.commit()
	else:
		# Check if any changes were made to our user and update them
		if (user.email != email):
			user.email = email
			db.session.commit()
		if (user.username != name):
			user.username = name
			db.session.commit()
		if (user.showWeather != weather):
			user.showWeather = weather
			db.session.commit()
		if (user.showProfile != profile):
			user.showProfile = profile
			db.session.commit()
		if (user.showPosts != posts):
			user.showPosts = posts
			db.session.commit()
		if (user.showCalendar != calendar):
			user.showCalendar = calendar
			db.session.commit()
		if (user.calendarCount != calendarCount):
			user.calendarCount = calendarCount
			db.session.commit()
	if (check is None):
		# If the key is nonexistent in our database, add it
		keycode = Key(key, email)
		db.session.add(keycode)
		db.session.commit()
		return '<body style="background-color:#2c3e50;"><span style="color:#2ecc71;font-size:40px;text-transform: uppercase;font-family: Sans-serif;">Success!</span></body>'
	else:
		return '<body style="background-color:#2c3e50;"><span style="color:#e74c3c;font-size:30px;text-transform: uppercase;font-family: Sans-serif;">Key already in use!</span></body>'


@app.route('/getkey&key=<key>')
def getkey(key):
	# Get the desired key
	keycode = Key.query.filter_by(keycode=key).first()
	if (keycode is None):
		# If there is no key, return false
		return "false"
	else:
		# Get the user associated with the key
		user = User.query.filter_by(email=keycode.email).first()
		if (keycode.expiration < datetime.datetime.now()):
			# If the key is already expired, delete it from the database and return false
			Key.query.filter_by(keycode=key).delete()
			db.session.commit()
			return "false"
		elif (user is None):
			# If there is no such user as registered by the key, return false
			return "false"
		else:
			# If everything succedes return a json object with the following variables and set the session
			session['key'] = key;
			session['username'] = user.username;
			session['email'] = user.email;
			session['weather'] = user.showWeather;
			session['profile'] = user.showProfile;
			session['posts'] = user.showPosts;
			session['calendar'] = user.showCalendar;
			session['calendarCount'] = user.calendarCount;
			return jsonify(key=key, username=user.username, email=user.email, weather=user.showWeather, profile=user.showProfile, posts=user.showPosts, calendar=user.showCalendar, calendarCount=user.calendarCount)

@app.route('/dropsession')
def dropsession():
	# Drop the session
	session.clear()
	return "Dropped"

app.secret_key = secretkey