ml.Game = new Class({
  extend: EventEmitter,

  defaults: $.extend({}, ml.config),

  construct: function(options) {
    this.options = jQuery.extend({}, this.defaults, options);
    console.log("new game");
    this.init();

    this.SCREEN_WIDTH = window.innerWidth;
    this.SCREEN_HEIGHT = window.innerHeight;
  },

  init: function() {

    container = document.createElement('div');
    document.body.appendChild(container);


    //******THREE.JS SETUP******

    //CAMERA
    this.camera = new THREE.PerspectiveCamera(45, this.SCREEN_WIDTH / this.SCREEN_HEIGHT, 1, 10000);
    this.camera.position.set(-500, 500, 1500);

    //SCENE
    this.scene = new THREE.Scene();

    this.comm = new ml.Comm({
      server: this.options.comm.server
    });
    console.log("test")
    this.comm.on('join', this.handleJoin);
    this.comm.connected();
  },

  handleJoin: function(message){
    console.log("waaah");
  }
});