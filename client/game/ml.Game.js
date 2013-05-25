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
    this.camera = new THREE.PerspectiveCamera(70, this.SCREEN_WIDTH / this.SCREEN_HEIGHT, 1, 10000);
    this.camera.position.z = 1000;

    //Controls
    this.controls = new THREE.TrackballControls(this.camera);
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
    this.controls.noZoom = false;
    this.controls.noPan = false;
    this.controls.staticMoving = true;
    this.controls.dynamicDampingFactpr = 0.3;


    //SCENE
    this.scene = new THREE.Scene();
    this.pickingScene = new THREE.Scene();
    pickingTexture = new THREE.WebGLRenderTarget(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);

    //LIGHTS
    this.light = new THREE.SpotLight(0xfffffff, 1.5);
    this.light.position.set(0, 500, 2000);
    this.scene.add(this.light);

    //GEOMETRY
    this.gemometry = new THREE.Geometry();
    this.pickingGeometry = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});
    this.defaultMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexXolors});
  },

  applyVertexColors: function(geometry, color){

  },

  handleJoin: function(message){
    console.log("waaah");
  }
});