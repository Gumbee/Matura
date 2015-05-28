from flask import Flask, render_template, session, jsonify
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
		txt = el.toOuterXml();
	else:
		# If the elements were found, add all to our text 
		for i in range(0, el.count()):
			txt += el.at(i).toOuterXml()
		# Opens 'show more infos' buttons if available
		# ghost.sleep is needed to give it time to open the button
		ghost.evaluate("""if(document.getElementsByClassName('exp-txt _ubf vk_arc')[0]){document.getElementsByClassName('exp-txt _ubf vk_arc')[0].click();}
			if(document.getElementsByClassName('exp-txt _qxg vk_arc')[0]){document.getElementsByClassName('exp-txt _qxg vk_arc')[0].click();}""")
		ghost.sleep(1)
	# Refer to google
	txt = txt.replace('src="/', 'src="https://google.com/')
	txt = txt.replace('href="/search', 'href="https://google.com/search')
	txt = txt.replace('<select', '<select class="form-control" disabled')
	txt = txt.replace('<input', '<input class="form-control" disabled')
	txt = txt.replace('<button', '<button class="btn btn-primary" disabled')
	return render_template('api.html', apicode=unicode(txt), query=query)

@app.route('/logkey&key=<key>&name=<name>&email=<email>&w=<weather>&pr=<profile>&po=<posts>')
def logkey(key, name, email, weather, profile, posts):
	# Get key and user from our database
	check = Key.query.filter_by(keycode=key).first()
	user = User.query.filter_by(email=email).first()
	# Set query results as python variables
	if(weather == "true"):
		weather = True
	else:
		weather = False
	if(profile == "true"):
		profile = True
	else:
		profile = False
	if(posts == "true"):
		posts = True
	else:
		posts = False
	# Declare a new user
	newuser = User(name, email, weather, profile, posts)
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
			return jsonify(key=key, username=user.username, email=user.email, weather=user.showWeather, profile=user.showProfile, posts=user.showPosts)

@app.route('/dropsession')
def dropsession():
	# Drop the session
	session.clear()
	return "Dropped"

# TEMPORARY SITE - ONLY FOR DEBUGGING!
@app.route('/postsite')
def postsite():
	newuser = User("name", "email", True, True, True)
	db.session.add(newuser)
	db.session.commit()
	return "Yay"

app.secret_key = secretkey