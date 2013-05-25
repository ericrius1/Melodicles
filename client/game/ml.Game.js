ml.Game = new Class({
  extend: EventEmitter,

  defaults: $.extend({}, ml.config),

  construct: function(options) {
    this.options = jQuery.extend({}, this.defaults, options);
    console.log("new game");
    this.init();

    this.SCREEN_WIDTH = window.innerWidth;
    this.SCREEN_HEIGHT = window.innerHeight;
    this.MARGIN = 0;
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

    //LIGHTS

    this.light = new THREE.DirectionalLight (0xffffff);
    this.light.position.set(0.5, 0.5, 1);
    this.scene.add(this.light);

    //RENDERER

    this.renderer = new THREE.WebGLRenderer( {alpha: false});
    this.renderer.setClearColor(0x050505);
    this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);

    this.renderer.domElement.style.position = "absolute";
    this.renderer.domElement.style.top = this.MARGIN + "px";
    this.renderer.domElement.style.left = "0px";

    container.appendChild(this.renderer.domElement);

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