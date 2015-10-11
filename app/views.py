from flask import Flask, render_template, session, jsonify, request, Response
from app import app 
from app.models import *
from ghost import Ghost 
from app.config import *

from sqlalchemy import desc
from dateutil.parser import parse
import datetime
import json

ghostObject = Ghost()

### Functions with Route
@app.route('/')
def index():
	return render_template('index.html', weatherApiKey=weatherApiKey)

@app.route('/gapi&q=<query>')
def gapi(query):
	with ghostObject.start() as ghost:
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
			# If the elements were found, add all elements to our text 
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
	key = checkForm('key');
	name = checkForm('name');
	email = checkForm('email');
	weather = checkForm('weather');
	calendar = checkForm('calendar');
	sleep = checkForm('sleep');
	events = checkForm('events');
	if(events is None):
		events = ""
	# Get key and user from our database
	check = Key.query.filter_by(keycode=key).first()
	user = User.query.filter_by(email=email).first()
	# Set results as python variables
	weather = checkType(weather)
	calendar = checkType(calendar)
	sleep = checkType(sleep)
	# Declare a new user
	newuser = User(name, email, weather, calendar, sleep, events)
	if (user is None):
		# If the user is nonexistent in our databse, add him
		db.session.add(newuser)
		db.session.commit()
	else:
		# Check if any changes were made to our user and update them
		if (user.email != email):
			user.email = email
		if (user.username != name):
			user.username = name
		if (user.showWeather != weather):
			user.showWeather = weather
		if (user.showCalendar != calendar):
			user.showCalendar = calendar
		if (user.showSleep != sleep):
			user.showSleep = sleep
		if (user.calendarEvents != events):
			user.calendarEvents = events
		db.session.commit()
	if (check is None):
		# If the key is nonexistent in our database, add it
		keycode = Key(key, email)
		db.session.add(keycode)
		db.session.commit()
		return 'Success'
	else:
		return 'Key already in use'

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
			session['calendar'] = user.showCalendar
			session['sleep'] = user.showSleep
			return jsonify(key=key, username=user.username, email=user.email, weather=user.showWeather, calendar=user.showCalendar, sleep=user.showSleep)

@app.route('/setSleep', methods=['POST', 'GET'])
def setSleep():
	if('email' in session):
		hours = checkForm('hours');
		date = checkForm('date');
		datePy = parse(date)
		newSleep = Sleep(hours, datePy, session['email'])
		# If the user is nonexistent in our databse, add him
		db.session.add(newSleep)
		db.session.commit()
		return "done"
	else:
		return False

@app.route('/getSleep')
def getSleep():
	if('email' in session):
		week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
		entities = Sleep.query.order_by(desc(Sleep.date)).limit(5).all()
		length = Sleep.query.order_by(desc(Sleep.date)).limit(5).count()

		labels = []
		series = []
		serie = []
		
		for i in range(length-1, -1, -1):
			labels.append(week[(entities[i].date.weekday())])

		for i in range(length-1, -1, -1):
			serie.append(entities[i].duration)

		series.append(serie)

		js = {'labels': labels, 'series': series}

		return jsonify(labels=labels, series=series)
	else:
		return "false"

@app.route('/getCalendar')
def getCalendar():
	if('key' in session):
		user = User.query.filter_by(email=session['email']).first()
		if (user is None):
			return "false"
		else:
			return user.calendarEvents
	else:
		return ""

@app.route('/dropsession')
def dropsession():
	# Drop the session
	session.clear()
	return "Dropped"


### Functions without Route
def checkType(string):
	if(string == "true"):
		return True
	elif(string == "false"):
		return False
	else:
		return None

def checkForm(string):
	if(string in request.form):
		return request.form[string]
	else:
		return None

app.secret_key = secretkey