var tts = document.getElementById("tts");
var tts_source = document.getElementById("tts_source");
var h_scroll = 0;
if (annyang) {
	// Set basic commands
	var commands = {
		'(could) (you) (please) google *query': function(query) {
			$("#google-box").css('display', 'block');
			$("#google-box").html('<img src="http://sierrafire.cr.usgs.gov/images/loading.gif" width="130" style="display:block;margin-left:auto;margin-right:auto;">');
			$.get("/gapi&q=" + query, function(response){
				$("#google-box").html(response);
			});
		},
		'(could) (you) (please) close (google) information(s) (box) (please)': function(){
			$("#google-box").animate({
				height: "toggle"
			}, 1500, function() {
				$("#google-box").display = "none";
			});
		},
		'(could) (you) (please) open (google) (googles) information(s) (box) (please)': function(){
			$("#google-box").animate({
				display: "inline",
				height: "toggle"
			}, 1500, function() {
			});
		},
		'(could) (you) (please) close (the) weather (box) (please)': function(){
			$("#weather-box").animate({
				height: "toggle"
			}, 1500, function() {
				$("#weather-box").display = "none";
			});
		},
		'(could) (you) (please) open (the) weather (box) (please)': function(){
			$("#weather-box").animate({
				display: "inline",
				height: "toggle"
			}, 1500, function() {
			});
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
	};
	// Add commands to annyang
	annyang.addCommands(commands);

	annyang.addCallback('result', function () {
		console.log(event.results[event.results.length-1][0].transcript);
		$('#speech-show').html(event.results[event.results.length-1][0].transcript);
		for(var x=1;x<10;x++){
			$('#speech-show').html($('#speech-show').html() + "<br/>" + event.results[event.results.length-1][x].transcript);
		}
	});

	// Start listening
	annyang.setLanguage("en-US");
	annyang.debug(true);
	annyang.start();
}