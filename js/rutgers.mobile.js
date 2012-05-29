/*jshint browser: true, devel: true */
/*globals Sail, jQuery, Rollcall, _, $ */
var rutgers = window.rutgers || {};

rutgers = (function() {
  "use strict";
  var self = {};
  self.url = 'http://rollcall.badger.encorelab.org';
  var account = {'login':'','password':''};
  self.token = '';

  self.user = {
    name:null,
    group:null
  };
  self.transectsAssigned = [];
  self.plotsCompleted = {};
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

    // submit button to store weather observation - moved to weather page init
/*    jQuery('#add-weather-observation .submit-button').click(function() {
      var weatherObservation = new rutgers.model.WeatherObservation();
      var observationTitle = jQuery('#weather-observation-title').val();
      var observationNote = jQuery('#weather-observation-note').val();
      console.log('Submitted weather observation. Title: '+observationTitle);
      weatherObservation.set('title', observationTitle);
      //weatherObservation.set('conditions', observationTitle);
      weatherObservation.set('note', observationNote);
      //weatherObservation.set('student_id', observationTitle);
      weatherObservation.save();
    });*/

  };

  /* ===== Colin ===== */

  /* =============== PAGE INITS ================ */

  $('#home').live('pageinit', function(event) {
    // assign transects, add the class, add text to the accordions
    $('#home .first-transect-group').addClass('transect-' + self.transectsAssigned[0]);
    $('#home .first-transect-group').attr('value', self.transectsAssigned[0]);
    $('#home.accordion-header').text('Transect ' + self.transectsAssigned[0]);      // TODO add [done] or [not done] here
    $('#home .second-transect-group').addClass('transect-' + self.transectsAssigned[1]);
    $('#home .second-transect-group').attr('value', self.transectsAssigned[1]);
    $('#home.accordion-header').text('Transect ' + self.transectsAssigned[1]);      // TODO add [done] or [not done] here

/*    _.map(self.plotsCompleted, function (value, key) {
      //return key (2,3) value(arr,arr)
      console.log($('.transect-' + key + ' .plot-' + '1'));
      $('.transect-' + key + ' .plot-' + '1').attr('data-icon', 'check');
      $('.transect-' + key + ' .plot-' + '1').attr('data-icon-pos', 'left');    // TODO HELP
      

    });*/

    //$('.plot-button').replaceWith("<a data-role='button' data-transition='none' href='#plot-overview' data-icon='arrow' data-iconpos='left'></a>").trigger('create');

    //$('.plot-button').trigger("create");

//$('.transect-3' + ' .plot-' + '1').children('span.ui-btn-inner').children('span.ui-icon').removeClass('ui-icon-check').addClass('ui-icon-arrow'); WORKS

/*self.plotsCompleted = {2:[1],3:[1,2,3,4,5]};

    _.values(self.plotsCompleted[3]);*/

    // do we need .die()s before each of these, since we'll be returning to this page over and over?
    $('.plot-button').click(function(){
      $('.header-title').text("Plot " + $(this).attr('value'));   // I know this is a set of buttons... how can I grab the one clicked on? TODO HELP
      $('.back-button').text("Back to Plot " + $(this).attr('value'));
      $('.location').text("Transect " + $(this).parent().parent().attr('value') + ", Plot " + $(this).attr('value'));
      $('.location').attr('transect', $(this).parent().parent().attr('value'));
      $('.location').attr('plot', $(this).attr('value'));
    });

  });

  $('#plot-overview').live('pageinit',function(event) {
    // .done-button event?
  });

  // 
  $('#plants-observation-category').live('pageinit',function(event) {
    $('#plants-observation-category .plants-button').click(function() {
      $('#plants-subcategory').attr('value', $(this).attr('value'));
      $('#plants-subcategory').text($(this).attr('value'));
    });
  });

  $('#animals-observation-category').live('pageinit',function(event) {
    $('#animals-observation-category .animals-button').click(function() {
      $('#animals-subcategory').attr('value', $(this).attr('value'));
      $('#animals-subcategory').text($(this).attr('value'));
    });
  });


  $('#add-plant-observation').live('pageinit',function(event) {
    // clear all fields

    jQuery('#add-plant-observation .submit-button').click(function() {
      var plantsObservation = new rutgers.model.PlantsObservation();
      var observationTitle = jQuery('#plants-title-input').val();
      var observationSubcategory = jQuery('#plants-subcategory').val();
      var observationSurface = jQuery('#plants-surface-input').val();
      var observationNote = jQuery('#plants-note-input').val();

      plantsObservation.set('title', observationTitle);
      plantsObservation.set('subcategory', observationSubcategory);
      plantsObservation.set('surface_cover', observationSurface);
      plantsObservation.set('note', observationNote);
      plantsObservation.set('transect', $('.location').attr('transect'));
      plantsObservation.set('plot', $('.location').attr('plot'));
      plantsObservation.set('student_name', self.user.name);
      plantsObservation.set('group_name', self.user.group);
      plantsObservation.save();
    });
  });

  $('#add-animal-observation').live('pageinit',function(event) {
    // clear all fields

    jQuery('#add-animal-observation .submit-button').click(function() {
      var animalsObservation = new rutgers.model.AnimalsObservation();
      var observationTitle = jQuery('#animals-title-input').val();
      var observationSubcategory = jQuery('#animals-subcategory').val();      
      var observationCount = jQuery('#animals-count-input').val();
      var observationNote = jQuery('#animals-note-input').val();

      animalsObservation.set('title', observationTitle);
      animalsObservation.set('subcategory', observationSubcategory);
      animalsObservation.set('count', observationCount);
      animalsObservation.set('note', observationNote);
      animalsObservation.set('transect', $('.location').attr('transect'));
      animalsObservation.set('plot', $('.location').attr('plot'));
      animalsObservation.set('student_name', self.user.name);
      animalsObservation.set('group_name', self.user.group);
      animalsObservation.save();
    });
  });

  $('#add-soil-and-water-observation').live('pageinit',function(event) {
    // clear all fields

    jQuery('#add-soil-and-water-observation .submit-button').click(function() {
      var soilWaterObservation = new rutgers.model.SoilWaterObservation();
      var observationTitle = jQuery('#animals-title-input').val();
      var obserationColor = jQuery('input:radio[name=color-radios]:checked').val();
      var observationTexture = jQuery('input:radio[name=texture-radios]:checked').val();
      var observationOrganics = jQuery('input:radio[name=organics-radios]:checked').val();
      var observationWater =jQuery('input:radio[name=water-radios]:checked').val();
      var observationWaterLevel = jQuery('soilwater-water-input').val();
      var observationNote = jQuery('#animals-note-input').val();

      soilWaterObservation.set('title', observationTitle);
      soilWaterObservation.set('color', obserationColor);
      soilWaterObservation.set('texture', observationTexture);
      soilWaterObservation.set('organics', observationOrganics);
      soilWaterObservation.set('water', observationWater);
      soilWaterObservation.set('water_level', observationWaterLevel);
      soilWaterObservation.set('note', observationNote);
      soilWaterObservation.set('transect', $('.location').attr('transect'));
      soilWaterObservation.set('plot', $('.location').attr('plot'));
      soilWaterObservation.set('student_name', self.user.name);
      soilWaterObservation.set('group_name', self.user.group);
      soilWaterObservation.save();
    });
  });

  $('#add-weather-observation').live('pageinit',function(event) {
    // clear all fields

    jQuery('#add-weather-observation .submit-button').click(function() {
      var weatherObservation = new rutgers.model.WeatherObservation();
      var observationTitle = jQuery('#weather-title-input').val();
      var observationNote = jQuery('#weather-note-input').val();
      var observationConditions = [];
      $('#add-weather-observation :checked').each(function() {
        observationConditions.push($(this).val());
      });

      console.log('Submitted weather observation. Conditions: '+JSON.stringify(observationConditions));
      //console.log('Submitted weather observation. Transect: 'observationTransect);
      weatherObservation.set('title', observationTitle);
      weatherObservation.set('conditions', JSON.stringify(observationConditions));
      weatherObservation.set('note', observationNote);
      weatherObservation.set('transect', $('.location').attr('transect'));
      weatherObservation.set('plot', $('.location').attr('plot'));
      weatherObservation.set('student_name', self.user.name);
      weatherObservation.set('group_name', self.user.group);
      weatherObservation.save();
    });
  });  


  /* ================= */

  /* ===== Armin ===== */
  var loginSuccess = function(success){
    account.id = success.account_id;
    self.token = success.token;
    console.log('Success! Account ID: '+account.id+' token: '+self.token);

    // do db call to check the following:
    // which transects have been completed - set [done] vs [not done]
    // which plots have been completed - set button data-icons
    // if (no plots completed) do x, else restoreState();

    // do a rollcall call to check the following:
    // which transects have been assigned - 

    // dummy data:
    self.transectsAssigned = [2,3];
    self.plotsCompleted = {2:[1],3:[1,2,3,4,5]};

    self.user.name = account.login;
    self.user.group = "some group";     // TODO

    // go to href="#home"
    jQuery('#home .username-display').text(account.login);
    jQuery.mobile.changePage("#home");
  };

  var loginError = function(error){
    //var errorString = JSON.stringify(error);
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


