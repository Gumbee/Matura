from app import app
from app import db
from app.models import User
from flask.ext.sqlalchemy import SQLAlchemy
import logging

db.create_all()
app.run(debug = True, use_reloader = False)
