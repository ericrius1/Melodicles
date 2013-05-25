ml.Game = new Class({
  extend: EventEmitter,

  defaults: $.extend({}, ml.config),

  construct: function(options) {
    that = this;
    // this.options = jQuery.extend({}, this.defaults, options);
    // var this.container, this.stats;
    // var this.camera, this.controls, this.scene, this.projector, this.renderer;
    this.objects = [];
    //   this.plane;

    this.mouse = new THREE.Vector2();
    this.offset = new THREE.Vector3();

    this.init();
    this.animate();
  },

  init: function() {

    this.container = document.createElement('div');
    document.body.appendChild(this.container);

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.z = 1000;

    this.scene = new THREE.Scene();

    this.scene.add(new THREE.AmbientLight(0x505050));

    this.light = new THREE.SpotLight(0xffffff, 1.5);
    this.light.position.set(0, 500, 2000);
    this.light.castShadow = true;

    this.light.shadowCameraNear = 200;
    this.light.shadowCameraFar = this.camera.far;
    this.light.shadowCameraFov = 50;

    this.light.shadowBias = -0.00022;
    this.light.shadowDarkness = 0.5;

    this.light.shadowMapWidth = 2048;
    this.light.shadowMapHeight = 2048;

    this.scene.add(this.light);

    var geometry = new THREE.CubeGeometry(40, 40, 40);

    for (var i = 0; i < 200; i++) {

      var object = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
        color: Math.random() * 0xffffff
      }));

      object.material.ambient = object.material.color;

      object.position.x = Math.random() * 1000 - 500;
      object.position.y = Math.random() * 600 - 300;
      object.position.z = Math.random() * 800 - 400;

      object.rotation.x = Math.random() * 2 * Math.PI;
      object.rotation.y = Math.random() * 2 * Math.PI;
      object.rotation.z = Math.random() * 2 * Math.PI;

      object.scale.x = Math.random() * 2 + 1;
      object.scale.y = Math.random() * 2 + 1;
      object.scale.z = Math.random() * 2 + 1;

      object.castShadow = true;
      object.receiveShadow = true;

      this.scene.add(object);

      this.objects.push(object);

    }

    this.plane = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000, 8, 8), new THREE.MeshBasicMaterial({
      color: 0x000000,
      opacity: 0.25,
      transparent: true,
      wireframe: true
    }));
    this.plane.visible = false;
    this.scene.add(this.plane);

    this.projector = new THREE.Projector();

    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.renderer.sortObjects = false;
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapType = THREE.PCFShadowMap;

    this.container.appendChild(this.renderer.domElement);


    this.controls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.panSpeed = 0.8;
    this.controls.noZoom = false;
    this.controls.noPan = false;
    this.controls.staticMoving = true;
    this.controls.dynamicDampingFactor = 0.3;


    var info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '10px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> webgl - draggable cubes';
    this.container.appendChild(info);

    this.stats = new Stats();
    this.stats.domElement.style.position = 'absolute';
    this.stats.domElement.style.top = '0px';
    this.container.appendChild(this.stats.domElement);

    this.renderer.domElement.addEventListener('mousemove', this.onDocumentMouseMove, false);
    this.renderer.domElement.addEventListener('mousedown', this.onDocumentMouseDown, false);
    this.renderer.domElement.addEventListener('mouseup', this.onDocumentMouseUp, false);

    //

    window.addEventListener('resize', this.onWindowResize, false);

  },

  onWindowResize: function() {

    that.camera.aspect = window.innerWidth / window.innerHeight;
    that.camera.updateProjectionMatrix();

    that.renderer.setSize(window.innerWidth, window.innerHeight);

  },

  onDocumentMouseMove: function(event) {

    event.preventDefault();

    that.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    that.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    //

    var vector = new THREE.Vector3(that.mouse.x, that.mouse.y, 0.5);
    that.projector.unprojectVector(vector, that.camera);

    that.raycaster = new THREE.Raycaster(that.camera.position, vector.sub(that.camera.position).normalize());

    if (that.SELECTED) {

      var intersects = that.raycaster.intersectObject(that.plane);
      that.SELECTED.position.copy(intersects[0].point.sub(that.offset));
      return;

    }


    var intersects = that.raycaster.intersectObjects(that.objects);

    if (intersects.length > 0) {

      if (that.INTERSECTED != intersects[0].object) {

        if (that.INTERSECTED) that.INTERSECTED.material.color.setHex(that.INTERSECTED.currentHex);

        that.INTERSECTED = intersects[0].object;
        that.INTERSECTED.currentHex = that.INTERSECTED.material.color.getHex();

        that.plane.position.copy(that.INTERSECTED.position);
        that.plane.lookAt(that.camera.position);

      }

      that.container.style.cursor = 'pointer';

    } else {

      if (that.INTERSECTED) that.INTERSECTED.material.color.setHex(that.INTERSECTED.currentHex);

      that.INTERSECTED = null;

      that.container.style.cursor = 'auto';

    }

  },

  onDocumentMouseDown: function(event) {

    event.preventDefault();

    var vector = new THREE.Vector3(that.mouse.x, that.mouse.y, 0.5);
    that.projector.unprojectVector(vector, that.camera);

    that.raycaster = new THREE.Raycaster(that.camera.position, vector.sub(that.camera.position).normalize());

    var intersects = that.raycaster.intersectObjects(that.objects);

    if (intersects.length > 0) {

      that.controls.enabled = false;

      that.SELECTED = intersects[0].object;

      var intersects = that.raycaster.intersectObject(that.plane);
      that.offset.copy(intersects[0].point).sub(that.plane.position);

      that.container.style.cursor = 'move';

    }

  },

  onDocumentMouseUp: function(event) {

    event.preventDefault();

    that.controls.enabled = true;

    if (that.INTERSECTED) {

      that.plane.position.copy(that.INTERSECTED.position);

      that.SELECTED = null;

    }

    that.container.style.cursor = 'auto';

  },

  //

  animate: function() {
    self = this;
    requestAnimationFrame(function() {
      self.animate;
    });

    this.render();
    this.stats.update();

  },

  render: function() {

    this.controls.update();

    this.renderer.render(this.scene, this.camera);

  },
  handleJoin: function(message) {
    console.log("waaah");
  }
});