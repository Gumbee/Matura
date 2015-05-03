if (annyang) {
	// Set basic commands
	var commands = {
		'show report': function() {
			console.log("Text arrived!");
		}
	};
	// Add commands to annyang
	annyang.addCommands(commands);

	annyang.addCallback('result', function () {
		// console.log(event);
		console.log(event.results[event.results.length-1][0].transcript);
	});

	// Start listening
	annyang.setLanguage("en-GB");
	annyang.debug(true);
	annyang.start();
}