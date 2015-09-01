from app import db

import datetime

# User table
class User(db.Model):
    __tablename__ = 'User'
    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True, unique=True)
    email = db.Column('email', db.String(80), nullable=False, unique=True)
    username = db.Column('username', db.String(50), nullable=False, unique=True)
    showWeather = db.Column('showWeather', db.Boolean)
    calendarEvents = db.Column('events', db.Text, nullable=False)

    def __init__(self, username, email, showWeather, events):
        self.username = username
        self.email = email
        self.showWeather = showWeather
        self.calendarEvents = events

    def __repr__(self):
        return "<User firstname=" + self.firstname + ", lastname=" + self.lastname + ">"

# User table end
# User learning table begin
class CommandRelation(db.Model):
    __tablename__ = 'CommandRelation'
    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True, unique=True)
    sentence = db.Column('sentence', db.String(200), nullable=False)
    command = db.Column('command', db.String(200), nullable=False)
    user = db.Column(db.Integer, db.ForeignKey('User.id'))

    def __init__(self, sentence, command, user):
        self.sentence = sentence
        self.command = command
        self.user = user;

    def __repr__(self):
        return "<CommandRelation sentence=" + self.keycode + " with command=" + self.command + ">"
# User learning table end
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
