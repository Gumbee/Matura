from app import db

# User table
class User(db.Model):
    __tablename__ = 'User'
    id = db.Column('id', db.Integer, primary_key=True, autoincrement=True)
    firstname = db.Column('firstname', db.String(50), nullable=False)
    lastname = db.Column('lastname', db.String(50), nullable=False)
    email = db.Column('email', db.String(80), nullable=False)

    def __init__(self, firstname, lastname, email):
        self.firstname = firstname
        self.lastname = lastname
        self.email = email

    def __repr__(self):
        return "<User firstname=" + self.firstname + ", lastname=" + self.lastname + ">"

# User table end