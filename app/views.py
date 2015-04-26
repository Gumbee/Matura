from flask import render_template
from app import app 

@app.route('/')
def index():
    return render_template('index.html', active_tab='home')

@app.route('/csstest')
def csstest():
	return render_template('csstest.html', active_tab='csstest')