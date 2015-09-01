from flask import Flask, render_template, session, jsonify, request
from app import app 
from app.models import *
from ghost import Ghost 
from app.config import *

import datetime
import json

ghost = Ghost()


@app.route('/')
def index():
	return render_template('index.html', weatherApiKey=weatherApiKey)

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
	txt = txt.replace('src="/', 'src="https://www.google.com/')
	txt = txt.replace('href="/search', 'href="https://google.com/search')
	txt = txt.replace('<select', '<select class="form-control" disabled')
	txt = txt.replace('<input', '<input class="form-control" disabled')
	txt = txt.replace('<button', '<button class="btn btn-primary" disabled')
	txt = txt.replace('rows="', 'rows="0.')
	return render_template('api.html', apicode=unicode(txt), query=query)

@app.route('/logkey', methods=['POST'])
def logkey():
	if('key' in request.form):
		key = request.form["key"]
	if('name' in request.form):
		name = request.form["name"]
	if('email' in request.form):
		email = request.form["email"]
	if('weather' in request.form):
		weather = request.form["weather"]
	if('events' in request.form):
		events = request.form["events"]
	# Get key and user from our database
	check = Key.query.filter_by(keycode=key).first()
	user = User.query.filter_by(email=email).first()
	# Set results as python variables
	weather = checkType(weather)
	# Declare a new user
	newuser = User(name, email, weather, events)
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
		if (user.calendarEvents != events):
			user.calendarEvents = events
			db.session.commit()
	if (check is None):
		# If the key is nonexistent in our database, add it
		keycode = Key(key, email)
		db.session.add(keycode)
		db.session.commit()
		return '<body style="background-color:#2c3e50;"><span style="color:#2ecc71;font-size:40px;text-transform: uppercase;font-family: Sans-serif;">Success!</span></body>'
	else:
		return '<body style="background-color:#2c3e50;"><span style="color:#e74c3c;font-size:30px;text-transform: uppercase;font-family: Sans-serif;">Key already in use!</span></body>'


def checkType(string):
	if(string == "true"):
		return True
	elif(string == "false"):
		return False
	else:
		return None

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
			session['key'] = key
			session['username'] = user.username
			session['email'] = user.email
			session['weather'] = user.showWeather
			return jsonify(key=key, username=user.username, email=user.email, weather=user.showWeather)

@app.route('/dropsession')
def dropsession():
	# Drop the session
	session.clear()
	return "Dropped"

@app.route('/getCalendar')
def getCalendar():
	user = User.query.filter_by(email=session['email']).first()
	if (user is None):
		return "false"
	else:
		return user.calendarEvents


@app.route('/login')	
def login():
	ghost.open('https://accounts.google.com/ServiceLogin?sacu=1#identifier')
	ghost.capture_to("google.png")
	return "Done"

@app.route('/setcommand', methods=['POST'])
def setcommand():
	if('command' in request.form):
		command = request.form["command"]
	else:
		command = "failer"
	if('sentence' in request.form):
		sentence = request.form["sentence"]
	else:
		sentence = "failersentence"
	if('userid' in request.form):
		userid = request.form["userid"]
	else:
		userid = 404

	newRelation = CommandRelation(sentence, command, userid)
	db.session.add(newRelation)
	db.session.commit()

	user = User.query.filter_by(id = userid)

	return "Set command: " + command + ", with sentence: " + sentence + " for user: " + user.email

app.secret_key = secretkey