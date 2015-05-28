$(document).ready(function() {
	// get bootstrap tooltips and popovers ready
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
    $("[data-toggle=popover]").popover();
    setTimeout(function(){$("body").attr('style', 'opacity:1;transform: scale(1);-webkit-transform: scale(1);')}, 1000);
});

