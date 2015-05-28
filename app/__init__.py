from flask import Flask, url_for, session
from flask.ext.sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:////' + os.path.dirname(os.path.realpath(__file__)) + '/databases/mirror_database.db'
db = SQLAlchemy(app)

# Function to easily find your assets
# In your template use <link rel=stylesheet href="{{ static('filename') }}">
app.jinja_env.globals['static'] = (
    lambda filename: url_for('static', filename = filename)
)
app.jinja_env.globals['bower'] = (
    lambda filename: url_for('static', filename = "components/" + filename)
)

from app import views
from app.models import *
