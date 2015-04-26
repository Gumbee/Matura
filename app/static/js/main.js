$(document).ready(function() {
	// get bootstrap tooltips and popovers ready
    $("body").tooltip({ selector: '[data-toggle=tooltip]' });
    $("[data-toggle=popover]").popover();
});