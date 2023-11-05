import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "dat.gui";
import data from "./data.json";

let scene, camera, renderer, controls;

const settings = {
  timeSpeed: 0.1,
};
const scaleRatio = 100000;
const plantRatio = 40;

scene = new THREE.Scene();

const winWidth = window.innerWidth;
const winHeight = window.innerHeight;
const aspectRation = winWidth / winHeight;
camera = new THREE.PerspectiveCamera(75, aspectRation, 0.1, 1000000);

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.physicallyCorrectLights = true;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

controls = new OrbitControls(camera, renderer.domElement);

const addSphere = (radius, color, p) => {
  let scaleRadius = radius / plantRatio <= 50 ? 50 : radius / plantRatio;

  const sphereGeometry = new THREE.SphereGeometry(scaleRadius, 50, 50);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: color });
  const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

  const pos = p?.x / scaleRatio;
  scene.add(sphereMesh);
  sphereMesh.position.x = pos;

  const orbitPath = new THREE.Path().absarc(0, 0, pos, 0, Math.PI * 2);
  const orbitPoints = orbitPath.getPoints(90);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.MeshBasicMaterial({ color: "blue" });
  const orbitMesh = new THREE.Line(orbitGeometry, orbitMaterial);
  scene.add(orbitMesh);

  return sphereMesh;
};

const planets = data.planets;

let planetsRef = [];

planets.map((planet) => {
  const { radius_km, semi_major_axis_km, color } = planet;
  const newPlanet = addSphere(radius_km, color, {
    x: semi_major_axis_km,
    y: semi_major_axis_km,
    z: 0,
  });
  newPlanet.name = planet.name;
  planetsRef = [...planetsRef, newPlanet];
});

camera.position.z = 50000;
controls.update();

const gui = new GUI();
const actionsFolder = gui.addFolder("Actions");
actionsFolder.add(settings, "timeSpeed", 0.1, 8, 0.01);

function animate() {
  requestAnimationFrame(animate);

  planetsRef.map((planet, index) => {
    const matchedPlanet = planets.find((p) => p.name === planet.name);
    const { semi_major_axis_km, orbital_period_years } = matchedPlanet;

    const orbitRadius = semi_major_axis_km / scaleRatio;

    let currentTheta =
      Math.atan2(planet.position.y, planet.position.x) * (180 / Math.PI);
    const newTheta =
      (currentTheta + settings?.timeSpeed / orbital_period_years) % 360;

    const x = orbitRadius * Math.cos(newTheta * (Math.PI / 180));
    const y = orbitRadius * Math.sin(newTheta * (Math.PI / 180));

    planet.position.set(x, y, 0);
  });

  renderer.render(scene, camera);
}

animate();
