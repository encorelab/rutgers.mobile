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

  //var CURRENT_DB = "http://rollcall.badger.encorelab.org";

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


  /* =================================== PAGE INITS ========================================= */


  $('#home').live('pagebeforeshow', function(event) {

    // assign transects, add the class, add text to the accordions
    $('#home .first-transect-group').addClass('transect-' + self.transectsAssigned[0]);
    $('#home .first-transect-group').attr('value', self.transectsAssigned[0]);
    $('#home.accordion-header').text('Transect ' + self.transectsAssigned[0]);      // TODO add [done] or [not done] here
    $('#home .second-transect-group').addClass('transect-' + self.transectsAssigned[1]);
    $('#home .second-transect-group').attr('value', self.transectsAssigned[1]);
    $('#home.accordion-header').text('Transect ' + self.transectsAssigned[1]);      // TODO add [done] or [not done] here


    // CLOSE BUT CUTTABLE
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
    // when a button is clicked, add the relevent plot and transect to headers etc on all subsequent pages
    $('.plot-button').click(function(){
      $('.header-title').text("Plot " + $(this).attr('value'));
      $('.back-button').text("Back to Plot " + $(this).attr('value'));
      $('.location').text("Transect " + $(this).parent().parent().attr('value') + ", Plot " + $(this).attr('value'));
      $('.location').attr('transect', $(this).parent().parent().attr('value'));
      $('.location').attr('plot', $(this).attr('value'));
    });
  });


  $('#plot-overview').live('pagebeforeshow',function(event) {
    // .done-button event?
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


  $('#weather-observation').live('pagebeforeshow',function(event) {

    // create the list of group observations (currently does)
    var htmlOutput = '<li data-role="list-divider" role="heading">Weather Observations</li>';
    var weatherObsCollection = new rutgers.model.WeatherObservations();
    weatherObsCollection.on('reset', function(collection) {

      // might be better to do this with obs.id instead of i and j. Can the observations get reordered
   
      // create the HTML for the list of weather observations
      collection.each(function(obs) {
        if (obs.get('group_name') === self.user.group) {
          htmlOutput += '<li data-theme="c"><a href="#edit-weather-observation" data-transition="slide" class="weather-observation-';
          htmlOutput += obs.get('id');
          htmlOutput += '">';
          htmlOutput += obs.get('title');
          htmlOutput += "</a></li>";
        } else {
          console.log('observation from other group - group ' + obs.get('group_name'));
        }
      });
      htmlOutput += "</ul>";
      $('#weather-observation .header').html(htmlOutput).listview("refresh");

      // create the event listeners for the list of weather robservations - must be done in a separate each loop
      // (maybe due to the fact that element doesn't exist to have a listener placed on it until after the listview(refresh)?)
      collection.each(function(obs) {
        if (obs.get('group_name') === self.user.group) {
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
      var observationTitle = jQuery('#soilwater-title-input').val();
      var obserationColor = jQuery('input:radio[name=color-radios]:checked').val();
      var observationTexture = jQuery('input:radio[name=texture-radios]:checked').val();
      var observationOrganics = jQuery('input:radio[name=organics-radios]:checked').val();
      var observationWater =jQuery('input:radio[name=water-radios]:checked').val();
      var observationWaterLevel = jQuery('soilwater-water-input').val();
      var observationNote = jQuery('#soilwater-note-input').val();

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
    self.plotsCompleted = {2:[1],3:[1,2,3,4,5]};

    $.ajax("http://rollcall.badger.encorelab.org/users/"+ account.login +".json", {
      type: 'get',
      success: function (data) {
        // name does not come from Rollcall
        self.user.name = account.login;
        console.log('name: '+ account.login);        
        self.user.group = data.groups[0].name;
        console.log('group: '+ self.user.group);
        self.transectsAssigned = JSON.parse(data.groups[0].metadata.transects);
        console.log('transects: '+ self.transectsAssigned);

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


