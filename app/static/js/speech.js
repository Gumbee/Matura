"use strict";

// Command functions

var searchGoogle = function(query) {
	h_scroll = 0;
	$("#information-container").css('display', 'inline-block');
	$("#information-container").removeClass('closed');
	$("#google-box").html('<img src="http://sierrafire.cr.usgs.gov/images/loading.gif" width="130" style="display:block;margin-left:auto;margin-right:auto;">');
	$.get("/gapi&q=" + query, function(response){
		$("#google-box").html(response);
	});
}

var closeContainer = function(container){
	container = container.toLowerCase();
	$("#"+container+"-container").addClass('closed');
	console.log("#"+container+"-container");
	var t = setTimeout(function(){$("#"+container+"-container").attr('style', 'display:none;');}, 1600);
}

var openContainer = function(container){
	$("#"+container+"-container").attr('style', '');
	var t = setTimeout(function(){$("#"+container+"-container").removeClass('closed');}, 1000);
}

var scrollDownPage = function(){
	var n = $(document).height();
	$('html, body').animate({ scrollTop: n }, 500);
}

var scrollUpPage = function(){
	$('html, body').animate({ scrollTop: 0 }, 500);
}

var scrollDownElements = function(){
	var n = $('.scrt-ic').prop('scrollHeight');
	$('.scrt-ic').animate({ scrollTop: h_scroll+100 }, 500);
	h_scroll += 100;
	if(h_scroll > n-$('.scrt-ic').height()){
		h_scroll = n-$('.scrt-ic').height();
	}
}

var scrollUpElements = function(){
	$('.scrt-ic').animate({ scrollTop: h_scroll-100 }, 500);
	h_scroll -= 100;
	if(h_scroll < 0){
		h_scroll = 0;
	}
}

var scrollBottomElements = function(){
	var n = $('.scrt-ic').prop('scrollHeight');
	$('.scrt-ic').animate({ scrollTop: n }, 500);
	h_scroll = n-$('.scrt-ic').height();
}

var scrollTopElements = function(){
	$('.scrt-ic').animate({ scrollTop: 0 }, 500);
	h_scroll = 0;
}

var logout = function(){
	logout();
}

var reminderTo = function(query){
	//Chrono parse
}

var reminderAbout = function(query){
	//Chrono parse

}

var showCommands = function(){
	$("#help-container").attr('style', '');
	var t = setTimeout(function(){$("#help-container").removeClass('closed');}, 1000);

	var commandHelp = [
		'google *something',
		'close *box',
		'open *box',
		'scroll down',
		'scroll down elements',
		'scroll down',
		'scroll up elements',
		'scroll up',
		'scroll top elements',
		'scroll bottom elements',
		'log out'
	];
	console.log("HERE TO HELP!");

	var helpBox = '<h2>Commands:</h2>';
	for(var x=0;x<commandHelp.length;x++){
		helpBox += commandHelp[x] + '<br/>';
	}

	$("#help-container").html(helpBox);

	var w = setTimeout(function(){
		$("#help-container").addClass('closed');
		var t = setTimeout(function(){$("#help-container").attr('style', 'display:none;');}, 1600);
	}, 30000);
}

// Functions with parsing
var searchGoogleParse = function(sentence) {
	h_scroll = 0;
	$("#information-container").css('display', 'inline-block');
	$("#information-container").removeClass('closed');
	$("#google-box").html('<img src="http://sierrafire.cr.usgs.gov/images/loading.gif" width="130" style="display:block;margin-left:auto;margin-right:auto;">');
	
	var index = kmp(sentence, 'something about');
	var query;
	if(index>=0){
		var sub1 = sentence.substr(0, index+15);
		query = sentence.substr(index+15);
		console.log(sub1 + " <=> " + query);
	}else{
		index = kmp(sentence, 'google me');
		var length = 9;
		if(index < 0){
			index = kmp(sentence, 'google');
			length = 6;
		}
		var sub1 = sentence.substr(0, index+length);
		query = sentence.substr(index+length);
		query = query.replace('for me', '');
		console.log(sub1 + " <=> " + query);
	}

	$.get("/gapi&q=" + query, function(response){
		$("#google-box").html(response);
	});
}

var closeContainerParse = function(sentence){

	var container = "None";
	var containers = [
		'weather',
		'calendar',
		'information',
		'login'
	];

	for(var x=0;x<containers.length;x++){
		if(kmp(sentence, containers[x])>=0){
			container = containers[x];
		}
	}

	if(container != "None"){
		container = container.toLowerCase();
		$("#"+container+"-container").addClass('closed');
		var t = setTimeout(function(){$("#"+container+"-container").attr('style', 'display:none;');}, 1600);
	}
}

var openContainerParse = function(sentence){
	var container = "None";
	var containers = [
		'weather',
		'calendar',
		'information',
		'login'
	];

	for(var x=0;x<containers.length;x++){
		if(kmp(sentence, containers[x])>=0){
			container = containers[x];
		}
	}

	if(container != "None"){
		$("#"+container+"-container").attr('style', '');
		var t = setTimeout(function(){$("#"+container+"-container").removeClass('closed');}, 1000);
	}
}

// Speech Recognition start
if (annyang) {
	var tts = document.getElementById("tts");
	var tts_source = document.getElementById("tts_source");
	// Set basic commands
	var commands = {
		'(could) (you) (please) google (me) *query': searchGoogle,
		'(could) (you) (please) close (the) :container (information) (box) (please)': closeContainer,
		'(could) (you) (please) open (the) :container (information) (box) (please)': openContainer,
		'(could) (you) (please) scroll down (a) (bit) (please)': scrollDownPage,
		'(could) (you) (please) scroll up (a) (bit)  (please)': scrollUpPage,
		'(could) (you) (please) scroll down (some) element(s) (please)': scrollDownElements,
		'(could) (you) (please) scroll up (some) element(s) (please)': scrollUpElements,
		'(could) (you) (please) scroll to (the) bottom (of) (the) element(s) (please)': scrollBottomElements,
		'(could) (you) (please) scroll to (the) top (of) (the) element(s) (please)': scrollTopElements,
		'(could) (you) (please) help (me) (please)': showCommands,
		'(could) (you) (please) log (me) out': logout
	};
	// Add commands to annyang
	annyang.addCommands(commands);

	annyang.addCallback('resultNoMatch', function () {
		$('#speech-show').html(event.results[event.resultIndex][0].transcript);
		if(event.results[0].length > 0){
			if(event.results[event.results.length-1][0].transcript){
				$('#speech-show').html($('#speech-show').html() + "<br/>" + event.results[event.results.length-1][0].transcript);
				getCommand(event.results[event.results.length-1][0].transcript);
			}
		}
	});

	// Start listening
	annyang.setLanguage("en-US");
	annyang.debug(true);
	annyang.start();
}

var kmp = function (string, pattern){

	string = string.toLowerCase();
	pattern = pattern.toLowerCase();

	var i=0, j=0;
	var prefix = lps(pattern);

	while(i<string.length && j<pattern.length){
		if(string[i] == pattern[j]){
			j++;
		}else{
			while(j!=0){
				j=prefix[j-1];
				if(string[i] == pattern[j]){
					j++;
					break;
				}
			}
			if(j==0){
				if(string[i] == pattern[j]){
					j++;
				}
			}
		}
		i++;
	}

	if(j == pattern.length){
		return i-j;
	}else{
		return -1;
	}
}

var lps = function(pattern){

	var i=0, j=1;

	var prefix = [];
	prefix[0] = 0;

	while(j<pattern.length){
		if(pattern[j] == pattern[i]){
			prefix[j] = i+1;
			i++;
		}else{
			prefix[j] = 0;
			while(i!=0){
				i = prefix[i-1];
				if(pattern[j] == pattern[i]){
					prefix[j] = i+1;
					i++;
					break;
				}
			}
		}
		j++;
	}

	// console.log(prefix.toString());
	return prefix;

}

var getCommand = function (sentence) {

	var CommandList = [
		['google', searchGoogleParse],
		['close', closeContainerParse],
		['closing', closeContainerParse],
		['open', openContainerParse],
		['scroll', 'down', 'element', scrollDownElements],
		['scroll', 'down', scrollDownPage],
		['scroll', 'up', 'element', scrollUpElements],
		['scroll', 'up', scrollUpPage],
		['scroll', 'bottom', 'element', scrollBottomElements],
		['scroll', 'top', 'element', scrollTopElements],
		['help', showCommands],
		['log', 'out', logout]
	];
	
	for(var x=0;x<CommandList.length;x++){
		var cout = true;
		for(var y=0;y<CommandList[x].length-1;y++){
			if(kmp(sentence, CommandList[x][y])<0){
				cout = false;
				break;
			}
		}
		if(cout){
			var scout = "";
			for(var y=0;y<CommandList[x].length-1;y++){
				scout += CommandList[x][y] + " " ;
			}
			console.log("Yes -> " + scout);
			CommandList[x][CommandList[x].length-1](sentence);
			break;
		}
	}

	return 0;

}

var h_scroll = 0;

// searchGoogle("weather bern");