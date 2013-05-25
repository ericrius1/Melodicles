ml.Game = new Class({
  extend: EventEmitter,

  defaults: $.extend({}, ml.config),

  construct: function(options) {
    that = this;
    this.options = jQuery.extend({}, this.defaults, options);
    this.SCREEN_WIDTH = window.innerWidth;
    this.SCREEN_HEIGHT = window.innerHeight;
    this.pickingData = [];
    this.MARGIN = 0;
    this.numContributors = 100;
    console.log("new game");
    this.init();

  },

  init: function() {

    this.container = document.getElementById("container");

    //******THREE.JS SETUP******

    //CAMERA
    this.camera = new THREE.PerspectiveCamera(70, this.SCREEN_WIDTH / this.SCREEN_HEIGHT, 1, 10000);
    this.camera.position.z = 1000;


    //SCENE
    this.scene = new THREE.Scene();
    this.pickingScene = new THREE.Scene();
    pickingTexture = new THREE.WebGLRenderTarget(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);

    //LIGHTS
    this.scene.add(new THREE.AmbientLight(0x555555));
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
      vertexColors: THREE.VertexColors //Asign colors to each vertex in a geometry
    });

    this.setUpContributors();

    //Sets up scene to be able to use raycasting 
    this.projector = new THREE.Projector();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      clearColor: 0xffffff
    });
    this.renderer.sortObject = false;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.addEventListener('mousemove', this.onMouseMove);

    //Controls
    this.mouse = new THREE.Vector2();
    this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
    this.controls.noZoom = false;
    this.controls.noPan = false;
    this.controls.staticMoving = true;
    this.controls.dynamicDampingFactpr = 0.3;

    this.animate();
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

      //give the pickingGeometry's vertices a color corresponding to the "id"
      var pickingGeometry = new THREE.CubeGeometry(1, 1, 1);
      var pickingColor = new THREE.Color(i);
      this.applyVertexColors(pickingGeometry, pickingColor);

      var pickingCube = new THREE.Mesh(pickingGeometry);
      pickingCube.position.copy(position);

      var drawnObject = new THREE.Mesh(geometry, this.defaultMaterial);
      this.scene.add(drawnObject);
      pickingCube.rotation.copy(rotation);
      pickingCube.scale.copy(scale);

      THREE.GeometryUtils.merge(pickingGeometry, pickingCube);

      this.pickingData[i] = {
        position: position,
        rotation: rotation,
        scale: scale
      };
    }
  },

  applyVertexColors: function(geometry, color) {
    geometry.faces.forEach(function(face) {
      var numVertices = (face instanceof THREE.Face3) ? 3 : 4;
      for (var j = 0; j < numVertices; j++) {
        face.vertexColors[j] = color;
      }
    });

  },

  animate: function() {
    var self = this;
    window.requestAnimationFrame(function() {
      self.animate();
    });
    this.render();
  },

  render: function() {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);

  },

  handleJoin: function(message) {
    console.log("waaah");
  },

  onMouseMove: function(event){
    that.mouse.x = event.clientX;
    that.mouse.y = event.clientY;
    console.log(that.mouse.x);
  }


});