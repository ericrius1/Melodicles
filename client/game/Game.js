Game = function(){
    if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

      var MARGIN = 100;

      var SCREEN_WIDTH = window.innerWidth;
      var SCREEN_HEIGHT = window.innerHeight - 2 * MARGIN;

      var renderer, container, stats;

      var camera, scene;
      var cameraOrtho, sceneRenderTarget;

      var uniformsNoise, uniformsNormal,
        heightMap, normalMap,
        quadTarget;

      var directionalLight, pointLight;

      var terrain;

      var textureCounter = 0;

      var animDelta = 0, animDeltaDir = -1;
      var lightVal = 0, lightDir = 1;
      var soundVal = 0, oldSoundVal = 0, soundDir = 1;

      var clock = new THREE.Clock();

      var morph, morphs = [];

      var updateNoise = true;

      var animateTerrain = false;

      var textMesh1;

      var mlib = {};

      init();
      animate();

      function init() {

        container = document.getElementById( 'container' );

        soundtrack = document.getElementById( "soundtrack" );

        // SCENE (RENDER TARGET)

        sceneRenderTarget = new THREE.Scene();

        cameraOrtho = new THREE.OrthographicCamera( SCREEN_WIDTH / - 2, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, SCREEN_HEIGHT / - 2, -10000, 10000 );
        cameraOrtho.position.z = 100;

        sceneRenderTarget.add( cameraOrtho );

        // CAMERA

        camera = new THREE.PerspectiveCamera( 40, SCREEN_WIDTH / SCREEN_HEIGHT, 2, 4000 );
        camera.position.set( -1200, 800, 1200 );

        controls = new THREE.TrackballControls( camera );
        controls.target.set( 0, 0, 0 );

        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 1.2;
        controls.panSpeed = 0.8;

        controls.noZoom = false;
        controls.noPan = false;

        controls.staticMoving = false;
        controls.dynamicDampingFactor = 0.15;

        controls.keys = [ 65, 83, 68 ];

        // SCENE (FINAL)

        scene = new THREE.Scene();
        scene.fog = new THREE.Fog( 0x050505, 2000, 4000 );

        // LIGHTS

        scene.add( new THREE.AmbientLight( 0x111111 ) );

        directionalLight = new THREE.DirectionalLight( 0xffffff, 1.15 );
        directionalLight.position.set( 500, 2000, 0 );
        scene.add( directionalLight );

        pointLight = new THREE.PointLight( 0xff4400, 1.5 );
        pointLight.position.set( 0, 0, 0 );
        scene.add( pointLight );


        // HEIGHT + NORMAL MAPS

        var normalShader = THREE.NormalMapShader;

        var rx = 256, ry = 256;
        var pars = { minFilter: THREE.LinearMipmapLinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };

        heightMap  = new THREE.WebGLRenderTarget( rx, ry, pars );
        normalMap = new THREE.WebGLRenderTarget( rx, ry, pars );

        uniformsNoise = {

          time:   { type: "f", value: 1.0 },
          scale:  { type: "v2", value: new THREE.Vector2( 1.5, 1.5 ) },
          offset: { type: "v2", value: new THREE.Vector2( 0, 0 ) }

        };

        uniformsNormal = THREE.UniformsUtils.clone( normalShader.uniforms );

        uniformsNormal.height.value = 0.05;
        uniformsNormal.resolution.value.set( rx, ry );
        uniformsNormal.heightMap.value = heightMap;

        var vertexShader = document.getElementById( 'vertexShader' ).textContent;

        // TEXTURES

        var specularMap = new THREE.WebGLRenderTarget( 2048, 2048, pars );

        var diffuseTexture1 = THREE.ImageUtils.loadTexture( "client/lib/textures/grasslight-big.jpg", null, function () {

          loadTextures();
          applyShader( THREE.LuminosityShader, diffuseTexture1, specularMap );

        } );

        var diffuseTexture2 = THREE.ImageUtils.loadTexture( "client/lib/textures/backgrounddetailed6.jpg", null, loadTextures );
        var detailTexture = THREE.ImageUtils.loadTexture( "client/lib/textures/grasslight-big-nm.jpg", null, loadTextures );

        diffuseTexture1.wrapS = diffuseTexture1.wrapT = THREE.RepeatWrapping;
        diffuseTexture2.wrapS = diffuseTexture2.wrapT = THREE.RepeatWrapping;
        detailTexture.wrapS = detailTexture.wrapT = THREE.RepeatWrapping;
        specularMap.wrapS = specularMap.wrapT = THREE.RepeatWrapping;

        // TERRAIN SHADER

        var terrainShader = THREE.ShaderTerrain[ "terrain" ];

        uniformsTerrain = THREE.UniformsUtils.clone( terrainShader.uniforms );

        uniformsTerrain[ "tNormal" ].value = normalMap;
        uniformsTerrain[ "uNormalScale" ].value = 3.5;

        uniformsTerrain[ "tDisplacement" ].value = heightMap;

        uniformsTerrain[ "tDiffuse1" ].value = diffuseTexture1;
        uniformsTerrain[ "tDiffuse2" ].value = diffuseTexture2;
        uniformsTerrain[ "tSpecular" ].value = specularMap;
        uniformsTerrain[ "tDetail" ].value = detailTexture;

        uniformsTerrain[ "enableDiffuse1" ].value = true;
        uniformsTerrain[ "enableDiffuse2" ].value = true;
        uniformsTerrain[ "enableSpecular" ].value = true;

        uniformsTerrain[ "uDiffuseColor" ].value.setHex( 0xffffff );
        uniformsTerrain[ "uSpecularColor" ].value.setHex( 0xffffff );
        uniformsTerrain[ "uAmbientColor" ].value.setHex( 0x111111 );

        uniformsTerrain[ "uShininess" ].value = 30;

        uniformsTerrain[ "uDisplacementScale" ].value = 375;

        uniformsTerrain[ "uRepeatOverlay" ].value.set( 6, 6 );

        var params = [
                [ 'heightmap',  document.getElementById( 'fragmentShaderNoise' ).textContent,   vertexShader, uniformsNoise, false ],
                [ 'normal',   normalShader.fragmentShader,  normalShader.vertexShader, uniformsNormal, false ],
                [ 'terrain',  terrainShader.fragmentShader, terrainShader.vertexShader, uniformsTerrain, true ]
               ];

        for( var i = 0; i < params.length; i ++ ) {

          material = new THREE.ShaderMaterial( {

            uniforms:     params[ i ][ 3 ],
            vertexShader:   params[ i ][ 2 ],
            fragmentShader: params[ i ][ 1 ],
            lights:     params[ i ][ 4 ],
            fog:      true
            } );

          mlib[ params[ i ][ 0 ] ] = material;

        }


        var plane = new THREE.PlaneGeometry( SCREEN_WIDTH, SCREEN_HEIGHT );

        quadTarget = new THREE.Mesh( plane, new THREE.MeshBasicMaterial( { color: 0x000000 } ) );
        quadTarget.position.z = -500;
        sceneRenderTarget.add( quadTarget );

        // TERRAIN MESH

        var geometryTerrain = new THREE.PlaneGeometry( 6000, 6000, 256, 256 );

        geometryTerrain.computeFaceNormals();
        geometryTerrain.computeVertexNormals();
        geometryTerrain.computeTangents();

        terrain = new THREE.Mesh( geometryTerrain, mlib[ "terrain" ] );
        terrain.position.set( 0, -125, 0 );
        terrain.rotation.x = -Math.PI / 2;
        terrain.visible = false;
        scene.add( terrain );

        // RENDERER

        renderer = new THREE.WebGLRenderer();
        renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
        renderer.setClearColor( scene.fog.color, 1 );

        renderer.domElement.style.position = "absolute";
        renderer.domElement.style.top = MARGIN + "px";
        renderer.domElement.style.left = "0px";

        container.appendChild( renderer.domElement );

        //

        renderer.gammaInput = true;
        renderer.gammaOutput = true;


        // STATS

        stats = new Stats();
        container.appendChild( stats.domElement );

        // EVENTS

        onWindowResize();

        window.addEventListener( 'resize', onWindowResize, false );

        document.addEventListener( 'keydown', onKeyDown, false );

        // COMPOSER

        renderer.autoClear = false;

        renderTargetParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false };
        renderTarget = new THREE.WebGLRenderTarget( SCREEN_WIDTH, SCREEN_HEIGHT, renderTargetParameters );

        effectBloom = new THREE.BloomPass( 0.6 );
        var effectBleach = new THREE.ShaderPass( THREE.BleachBypassShader );

        hblur = new THREE.ShaderPass( THREE.HorizontalTiltShiftShader );
        vblur = new THREE.ShaderPass( THREE.VerticalTiltShiftShader );

        var bluriness = 6;

        hblur.uniforms[ 'h' ].value = bluriness / SCREEN_WIDTH;
        vblur.uniforms[ 'v' ].value = bluriness / SCREEN_HEIGHT;

        hblur.uniforms[ 'r' ].value = vblur.uniforms[ 'r' ].value = 0.5;

        effectBleach.uniforms[ 'opacity' ].value = 0.65;

        composer = new THREE.EffectComposer( renderer, renderTarget );

        var renderModel = new THREE.RenderPass( scene, camera );

        vblur.renderToScreen = true;

        composer = new THREE.EffectComposer( renderer, renderTarget );

        composer.addPass( renderModel );

        composer.addPass( effectBloom );
        //composer.addPass( effectBleach );

        composer.addPass( hblur );
        composer.addPass( vblur );

        // MORPHS

        function addMorph( geometry, speed, duration, x, y, z ) {

          var material = new THREE.MeshLambertMaterial( { color: 0xffaa55, morphTargets: true, vertexColors: THREE.FaceColors } );

          var meshAnim = new THREE.MorphAnimMesh( geometry, material );

          meshAnim.speed = speed;
          meshAnim.duration = duration;
          meshAnim.time = 600 * Math.random();

          meshAnim.position.set( x, y, z );
          meshAnim.rotation.y = Math.PI/2;

          meshAnim.castShadow = true;
          meshAnim.receiveShadow = false;

          scene.add( meshAnim );

          morphs.push( meshAnim );

          renderer.initWebGLObjects( scene );

        }

        function morphColorsToFaceColors( geometry ) {

          if ( geometry.morphColors && geometry.morphColors.length ) {

            var colorMap = geometry.morphColors[ 0 ];

            for ( var i = 0; i < colorMap.colors.length; i ++ ) {

              geometry.faces[ i ].color = colorMap.colors[ i ];

            }

          }

        }

        var loader = new THREE.JSONLoader();

        var startX = -3000;

        loader.load( "models/animated/parrot.js", function( geometry ) {

          morphColorsToFaceColors( geometry );
          addMorph( geometry, 250, 500, startX -500, 500, 700 );
          addMorph( geometry, 250, 500, startX - Math.random() * 500, 500, -200 );
          addMorph( geometry, 250, 500, startX - Math.random() * 500, 500, 200 );
          addMorph( geometry, 250, 500, startX - Math.random() * 500, 500, 1000 );

        } );

        loader.load( "models/animated/flamingo.js", function( geometry ) {

          morphColorsToFaceColors( geometry );
          addMorph( geometry, 500, 1000, startX - Math.random() * 500, 350, 40 );

        } );

        loader.load( "models/animated/stork.js", function( geometry ) {

          morphColorsToFaceColors( geometry );
          addMorph( geometry, 350, 1000, startX - Math.random() * 500, 350, 340 );

        } );

        // PRE-INIT

        renderer.initWebGLObjects( scene );

      }

      //

      function onWindowResize( event ) {

        SCREEN_WIDTH = window.innerWidth;
        SCREEN_HEIGHT = window.innerHeight - 2 * MARGIN;

        renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

        camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
        camera.updateProjectionMatrix();

      }

      //

      function onKeyDown ( event ) {

        switch( event.keyCode ) {

          case 78: /*N*/  lightDir *= -1; break;
          case 77: /*M*/  animDeltaDir *= -1; break;
          case 66: /*B*/  soundDir *= -1; break;

        }

      };

      //

      function applyShader( shader, texture, target ) {

        var shaderMaterial = new THREE.ShaderMaterial( {

          fragmentShader: shader.fragmentShader,
          vertexShader: shader.vertexShader,
          uniforms: THREE.UniformsUtils.clone( shader.uniforms )

        } );

        shaderMaterial.uniforms[ "tDiffuse" ].value = texture;

        var sceneTmp = new THREE.Scene();

        var meshTmp = new THREE.Mesh( new THREE.PlaneGeometry( SCREEN_WIDTH, SCREEN_HEIGHT ), shaderMaterial );
        meshTmp.position.z = -500;

        sceneTmp.add( meshTmp );

        renderer.render( sceneTmp, cameraOrtho, target, true );

      };

      //

      function loadTextures() {

        textureCounter += 1;

        if ( textureCounter == 3 )  {

          terrain.visible = true;

          document.getElementById( "loading" ).style.display = "none";

        }

      }

      //

      function animate() {

        requestAnimationFrame( animate );

        render();
        stats.update();

      }

      function render() {

        var delta = clock.getDelta();

        soundVal = THREE.Math.clamp( soundVal + delta * soundDir, 0, 1 );

        if ( soundVal !== oldSoundVal ) {

          if ( soundtrack ) {

            soundtrack.volume = soundVal;
            oldSoundVal = soundVal;

          }

        }

        if ( terrain.visible ) {

          controls.update();

          var time = Date.now() * 0.001;

          var fLow = 0.1, fHigh = 0.8;

          lightVal = THREE.Math.clamp( lightVal + 0.5 * delta * lightDir, fLow, fHigh );

          var valNorm = ( lightVal - fLow ) / ( fHigh - fLow );

          scene.fog.color.setHSL( 0.1, 0.5, lightVal );

          renderer.setClearColor( scene.fog.color, 1 );

          directionalLight.intensity = THREE.Math.mapLinear( valNorm, 0, 1, 0.1, 1.15 );
          pointLight.intensity = THREE.Math.mapLinear( valNorm, 0, 1, 0.9, 1.5 );

          uniformsTerrain[ "uNormalScale" ].value = THREE.Math.mapLinear( valNorm, 0, 1, 0.6, 3.5 );

          if ( updateNoise ) {

            animDelta = THREE.Math.clamp( animDelta + 0.00075 * animDeltaDir, 0, 0.05 );
            uniformsNoise[ "time" ].value += delta * animDelta;

            uniformsNoise[ "offset" ].value.x += delta * 0.05;

            uniformsTerrain[ "uOffset" ].value.x = 4 * uniformsNoise[ "offset" ].value.x;

            quadTarget.material = mlib[ "heightmap" ];
            renderer.render( sceneRenderTarget, cameraOrtho, heightMap, true );

            quadTarget.material = mlib[ "normal" ];
            renderer.render( sceneRenderTarget, cameraOrtho, normalMap, true );

            //updateNoise = false;

          }


          for ( var i = 0; i < morphs.length; i ++ ) {

            morph = morphs[ i ];

            morph.updateAnimation( 1000 * delta );

            morph.position.x += morph.speed * delta;

            if ( morph.position.x  > 2000 )  {

              morph.position.x = -1500 - Math.random() * 500;

            }


          }

          //renderer.render( scene, camera );
          composer.render( 0.1 );

        }

      }
}