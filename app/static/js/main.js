$(document).ready(function() {
	// get bootstrap tooltips and popovers ready
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
    $("[data-toggle=popover]").popover();
    setTimeout(function(){$("body").attr('style', 'opacity:1;transform: scale(1);-webkit-transform: scale(1);')}, 1000);

	showConversation();
    var tConversation = setInterval(function(){
    	showConversation();
    }, 300000);

});


var showConversation = function(){
	$("#conversation-container").attr('style', '');
	var ta = setTimeout(function(){
		$("#conversation-container").removeClass('closed');
	}, 1000);
	
	setConversation(getConversation());
	
	var w = setTimeout(function(){
		$("#conversation-container").addClass('closed');
		var tb = setTimeout(function(){
			$("#conversation-container").attr('style', 'display:none;');
		}, 1600);
	}, 60000);
}

var setConversation = function(conversation){
	$("#conversation-container").html(conversation);
}

var conversation = {
	'morning': [
		'Rise n’ shine!',
		'Good Morning',
		'Bad morning, it is not!',
		'Hello World!',
		'Welcome to the first day of the rest of your life!',
		'Morning already?',
		'Did you sleep well?',
		'What a lovely morning!',
		'Morning! How’s it going?',
		'Welcome to yesterday’s tomorrow!'
	],
	'day': [
		'How’s it going?',
		'Doing well?',
		'Hope it’s a good day so far.',
		'What are you doing?',
		'Everything under control?',
		'An apple a day keeps the doctor away!',
		'What you do today could improve tomorrow'
	],
	'night': [
		'Good Night',
		'Sleep well',
		'Shouldn’t you be going to sleep?',
		'Shouldn’t you be sleeping already?',
		'It’s dark already.',
		'Time to go to sleep.',
		'Fine night for some sleep'
	]
};

var cx = 'morning';
var cy = Math.floor((Math.random() * conversation[cx].length));

var getConversation = function(){
	var now = moment();

	if(now.hour() > 4 && now.hour() < 11){
		if(cx != 'morning'){
			cx = 'morning';
			cy = Math.floor((Math.random() * conversation[cx].length));
		}
	}else if(now.hour() > 10 && now.hour() < 21){
		if(cx != 'day'){
			cx = 'day';
			cy = Math.floor((Math.random() * conversation[cx].length));
		}
	}else{
		if(cx != 'night'){
			cx = 'night';
			cy = Math.floor((Math.random() * conversation[cx].length));
		}
	}

	return conversation[cx][cy];

}
