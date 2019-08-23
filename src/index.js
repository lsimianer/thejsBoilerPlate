import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  MeshStandardMaterial,
  Mesh,
  Color,
  BoxBufferGeometry,
  HemisphereLight,
  DirectionalLight,
  DirectionalLightHelper,
  HemisphereLightHelper,
  FileLoader,
  ShaderMaterial
} from "three";
import OrbitControls from "three-orbitcontrols";

let container;
let scene;
let camera;
let renderer;
let controls;

function init() {
  container = document.querySelector("#container");
  scene = new Scene();
  scene.background = new Color("skyblue");

  createLights();
  createCamera();
  createCube();
  createRenderer();
  createControls();

  renderer.setAnimationLoop(() => {
    update();
    render();
  });
}

function createRenderer() {
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;
  renderer.physicallyCorrectLights = true;

  container.appendChild(renderer.domElement);
}

function createCamera() {
  camera = new PerspectiveCamera(
    35,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(2, 1, 5);
}

function createGeometries() {
  const cube = new BoxBufferGeometry(2, 1, 1);

  return {
    cube
  };
}

function createMaterials() {
  const wireframe = new MeshStandardMaterial({
    wireframe: true
  });

  const standard = new MeshStandardMaterial({
    color: 0xff0000
  });
  standard.color.convertSRGBToLinear();

  return {
    wireframe,
    standard
  };
}

async function createShaderMaterial({ fragmentShaderUrl, vertexShaderUrl }) {
  const fragment = await loadFile(fragmentShaderUrl);
  const vertex = await loadFile(vertexShaderUrl);

  const material = new ShaderMaterial({
    fragmentShader: fragment,
    vertexShader: vertex
  });

  return material;
}

function createLights() {
  const directionalLight = new DirectionalLight(0xffffff, 5);
  directionalLight.position.set(5, 5, 10);

  const directionalLightHelper = new DirectionalLightHelper(
    directionalLight,
    5
  );

  const hemisphereLight = new HemisphereLight(0xddeeff, 0x202020, 3);
  const hemisphereLightHelper = new HemisphereLightHelper(hemisphereLight, 5);
  scene.add(
    directionalLight,
    directionalLightHelper,
    hemisphereLight,
    hemisphereLightHelper
  );
}

function createCube() {
  const geometries = createGeometries();

  /*
   * Uncomment this if you want to use a non-shader material
   */
  // const materials = createMaterials();
  // const mesh = new Mesh(geometries.cube, materials.standard);
  // scene.add(mesh);

  createShaderMaterial({
    fragmentShaderUrl: "/src/shader/fragment.glsl",
    vertexShaderUrl: "/src/shader/vertex.glsl"
  }).then(result => {
    const mesh = new Mesh(geometries.cube, result);
    scene.add(mesh);
  });
}

function createControls() {
  controls = new OrbitControls(camera, renderer.domElement);
}

function loadFile(url) {
  const loader = new FileLoader();

  return new Promise(resolve => {
    loader.load(url, result => {
      resolve(result);
    });
  });
}

function update() {}

function render() {
  renderer.render(scene, camera);
}

init();

function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;

  // Update camera frustum
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
}
window.addEventListener("resize", onWindowResize, false);
