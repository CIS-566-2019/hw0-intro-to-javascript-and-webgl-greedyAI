import {vec3} from 'gl-matrix';
import {vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import Cube from './geometry/Cube';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  tesselations: 1,
  'Load Scene': loadScene, // A function pointer, essentially
  lambertColor: '#ffff00',
  shader: 'Deform',
  shape: 'Cube'
};

let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let prevTesselations: number = 1;

function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'tesselations', 0, 8).step(1);
  gui.add(controls, 'Load Scene');
  gui.addColor(controls, 'lambertColor');
  gui.add(controls, 'shader', ['Lambert', 'Deform']);
  gui.add(controls, 'shape', ['Square', 'Icosphere', 'Cube']);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(0, 0, 5), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const lambert = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const deform = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/deform-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/deform-frag.glsl')),
  ]);

  let startTime: number = Date.now();

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    if(controls.tesselations != prevTesselations)
    {
      prevTesselations = controls.tesselations;
      icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, prevTesselations);
      icosphere.create();
    }
    if (!controls.shader.localeCompare("Lambert")) {
      let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(controls.lambertColor);
      if (!controls.shape.localeCompare("Square")) {
        renderer.render(camera, lambert, 
          vec4.fromValues(parseInt(result[1], 16) / 255.0, 
                          parseInt(result[2], 16) / 255.0, 
                          parseInt(result[3], 16) / 255.0, 
                          1), Date.now() - startTime, [square]);
      } else if (!controls.shape.localeCompare("Icosphere")) {
        renderer.render(camera, lambert, 
          vec4.fromValues(parseInt(result[1], 16) / 255.0, 
                          parseInt(result[2], 16) / 255.0, 
                          parseInt(result[3], 16) / 255.0, 
                          1), Date.now() - startTime, [icosphere]);
      } else {
        renderer.render(camera, lambert, 
          vec4.fromValues(parseInt(result[1], 16) / 255.0, 
                          parseInt(result[2], 16) / 255.0, 
                          parseInt(result[3], 16) / 255.0, 
                          1), Date.now() - startTime, [cube]);
      }
    } else {
      if (!controls.shape.localeCompare("Square")) {
        renderer.render(camera, deform, vec4.fromValues(0, 0, 0, 1), Date.now() - startTime, [square]);
      } else if (!controls.shape.localeCompare("Icosphere")) {
        renderer.render(camera, deform, vec4.fromValues(0, 0, 0, 1), Date.now() - startTime, [icosphere]);
      } else {
        renderer.render(camera, deform, vec4.fromValues(0, 0, 0, 1), Date.now() - startTime, [cube]);
      }
    }
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  // Start the render loop
  tick();
}

main();
