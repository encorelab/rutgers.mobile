/*jshint browser: true, devel: true */
/*globals Sail, jQuery, Rollcall */
var rutgers = window.rutgers || {};

rutgers = (function() {
	"use strict";
	var self = {};

	self.init = function() {
		//alert('I work!');

		jQuery(document).ready(function(){
			// clearing username
			jQuery('#username').val("");
			// setting focus to username field
			jQuery('#username').focus();
		});

		jQuery('#login .submit-button').click(function(){
			alert('Clicky works');
		});
	};

/* ===== Colin ===== */




/* ================= */

/* ===== Armin ===== */





/* ================= */

	return self;
})();


