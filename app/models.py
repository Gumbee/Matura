from app import db

import datetime

# User table
class User(db.Model):
    __tablename__ = 'User'
    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True, unique=True)
    email = db.Column('email', db.String(80), nullable=False, unique=True)
    username = db.Column('username', db.String(50), nullable=False, unique=True)
    showWeather = db.Column('showWeather', db.Boolean)
    showProfile = db.Column('showProfile', db.Boolean)
    showPosts = db.Column('showPosts', db.Boolean)
    showCalendar = db.Column('showCalendar', db.Boolean)
    calendarCount = db.Column('calendarCount', db.Integer)

    def __init__(self, username, email, showWeather, showProfile, showPosts, showCalendar, calendarCount):
        self.username = username
        self.email = email
        self.showWeather = showWeather
        self.showProfile = showProfile
        self.showPosts = showPosts
        self.showCalendar = showCalendar
        self.calendarCount = calendarCount

    def __repr__(self):
        return "<User firstname=" + self.firstname + ", lastname=" + self.lastname + ">"

# User table end
# LoginKey table
class Key(db.Model):
    __tablename__ = 'Key'
    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True, unique=True)
    keycode = db.Column('keycode', db.String(50), nullable=False, unique=True)
    email = db.Column(db.Integer, db.ForeignKey('User.email'))
    expiration = db.Column('expiration', db.DateTime, nullable=False)

    def __init__(self, keycode, email):
        self.keycode = keycode
        self.email = email
        self.expiration = datetime.datetime.now() + datetime.timedelta(minutes=5);

    def __repr__(self):
        return "<Key keycode=" + self.keycode + ">"