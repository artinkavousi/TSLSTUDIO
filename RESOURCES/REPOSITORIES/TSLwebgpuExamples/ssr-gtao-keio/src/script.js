import * as THREE from 'three';
import { Fn, If, uniform, float, color, uv, vec2, vec3, hash, sin, length, oneMinus, time, instancedArray, instanceIndex, mrt, pass, output, directionToColor, colorToDirection, normalView, metalness, roughness, sample, blendColor, positionLocal, mix, mod, floor } from 'three/tsl';

import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

import { ao } from 'three/addons/tsl/display/GTAONode.js';
import { ssr } from 'three/addons/tsl/display/SSRNode.js';
import { smaa } from 'three/addons/tsl/display/SMAANode.js';

import Stats from 'three/addons/libs/stats.module.js';

let camera, scene, renderer;
let postProcessing, aoPass, ssrPass;
let controls, stats;

init();

function init() {

  const { innerWidth, innerHeight } = window;

  camera = new THREE.PerspectiveCamera( 50, innerWidth / innerHeight, 0.1, 100 );
  camera.position.set( 5, 8, 6 );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 1, 1, 1 );
  
  //
  
  const geometry = new RoundedBoxGeometry( 1, 3, 1, 2, 0.05 );
  
  for ( let z = - 10; z < 10; z ++ ) {

    for ( let x = - 10; x < 10; x ++ ) {

      const material = new THREE.MeshPhysicalMaterial( { color: 0xffffff * Math.random(), metalness: 0.15, roughness: 0.2 } );
      
      /*
      if ( Math.random() > 0.5 ) {
        material.roughness = 0.5;
        material.transmission = 1;
      }
      */

      const mesh = new THREE.Mesh( geometry, material );
      mesh.userData.offset = Math.random() * Math.PI * 2;
      mesh.position.x = x;
      mesh.position.y = Math.sin( mesh.userData.offset );
      mesh.position.z = z;
      scene.add( mesh );

    }


  }

  //

  renderer = new THREE.WebGPURenderer( { antialias: false } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setAnimationLoop( animate );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  document.body.appendChild( renderer.domElement );

  stats = new Stats();
  document.body.appendChild( stats.dom );
  
  //
  
  const environment = new RoomEnvironment();
  const pmremGenerator = new THREE.PMREMGenerator( renderer );

  scene.environment = pmremGenerator.fromScene( environment ).texture;
  pmremGenerator.dispose();
  
  //
  
  postProcessing = new THREE.PostProcessing( renderer );

	const scenePass = pass( scene, camera, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter } );
			scenePass.setMRT( mrt( {
				output: output,
				normal: directionToColor( normalView ),
				metalrough: vec2( metalness, roughness )
			} ) );
  
  const scenePassColor = scenePass.getTextureNode( 'output' );
	const scenePassNormal = scenePass.getTextureNode( 'normal' );
	const scenePassDepth = scenePass.getTextureNode( 'depth' );
	const scenePassMetalRough = scenePass.getTextureNode( 'metalrough' );
  
  // optional: optimize bandwidth by reducing the texture precision for normals and metal/roughness

  // const normalTexture = scenePass.getTexture( 'normal' );
  // normalTexture.type = THREE.UnsignedByteType;

  // const metalRoughTexture = scenePass.getTexture( 'metalrough' );
  // metalRoughTexture.type = THREE.UnsignedByteType;

  const sceneNormal = sample( ( uv ) => {

    return colorToDirection( scenePassNormal.sample( uv ) );

  } );
  
  ssrPass = ssr( scenePassColor, scenePassDepth, sceneNormal, scenePassMetalRough.r, scenePassMetalRough.g );
  ssrPass.maxDistance.value = 10;
  ssrPass.blurQuality.value = 1;
	ssrPass.thickness.value = 0.015;
	ssrPass.resolutionScale = 0.5;
  
  aoPass = ao( scenePassDepth, sceneNormal, camera );
  aoPass.radius = 1;
  aoPass.scale = 1;
  aoPass.thickness = 1;

  const blendPassAO = aoPass.getTextureNode().mul( scenePassColor );

  const outputNode = smaa( blendColor( blendPassAO, ssrPass ) );

	postProcessing.outputNode = outputNode;

  //

  controls = new OrbitControls( camera, renderer.domElement );
  controls.enableDamping = true;
  controls.target.set( 0, 0, 0 );
  controls.update();

  //

  window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

  const { innerWidth, innerHeight } = window;

  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( innerWidth, innerHeight );

}

async function animate( time ) {

  stats.update();

  controls.update();
  
  scene.traverse( function ( mesh ) {
    
    if ( mesh.userData.offset === undefined ) return;
    
    mesh.position.y = Math.sin( ( time / 1000 ) + mesh.userData.offset );
    
  } );
  
  // await renderer.renderAsync( scene, camera );
  postProcessing.render();

}