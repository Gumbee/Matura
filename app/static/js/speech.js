var tts = document.getElementById("tts");
var tts_source = document.getElementById("tts_source");
var h_scroll = 0;
if (annyang) {
	// Set basic commands
	var commands = {
		'(could) (you) (please) google *query': function(query) {
			$("#informtaion-container").css('display', 'inline-block');
			$("#google-box").html('<img src="http://sierrafire.cr.usgs.gov/images/loading.gif" width="130" style="display:block;margin-left:auto;margin-right:auto;">');
			$.get("/gapi&q=" + query, function(response){
				$("#google-box").html(response);
			});
		},
		'(could) (you) (please) close (the) :container (information) (box) (please)': function(container){
			$("#"+container+"-container").addClass('closed');
			var t = setTimeout(function(){$("#"+container+"-container").attr('style', 'display:none;');}, 1600);
		},
		'(could) (you) (please) open (the) :container (information) (box) (please)': function(container){
			$("#"+container+"-container").attr('style', '');
			var t = setTimeout(function(){$("#"+container+"-container").removeClass('closed');}, 1000);
		},
		'(could) (you) (please) scroll down (a) (bit) (please)': function(){
			var n = $(document).height();
    		$('html, body').animate({ scrollTop: n }, 500);
		},
		'(could) (you) (please) scroll up (a) (bit)  (please)': function(){
    		$('html, body').animate({ scrollTop: 0 }, 500);
		},
		'(could) (you) (please) scroll down (some) element(s) (please)': function(){
    		$('.scrt-ic').animate({ scrollTop: h_scroll+100 }, 500);
    		h_scroll += 100;
		},
		'(could) (you) (please) scroll up (some) element(s) (please)': function(){
    		$('.scrt-ic').animate({ scrollTop: h_scroll-100 }, 500);
    		h_scroll -= 100;
		},
		'(could) (you) (please) scroll to (the) bottom (of) (the) element(s) (please)': function(){
    		$('.scrt-ic').animate({ scrollTop: 10000 }, 500);
    		h_scroll += 100;
		},
		'(could) (you) (please) scroll to (the) top (of) (the) element(s) (please)': function(){
    		$('.scrt-ic').animate({ scrollTop: 0 }, 500);
		},
		'change style': function(){
			if($('#style').attr("href") == '/static/css/main.css'){
				$('#style').attr('href', '/static/css/main-backup-14-5.css')
			}else{
				$('#style').attr('href', '/static/css/main.css')
			}
		}
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