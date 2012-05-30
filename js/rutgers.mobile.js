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
  self.plotsCompleted = {};         // this will record all Done clicks plot-overview - need to run _.uniq on this to get actual plots completed

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

    // FIXME: hacky... needs to be here for proper phongep init :(
    document.addEventListener('deviceready', function() {
      console.log("DEVICE READY!!!!");
      jQuery(document).delegate('.acquire-photo', 'click', function() {
        var photo = new rutgers.model.Observation();
        var of = jQuery(this).data('photo-of');
        
        var captureSuccess = function () {
          console.log("Acquired photo of '"+of+'".');
          photo.save();

          //veos.reportForm.photos[of].push(photo);
          photo.upload();
          //veos.reportForm.renderPhotos();
        };

        photo.on('image_capture', captureSuccess, photo);
        
        switch (jQuery(this).data('acquire-from')) {
          case 'camera':
            alert("camera capture");
            photo.captureFromCamera();
            break;
          case 'gallery':
            alert("gallery capture");
            photo.captureFromGallery();
            break;
          default:
            console.error("'"+jQuery(this).data('acquire-from')+"' is not a valid source for acquiring a photo.");
        }
      });
    });

  };

  /* ===== Colin ===== */

  /* ============================== HELPER FUNCTIONS ======================================= */

  self.clearInputs = function(page) {
    $('.clearable').val('');
    $('#' + page + ' input[type=checkbox]').attr('checked',false);
    $('#' + page + ' input[type=checkbox]').checkboxradio("refresh");
    $('#' + page + ' input[type=radio]').attr('checked',false);
    $('#' + page + ' input[type=radio]').checkboxradio("refresh");
  };

  self.restoreState = function() {
/*  THIS MAY HAVE TO BE CUT - WOULD BE TOO COMPUTATIONALLY INTENSIVE  
    var plantsObsCollection = new rutgers.model.PlantsObservations();
    plantsObsCollection.on('reset', function(collection) {    
    });
    // trigger a reset of the ObsCollection
    soilWaterObsCollection.fetch();*/
  };

  /* =================================== PAGE INITS ========================================= */


  $('#home').live('pagebeforeshow', function(event) {

    // assign transects, add the class, add text to the accordions
    $('#home .first-transect-group').addClass('transect-' + self.transectsAssigned[0]);
    $('#home .first-transect-group').attr('value', self.transectsAssigned[0]);
    $('#home .first-transect-group .accordion-header').text('Transect ' + self.transectsAssigned[0]);
    var plotsArray = _.uniq(self.plotsCompleted[self.transectsAssigned[0]]);
    if (plotsArray.length === 5) {
      $('#home .first-transect-group .doneness').text(" [done]");
    }
    $('#home .second-transect-group').addClass('transect-' + self.transectsAssigned[1]);
    $('#home .second-transect-group').attr('value', self.transectsAssigned[1]);
    $('#home .second-transect-group .accordion-header').text('Transect ' + self.transectsAssigned[1]);
    var plotsArray = _.uniq(self.plotsCompleted[self.transectsAssigned[1]]);
    if (plotsArray.length === 5) {
      $('#home .second-transect-group .doneness').text(" [done]");
    }

    // modify button icons to indicate completeness
    _.each(self.plotsCompleted[self.transectsAssigned[0]], function (plot) {
      $('.first-transect-group .plot-'+plot).addClass('redBorder');
    });
    _.each(self.plotsCompleted[self.transectsAssigned[1]], function (plot) {
      $('.second-transect-group .plot-'+plot).addClass('redBorder');
    });    

    // when a plot button is clicked, set headers, back buttons, etc. on subsequent pages
    $('.plot-button').click(function(){
      $('.header-title').text("Plot " + $(this).attr('value'));
      $('.back-button').text("Back to Plot " + $(this).attr('value'));
      $('.location').text("Transect " + $(this).parent().parent().attr('value') + ", Plot " + $(this).attr('value'));

      $('.location').attr('transect', $(this).parent().parent().attr('value'));
      $('.location').attr('plot', $(this).attr('value'));
    });
  });


  $('#plot-overview').live('pageinit',function(event) {
    $('#plot-overview .done-button').die();
    $('#plot-overview .done-button').click(function() {
      var transVal = $('.location').attr('transect', $(this).parent().parent().attr('value'));
      var plotVal = $('.location').attr('plot', $(this).attr('value'));
      self.plotsCompleted[transVal].push(plotVal);
    });
  });

  // what a plant button is clicked, add the value (plant name) to the plants subcat on plants-observation-category
  $('#plants-observation-category').live('pagebeforeshow',function(event) {
    $('#plants-observation-category .plants-button').click(function() {
      $('#plants-subcategory').attr('value', $(this).attr('value'));
      $('#plants-subcategory').text($(this).attr('value'));
    });
  });

// what an animal button is clicked, add the value (animal name) to the animal subcat on animal-observation-category
  $('#animals-observation-category').live('pagebeforeshow',function(event) {
    $('#animals-observation-category .animals-button').click(function() {
      $('#animals-subcategory').attr('value', $(this).attr('value'));
      $('#animals-subcategory').text($(this).attr('value'));
    });
  });


/* =============== LIST ================ */

  $('#plants-observation').live('pagebeforeshow',function(event) {

    // create the list of group observations
    var htmlOutput = '<li data-role="list-divider" role="heading">Plant Observations</li>';
    var plantsObsCollection = new rutgers.model.PlantsObservations();
    plantsObsCollection.on('reset', function(collection) {
   
      // create the HTML for the list of plants observations for this group, transect, plot
      collection.each(function(obs) {
        if ( (obs.get('group_name') === self.user.group) && (obs.get('transect') === JSON.parse($('.location').attr('transect'))) && (obs.get('plot') === JSON.parse($('.location').attr('plot'))) ) {
          htmlOutput += '<li data-theme="c"><a href="#edit-plants-observation" data-transition="slide" class="plants-observation-';
          htmlOutput += obs.get('id');
          htmlOutput += '">';
          htmlOutput += obs.get('title');
          htmlOutput += "</a></li>";
        } else {
          console.log('observation from other group - group ' + obs.get('group_name'));
        }
      });
      $('#plants-observation .header').html(htmlOutput).listview("refresh");

      // create the event listeners for the list of observations - must be done in a separate each loop from creating the html
      // (maybe due to the fact that element doesn't exist to have a listener placed on it until after the listview(refresh)?)
      collection.each(function(obs) {
        if ( (obs.get('group_name') === self.user.group) && (obs.get('transect') == $('.location').attr('transect')) && (obs.get('plot') == $('.location').attr('plot')) ) {
          $('#plants-observation .plants-observation-'+obs.get('id')).click(function () {
            $('#edit-plants-observation .title').text(obs.get('title'));
            $('#edit-plants-observation .subcategory').text('subcategory');
            $('#edit-plants-observation .surface-cover').text(obs.get('surface_cover'));
            $('#edit-plants-observation .note').text(obs.get('note'));
            $('#edit-plants-observation .student-name').text(obs.get('student_name'));
          });
        } else {
          console.log('not adding listener, other group');
        }
      });
    });
    // trigger a reset
    plantsObsCollection.fetch();
  });


  $('#animals-observation').live('pagebeforeshow',function(event) {

    // create the list of group observations
    var htmlOutput = '<li data-role="list-divider" role="heading">Animal Observations</li>';
    var animalsObsCollection = new rutgers.model.AnimalsObservations();
    animalsObsCollection.on('reset', function(collection) {
   
      // create the HTML for the list of animals observations for this group, transect, plot
      collection.each(function(obs) {
        if ( (obs.get('group_name') === self.user.group) && (obs.get('transect') === JSON.parse($('.location').attr('transect'))) && (obs.get('plot') === JSON.parse($('.location').attr('plot'))) ) {
          htmlOutput += '<li data-theme="c"><a href="#edit-animals-observation" data-transition="slide" class="animals-observation-';
          htmlOutput += obs.get('id');
          htmlOutput += '">';
          htmlOutput += obs.get('title');
          htmlOutput += "</a></li>";
        } else {
          console.log('observation from other group - group ' + obs.get('group_name'));
        }
      });
      $('#animals-observation .header').html(htmlOutput).listview("refresh");

      // create the event listeners for the list of animals observations - must be done in a separate each loop from creating the html
      // (maybe due to the fact that element doesn't exist to have a listener placed on it until after the listview(refresh)?)
      collection.each(function(obs) {
        if ( (obs.get('group_name') === self.user.group) && (obs.get('transect') == $('.location').attr('transect')) && (obs.get('plot') == $('.location').attr('plot')) ) {
          $('#animals-observation .animals-observation-'+obs.get('id')).click(function () {
            $('#edit-animals-observation .title').text(obs.get('title'));
            $('#edit-animals-observation .subcategory').text(obs.get('subcategory'));
            $('#edit-animals-observation .count').text(obs.get('note'));
            $('#edit-animals-observation .note').text(obs.get('count'));
            $('#edit-animals-observation .student-name').text(obs.get('student_name'));
          });
        } else {
          console.log('not adding listener, other group');
        }
      });
    });
    // trigger a reset of the weatherObsCollection
    animalsObsCollection.fetch();
  });


  $('#soil-and-water-observation').live('pagebeforeshow',function(event) {

    // create the list of group observations
    var htmlOutput = '<li data-role="list-divider" role="heading">Soil/Water Observations</li>';
    var soilWaterObsCollection = new rutgers.model.SoilWaterObservations();
    soilWaterObsCollection.on('reset', function(collection) {
   
      // create the HTML for the list of soil/water observations for this group, transect, plot
      collection.each(function(obs) {
        if ( (obs.get('group_name') === self.user.group) && (obs.get('transect') === JSON.parse($('.location').attr('transect'))) && (obs.get('plot') === JSON.parse($('.location').attr('plot'))) ) {
          htmlOutput += '<li data-theme="c"><a href="#edit-soil-and-water-observation" data-transition="slide" class="soil-and-water-observation-';
          htmlOutput += obs.get('id');
          htmlOutput += '">';
          htmlOutput += obs.get('title');
          htmlOutput += "</a></li>";
        } else {
          console.log('observation from other group - group ' + obs.get('group_name'));
        }
      });
      $('#soil-and-water-observation .header').html(htmlOutput).listview("refresh");

      // create the event listeners for the list of observations - must be done in a separate each loop
      // (maybe due to the fact that element doesn't exist to have a listener placed on it until after the listview(refresh)?)
      collection.each(function(obs) {
        if ( (obs.get('group_name') === self.user.group) && (obs.get('transect') == $('.location').attr('transect')) && (obs.get('plot') == $('.location').attr('plot')) ) {
          $('#soil-and-water-observation .soil-and-water-observation-'+obs.get('id')).click(function () {
            $('#edit-soil-and-water-observation .title').text(obs.get('title'));
            $('#edit-soil-and-water-observation .soil-color').text(obs.get('color'));
            $('#edit-soil-and-water-observation .texture').text(obs.get('texture'));
            $('#edit-soil-and-water-observation .organics').text(obs.get('organics'));
            $('#edit-soil-and-water-observation .water').text(obs.get('water'));
            $('#edit-soil-and-water-observation .water-level').text(obs.get('water_level'));
            $('#edit-soil-and-water-observation .note').text(obs.get('note'));
            $('#edit-soil-and-water-observation .student-name').text(obs.get('student_name'));
          });
        } else {
          console.log('not adding listener, other group');
        }
      });
    });
    // trigger a reset of the ObsCollection
    soilWaterObsCollection.fetch();
  });


  $('#weather-observation').live('pagebeforeshow',function(event) {

    // create the list of group observations
    var htmlOutput = '<li data-role="list-divider" role="heading">Weather Observations</li>';
    var weatherObsCollection = new rutgers.model.WeatherObservations();
    weatherObsCollection.on('reset', function(collection) {
   
      // create the HTML for the list of weather observations for this group, transect, plot
      collection.each(function(obs) {
        if ( (obs.get('group_name') === self.user.group) && (obs.get('transect') === JSON.parse($('.location').attr('transect'))) && (obs.get('plot') === JSON.parse($('.location').attr('plot'))) ) {
          htmlOutput += '<li data-theme="c"><a href="#edit-weather-observation" data-transition="slide" class="weather-observation-';
          htmlOutput += obs.get('id');
          htmlOutput += '">';
          htmlOutput += obs.get('title');
          htmlOutput += "</a></li>";
        } else {
          console.log('observation from other group - group ' + obs.get('group_name'));
        }
      });

      $('#weather-observation .header').html(htmlOutput).listview("refresh");

      // create the event listeners for the list of weather observations - must be done in a separate each loop from creating the html
      // (maybe due to the fact that element doesn't exist to have a listener placed on it until after the listview(refresh)?)
      collection.each(function(obs) {
        if ( (obs.get('group_name') === self.user.group) && (obs.get('transect') == $('.location').attr('transect')) && (obs.get('plot') == $('.location').attr('plot')) ) {
          $('#weather-observation .weather-observation-'+obs.get('id')).click(function () {
            var conditionsList = JSON.parse(obs.get('conditions')).join(', ');

            $('#edit-weather-observation .title').text(obs.get('title'));
            $('#edit-weather-observation .conditions').text(conditionsList);
            $('#edit-weather-observation .note').text(obs.get('note'));
            $('#edit-weather-observation .student-name').text(obs.get('student_name'));
          });
        } else {
          console.log('not adding listener, other group');
        }
      });
    });
    // trigger a reset of the weatherObsCollection
    weatherObsCollection.fetch();
  });


/* =============== ADD ================ */


  $('#add-plant-observation').live('pagebeforeshow',function(event) {

    // get form data and submit to DB
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

      self.clearInputs('add-plant-observation');
    });
  });

  $('#add-animal-observation').live('pagebeforeshow',function(event) {
    
    // get form data and submit to DB
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

      self.clearInputs('add-animal-observation');
    });
  });

  $('#add-soil-and-water-observation').live('pagebeforeshow',function(event) {

    // get form data and submit to DB
    jQuery('#add-soil-and-water-observation .submit-button').click(function() {
      var soilWaterObservation = new rutgers.model.SoilWaterObservation();
      var observationTitle = jQuery('#soil-and-water-title-input').val();
      var obserationColor = jQuery('input:radio[name=color-radios]:checked').val();
      var observationTexture = jQuery('input:radio[name=texture-radios]:checked').val();
      var observationOrganics = jQuery('input:radio[name=organics-radios]:checked').val();
      var observationWater =jQuery('input:radio[name=water-radios]:checked').val();
      var observationWaterLevel = jQuery('#soil-and-water-water-input').val();
      var observationNote = jQuery('#soil-and-water-note-input').val();

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

      self.clearInputs('add-soil-and-water-observation');
    });
  });

  $('#add-weather-observation').live('pagebeforeshow',function(event) {

    // get form data and submit to DB    
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

      self.clearInputs('add-weather-observation');
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

    // dummy data:
    // self.transectsAssigned = [2,3];
    // self.plotsCompleted = {2:[1],3:[1,2,3,4,5]};

    $.ajax(self.url + '/users/' + account.login +".json", {
      type: 'get',
      success: function (data) {
        // name does not come from Rollcall
        self.user.name = account.login;
        console.log('name: '+ account.login);        
        self.user.group = data.groups[0].name;
        console.log('group: '+ self.user.group);
        self.transectsAssigned = JSON.parse(data.groups[0].metadata.transects);

        self.plotsCompleted[self.transectsAssigned[0]] = [];
        self.plotsCompleted[self.transectsAssigned[1]] = [];

        console.log('transects: '+ self.transectsAssigned);

        //self.restoreState(); TODO?  sets self.plotsCompleted

        // go to href="#home"
        jQuery('#home .username-display').text(account.login);
        jQuery.mobile.changePage("#home");        
      },
      dataType: 'json'
    });
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


