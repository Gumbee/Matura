from app import app
from app import db
from flask.ext.sqlalchemy import SQLAlchemy
from OpenSSL import SSL

context = SSL.Context(SSL.SSLv23_METHOD)
context.use_privatekey_file('app/ssl/server.key')
context.use_certificate_file('app/ssl/server.crt')
db.create_all()
app.run(debug = False, ssl_context=context)