from flask import render_template
from app import app 
from ghost import Ghost 
from urllib import quote_plus
from app.config import *

ghost = Ghost()

@app.route('/')
def index():
	return render_template('index.html', active_tab='home', weatherApiKey=weatherApiKey)

@app.route('/csstest')
def csstest():
	return render_template('csstest.html', active_tab='csstest')

@app.route('/gapi&q=<query>')
def gapi(query):
	# Creates headless browser
	# Opens the web page
	ghost.open('https://www.google.ch/webhp?hl=de#safe=off&hl=en-CH&q=' + query)
	# Opens 'show more infos' buttons if available
	ghost.wait_for_page_loaded()
	# Gets desired element
	ghost.sleep(1)
	el = ghost.main_frame.findAllElements(".kp-blk")
	txt = ""
	print("reach")
	if not (el.count()>0):
		print("reach1")
		el = ghost.main_frame.findFirstElement(".ct-cs")
		txt = el.toOuterXml();
	else:
		print("reach2")
		for i in range(0, el.count()):
			txt += el.at(i).toOuterXml()
		ghost.evaluate("""if(document.getElementsByClassName('exp-txt _ubf vk_arc')[0]){document.getElementsByClassName('exp-txt _ubf vk_arc')[0].click();}
			if(document.getElementsByClassName('exp-txt _qxg vk_arc')[0]){document.getElementsByClassName('exp-txt _qxg vk_arc')[0].click();}""")
		ghost.sleep(1)
	print("reach3")
	txt = txt.replace('src="/', 'src="https://google.com/')
	txt = txt.replace('href="/search', 'href="https://google.com/search')
	txt = txt.replace('<select', '<select class="form-control" disabled')
	txt = txt.replace('<input', '<input class="form-control" disabled')
	txt = txt.replace('<button', '<button class="btn btn-primary" disabled')
	return render_template('api.html', apicode=unicode(txt), query=query)
