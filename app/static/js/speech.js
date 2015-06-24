if (annyang) {
	var tts = document.getElementById("tts");
	var tts_source = document.getElementById("tts_source");
	// Set basic commands
	var commands = {
		'(could) (you) (please) google *query': searchGoogle,
		'(could) (you) (please) close (the) :container (information) (box) (please)': closeContainer,
		'(could) (you) (please) open (the) :container (information) (box) (please)': openContainer,
		'(could) (you) (please) scroll down (a) (bit) (please)': scrollDownPage,
		'(could) (you) (please) scroll up (a) (bit)  (please)': scrollUpPage,
		'(could) (you) (please) scroll down (some) element(s) (please)': scrollDownElements,
		'(could) (you) (please) scroll up (some) element(s) (please)': scrollUpElements,
		'(could) (you) (please) scroll to (the) bottom (of) (the) element(s) (please)': scrollBottomElements,
		'(could) (you) (please) scroll to (the) top (of) (the) element(s) (please)': scrollTopElements,
		'log out': logout
	};
	// Add commands to annyang
	annyang.addCommands(commands);

	annyang.addCallback('result', function () {
		console.log(event.results[event.results.length-1][0].transcript);
		$('#speech-show').html(event.results[event.results.length-1][0].transcript);
		for(var x=1;x<event.results[0].length;x++){
			if(event.results[event.results.length-1][x].transcript){
				$('#speech-show').html($('#speech-show').html() + "<br/>" + event.results[event.results.length-1][x].transcript);
			}
		}
	});

	// Start listening
	annyang.setLanguage("en-US");
	annyang.debug(true);
	annyang.start();
}

var h_scroll = 0;

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

// searchGoogle("weather bern");