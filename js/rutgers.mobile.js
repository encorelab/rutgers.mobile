	/*jshint browser: true, devel: true */
	/*globals Sail, jQuery, Rollcall, _ */
	var rutgers = window.rutgers || {};

	rutgers = (function() {
		"use strict";
		var self = {};

		// Colin you can either create a variable with:
		// var assignedTransects (which is within rutgers)
		// or you can add a member to the object self (below an empty array called assignedTransect)
		// however I think you could do this later on without this line
		self.assignedTransects = [];
		// self.currentTransect;
		// self.currentPlot;
		// self.currentCategory;
		// self.currentSubcategory;

		self.init = function() {
			console.log('Initializing...');

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

	/* =============== PAGE INITS ================ */

		$('#home').live('pageinit',function(event){
			// do db call to check the following:
			// which transects have been completed - set [done] vs [not done]
			// which plots have been completed - set button data-icons

			// do a rollcall (?) call to check the following:
			// which transects have been assigned - 

			// UI-TESTING:
			var transectsAssigned = [2,3];
			var plotsCompleted = [{"transect-2":["plot-1"],"transect-3":["plot-1","plot-2","plot-3","plot-4","plot-5"]}];

			// assign transects, add the class, add text to the accordions
			self.assignedTransects = transectsAssigned;				// TODO confirm that this copies the array correctly;
			$('first-transect-group').addClass('transect-' + self.assignedTransects[0]);
			$('accordion-header').text('Transect ' + self.assignedTransects[0]);			// TODO add [done] or [not done] here
			$('first-transect-group').addClass('transect-' + self.assignedTransects[1]);
			$('accordion-header').text('Transect ' + self.assignedTransects[1]);			// TODO add [done] or [not done] here

			_.each(plotsCompleted, function(transect) {
				console.log(transect);

				_.each(transect, function(plot) {

					console.log(plot);
				});
	/*
				$('.' + transect + '.' + plot).attr('data-icon', 'check');
				$('.' + transect + '.' + plot).attr('data-icon-pos', 'left');
	b.attr('data-icon-pos', 'left');*/
			});
			


		});


	/* ================= */

	/* ===== Armin ===== */





	/* ================= */

		return self;
	})();


