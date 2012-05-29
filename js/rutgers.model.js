/*jshint browser: true, devel: true */
/*global Backbone, _, jQuery, Camera, FileTransfer, FileUploadOptions */

(function(rutgers) {
  var model = {};

  model.baseURL = "http://backend.rutgers.badger.encorelab.org";
  //model.baseURL = "http://localhost:3000";

  jQuery.support.cors = true; // enable cross-domain AJAX requests

  /**
* Does recursive magic on the given 'attrs' object, renaming
* each property given in 'nested' array from "myprop" to "myprop_attributes".
* This is done to make Rails' accepts_nested_attributes_for happy.
**/
  function wrapNested(nested, attrs) {
    _.each(nested, function (k) {
      if (k instanceof Array) {
        if (attrs[k[0]]) wrapNested(k[1], attrs[k[0]]);
        k = k[0];
      }

      if (attrs[k]) {
        attrs[k+"_attributes"] = attrs[k];
        delete attrs[k];
      }
    });
  }

  var Base = Backbone.Model.extend({
    initialize: function (attributes, options) {
      this.bind("error", this.defaultErrorHandler);
    },
    toJSON: function() {
      var attrs = _.clone( this.attributes );
      
      wrapNested(this.nested, attrs);

      var wrap = {};
      wrap[this.singular] = attrs;
      return wrap;
    },
    url: function () {
      var base = model.baseURL + '/' + this.plural;
      if (this.isNew())
        return base + '.json';
      else
        return base + '/' + this.id + '.json';
    },
    defaultErrorHandler: function (model, response, opts) {
      console.error("Error on "+this.singular+" model: ", model, response);
      
      var msg;

      if (response.status === 422) {
        msg = "Sorry, there is an error in your "+this.singular+". Please check your input and try again.";
        var errors = {};
        try {
          errors = JSON.parse(response.responseText).errors;
        } catch (err) {
          console.error("Couldn't parse response text: "+response.responseText+ " ("+err+")");
        }
        _.each(errors, function(v, k) {
          var errField = jQuery("*[name='"+k+"'].field");

          if (errField.is(':checkbox, :radio'))
            errField = errField.parent();

          errField.addClass("error");
          errField.one('change focus', function() {
            errField.removeClass("error");
          });
        });

      } else if (response.status >= 500 && response.status < 600)
        msg = "Our apologies, the server responded with an error. There may be a problem with the system.";
      else
        msg = "Sorry, there was some sort of error while performing this action. The server may be temporarily unavailable.";

      alert(msg, "Error");
    }
  });


  /*** Observation ***/

  // abstract parent model of all *Observation models; all common functionality (like photo attachments) should go here
  var Observation = Base.extend({

    captureFromCamera: function () {
      this.capture(Camera.PictureSourceType.CAMERA);
    },

    captureFromGallery: function () {
      this.capture(Camera.PictureSourceType.PHOTOLIBRARY);
    },

    capture: function (from) {
      var obs = this;
      var options = {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: from
      };

      console.log('Capturing photo from source '+from+' with options: ', options);
      navigator.camera.getPicture(
        function (imageURL) {
          obs.imageURL = imageURL;
          obs.trigger('image_capture', imageURL);
        },
        function (error) {
          console.error("Image capture failed: " + error);
          alert("Image capture failed: " + error);
          obs.trigger('image_capture_error', error);
        },
        options
      );
    },

    upload: function () {
      var obs = this;

      if (!obs.imageURL)
        throw new Error("Cannot upload photo because it does not have an imageURL! You need to capture an image before uploading.");

      console.log("Uploading photo: "+obs.imageURL)

      var options = new FileUploadOptions();
      options.fileKey = "photo[image]";
      options.fileName = obs.imageURL.substr(obs.imageURL.lastIndexOf('/')+1);
      options.mimeType = "image/jpeg";

      var success = function (res) {
        console.log("Image uploaded successfully; "+res.bytesSent+" bytes sent.");
        
        res.obs = JSON.parse(res.response);
        obs.set('id', res.obs.id);

        console.log("Assigned id to obs: "+obs.id);

        obs.trigger('image_upload', res);
      };

      var failure = function (error) {
        console.error("Image upload failed: " + error);
        obs.trigger('image_upload_error', error);
      };

      var transfer = new FileTransfer();
      transfer.upload(obs.imageURL, obs.url(), success, failure, options);
    }
  });

    /*** AnimalsObservation ***/

  model.AnimalsObservation = Observation.extend({
    singular: "animals_observation",
    plural: "animals_observations",
    nested: [], /* don't need this for now but leaving it in case we need it later */
  });

  model.AnimalsObservations = Backbone.Collection.extend({
      model: model.AnimalsObservation,
      url: model.baseURL + '/animals_observations.json'
  });  

    /*** PlantsObservation ***/

  model.PlantsObservation = Observation.extend({
    singular: "plants_observation",
    plural: "plants_observations",
    nested: [], /* don't need this for now but leaving it in case we need it later */
  });

  model.PlantsObservations = Backbone.Collection.extend({
      model: model.PlantsObservation,
      url: model.baseURL + '/plants_observations.json'
  });

    /*** SoilWaterObservation ***/

  model.SoilWaterObservation = Observation.extend({
    singular: "soil_water_observation",
    plural: "soil_water_observations",
    nested: [], /* don't need this for now but leaving it in case we need it later */
  });

  model.SoilWaterObservations = Backbone.Collection.extend({
      model: model.SoilWaterObservation,
      url: model.baseURL + '/soil_water_observations.json'
  });

  /*** WeatherObservation ***/

  model.WeatherObservation = Observation.extend({
    singular: "weather_observation",
    plural: "weather_observations",
    nested: [], /* don't need this for now but leaving it in case we need it later */
  });

  model.WeatherObservations = Backbone.Collection.extend({
      model: model.WeatherObservation,
      url: model.baseURL + '/weather_observations.json'
  });

  model.Observation = Observation;
  rutgers.model = model;
})(window.rutgers);