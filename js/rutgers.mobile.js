/*jshint browser: true, devel: true */
/*globals Sail, jQuery, Rollcall, _ */
var rutgers = window.rutgers || {};

rutgers = (function() {
  "use strict";
  var self = {};
  self.url = 'http://rollcall.badger.encorelab.org';
  var account = {'login':'','password':''};
  self.token = '';

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

    // submit button for login
    jQuery('#login .submit-button').click(function(){
      account.login = jQuery('#username').val();
      account.password = jQuery('#password').val();
      login(account, loginSuccess, loginError);
    });

    // submit button to store weather observation
    jQuery('#add-weather-observation .submit-button').click(function() {
      var weatherObservation = new rutgers.model.WeatherObservation();
      var observationTitle = jQuery('#weather-observation-title').val();
      console.log('Submitted weather observation. Title: '+observationTitle);
      weatherObservation.set('title', observationTitle);
      //weatherObservation.set('conditions', observationTitle);
      //weatherObservation.set('note', observationTitle);
      //weatherObservation.set('student_id', observationTitle);
      weatherObservation.save();
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
    self.assignedTransects = transectsAssigned;       // TODO confirm that this copies the array correctly;
    $('first-transect-group').addClass('transect-' + self.assignedTransects[0]);
    $('accordion-header').text('Transect ' + self.assignedTransects[0]);      // TODO add [done] or [not done] here
    $('first-transect-group').addClass('transect-' + self.assignedTransects[1]);
    $('accordion-header').text('Transect ' + self.assignedTransects[1]);      // TODO add [done] or [not done] here

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
  var loginSuccess = function(success){
    account.id = success.account_id;
    self.token = success.token;
    console.log('Success! Account ID: '+account.id+' token: '+self.token);
    // go to href="#home"
    jQuery('#home .username-display').text(account.login);
    jQuery.mobile.changePage("#home", "");
  };

  var loginError = function(error){
    var errorString = JSON.stringify(error);
    console.log('Error '+JSON.stringify(error.responseText));
  };

  var login = function(account, successCallback, errorCallback) {
    var login = account.login;
    var password = account.password;
    var url = self.url + '/sessions.json';

    var data = {
      session: {
        login: login,
        password: password
      }
    };

    var successCallbackWrapper = function(data) {
      successCallback(data);
    };

    requestUsingREST(url, 'POST', data, successCallbackWrapper, errorCallback);
  };

  var requestUsingREST = function(url, method, params, successCallback, errorCallback) {
    var rollcall = this;

    jQuery.ajax({
      url: url,
      type: method,
      dataType: 'json',
      data: params,
      success: successCallback,
      xhrFields: {
        withCredentials: true
      },
      crossDomain: true,
      error: function(error) {
        if (error.status === 0 && true) {
          console.error("Error while making cross-domain request to Rollcall. Is Rollcall configured for CORS?");
        }
        else {
          console.error("Error response from Rollcall at " + error.statusText);
        }

        if (errorCallback) {
          errorCallback(error);
        } else {
          rollcall.error(error);
        }
      }
    });
  };




/* ================= */
  return self;
})();


