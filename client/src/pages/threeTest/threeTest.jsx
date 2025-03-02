import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./threeTest.scss";
const ThreeDRenderer = () => {
  const mountRef = useRef(null);
  const [track, setTrack] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Create a 3D Box
    const boxWidth = 200,
      boxHeight = 200,
      boxDepth = 200;
    const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const edges = new THREE.EdgesGeometry(boxGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const boxEdges = new THREE.LineSegments(edges, lineMaterial);

    scene.add(boxEdges);

    // Sample locations
    const locations = [
      { x: 0, y: 0, z: 0 },
      { x: 200, y: 0, z: 0 },
      { x: 0, y: 200, z: 0 },
      { x: 200, y: 200, z: 0 },
    ];

    // Add small spheres for the locations
    const sphereGeometry = new THREE.SphereGeometry(5, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    locations.forEach(({ x, y, z }) => {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.position.set(
        x - boxWidth / 2,
        y - boxHeight / 2,
        z - boxDepth / 2
      );
      scene.add(sphere);
    });

    // Camera positioning
    camera.position.set(400, 400, 400);
    // camera.position.set(300, 300, 500);
    camera.lookAt(0, 0, 0);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth the control interaction
    controls.dampingFactor = 0.05;
    controls.update();

    // Axes helper at (x: 0, y: 0, z: 0)
    const axesHelper = new THREE.AxesHelper(150);
    axesHelper.position.set(
      0 - boxWidth / 2,
      0 - boxHeight / 2,
      0 - boxDepth / 2
    );
    scene.add(axesHelper);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Update controls
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resizing
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="home">
      <div className="home-title">
        {track ? <span>Is tracking</span> : <span>Switch to track</span>}
      </div>
      <div className="home-control">
        <label className="switch">
          <input
            type="checkbox"
            checked={track}
            onChange={() => {
              setTrack(!track);
            }}
          />
          <span className="slider round"></span>
        </label>
      </div>
      <div className="home-container">
        <div className="map">
          <div
            ref={mountRef}
            style={{
              width: "100%",
              height: "100vh",
              position: "absolute",
            }}
          />
        </div>
        <div className="info">
          <h1>Tracking info</h1>
          <div className="list">
            <div className="list-item">
              <div className="info-item-detail">
                <span>test a</span>
                <span>test b</span>
              </div>
              <div className="info-item-detail">
                <span>test a</span>
                <span>test b</span>
              </div>
              <div className="info-item-detail">
                <span>Distance:</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDRenderer;
