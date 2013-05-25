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
    this.numContributors = 100;
  },

  init: function() {

    this.container = document.createElement('div');
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
    this.pickingGeometry = new THREE.MeshBasicMaterial({
      vertexColors: THREE.VertexColors
    });
    this.defaultMaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      shading: THREE.FlatShading,
      vertexColors: THREE.VertexXolors
    });

    this.setUpContributors();

    //Sets up scene to be able to use raycasting 
    this.projector = new THREE.Projector();

    this.renderer = new THREE.WebGLRenderer({antialias: true, clearColor: 0xffffff});
    this.renderer.sortObject = false;
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.container.appendChild(this.renderer.domElement);
  },

  setUpContributors: function() {
    var numContributors = this.numContributors;
    for (var i = 0; i < numContributors; i++) {
      var position = new THREE.Vector3();

      position.x = Math.random() * 10000 - 5000;
      position.y = Math.random() * 6000 - 3000;
      position.z = Math.random() * 8000 - 4000;

      var rotation = new THREE.Vector3();

      rotation.x = Math.random() * 2 * Math.PI;
      rotation.y = Math.random() * 2 * Math.PI;
      rotation.z = Math.random() * 2 * Math.PI;

      var scale = new THREE.Vector3();

      scale.x = Math.random() * 200 + 100;
      scale.y = Math.random() * 200 + 100;
      scale.z = Math.random() * 200 + 100;

      var geometry = new THREE.CubeGeometry(1, 1, 1);
      var color = new THREE.Color(Math.random() * 0xffffff);
      this.applyVertexColors(geometry, color);
      var cube = new THREE.Mesh(geometry);
      cube.position.copy(position);
      cube.rotation.copy(rotation);
      cube.scale.copy(scale);

      //Important optimization to limit data exchange between cpu and gpu
      THREE.GeometryUtils.merge(geometry, cube);

      var drawnObject = new THREE.Mesh(geometry, this.defaultMaterial);
      this.scene.add(drawnObject);

    }
  },

  applyVertexColors: function(geometry, color) {
    geometry.faces.forEach(function(face){
      var numVertices = (face instanceof THREE.Face3) ? 3 : 4;
      for(var j = 0; j < numVertices; j++){
        face.vertexColors[j] = color;
      }
    });

  },

  handleJoin: function(message) {
    console.log("waaah");
  }
});