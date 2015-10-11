from app import db

import datetime

# User table
class User(db.Model):
    __tablename__ = 'User'
    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True, unique=True)
    email = db.Column('email', db.String(80), nullable=False, unique=True)
    username = db.Column('username', db.String(50), nullable=False, unique=True)
    showWeather = db.Column('showWeather', db.Boolean)
    showCalendar = db.Column('showCalendar', db.Boolean)
    showSleep = db.Column('showSleep', db.Boolean)
    calendarEvents = db.Column('events', db.Text, nullable=False)

    def __init__(self, username, email, showWeather, showCalendar, showSleep, events):
        self.username = username
        self.email = email
        self.showWeather = showWeather
        self.showCalendar = showCalendar
        self.showSleep = showSleep
        self.calendarEvents = events

    def __repr__(self):
        return "<User firstname=" + self.firstname + ", lastname=" + self.lastname + ">"

# User table end
# LoginKey table
class Key(db.Model):
    __tablename__ = 'Key'
    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True, unique=True)
    keycode = db.Column('keycode', db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(80), db.ForeignKey('User.email'))
    expiration = db.Column('expiration', db.DateTime, nullable=False)

    def __init__(self, keycode, email):
        self.keycode = keycode
        self.email = email
        self.expiration = datetime.datetime.now() + datetime.timedelta(minutes=5);

    def __repr__(self):
        return "<Key keycode=" + self.keycode + ">"
# LoginKey end
# Sleep table
class Sleep(db.Model):
    __tablename__ = 'Sleep'
    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True, unique=True)
    duration = db.Column('duration', db.Float, nullable=False)
    date = db.Column('date', db.DateTime, nullable=False)
    email = db.Column(db.String(80), db.ForeignKey('User.email'))

    def __init__(self, duration, date, email):
        self.duration = duration
        self.date = date
        self.email = email

    def __repr__(self):
        return "<Sleep sleep=" + self.duration + ">"
# Sleep end
