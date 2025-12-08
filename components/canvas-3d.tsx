"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

interface StageObject {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  // Assuming obj.glbUrl exists for dynamic models (wedding/stage)
  glbUrl?: string; 
}

interface Canvas3DProps {
  objects: StageObject[];
  viewMode: "perspective" | "ar" | "vr";
}

export default function Canvas3D({ objects, viewMode }: Canvas3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151515);

    const aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
    // ⭐ Initial Camera Position: Moved back slightly for a better overview
    camera.position.set(0, 3, 10); 

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // Tone mapping and Color Space
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    (renderer as any).outputColorSpace = THREE.SRGBColorSpace;


    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 2.5, 0); // Target slightly higher than the floor

    // Environment and Lighting
    const pmremGen = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGen.fromScene(new RoomEnvironment(renderer), 2).texture;
    scene.environment = envTexture;

    // Added a single strong directional light and a fill light for simplicity and performance
    const mainLight = new THREE.DirectionalLight(0xffffff, 3.0);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    scene.add(mainLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    scene.add(hemiLight);

    // Ground plane & Helpers (kept for debugging, hidden when objects exist)
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    const gridHelper = new THREE.GridHelper(30, 60, 0x888888, 0x444444);
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(gridHelper, axesHelper);

    if (objects.length > 0) {
      gridHelper.visible = false;
      axesHelper.visible = false;
      plane.visible = false;
      // Removed debugCube
    }

    // --- Model Loading ---
    const loader = new GLTFLoader();
    const loadedObjects: THREE.Object3D[] = [];

    const toLoad = (objects || [])
      .map((obj) => {
        let modelPath = "";
        let scale = 1.0; 
        let isDynamicModel = false;

        // Custom scaling for static assets
        if (obj.name === "pottedplant") {
          modelPath = "/assets/pottedplant/scene.glb";
          scale = 0.8;
        } else if (obj.name === "vase") {
          modelPath = "/assets/vase/scene.glb";
          scale = 1.8;
        } 
        
        // ⭐ FIX: Generated models already have 5x scale and correct orientation applied in Python worker.
        else if (obj.glbUrl || obj.name === "stage" || obj.name === "wedding") {
          modelPath = obj.glbUrl || (obj.name === "stage" ? "/assets/stage/stage.glb" : "https://stagenix-backend.onrender.com/model/perfect_stage_corrected.glb");
          scale = 1.0; // Set to neutral scale
          isDynamicModel = true;
        }

        return { source: obj, modelPath, scale, isDynamicModel };
      })
      .filter((entry) => entry.modelPath);

    let loadedCount = 0;
    const expectedCount = toLoad.length;
    let combinedBox = new THREE.Box3();
    let firstModelLoaded = false;

    toLoad.forEach(({ source, modelPath, scale, isDynamicModel }) => {
      loader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(scale, scale, scale);

          // Apply shadows to all meshes
          model.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
              }
          });
          
          // ⭐ CRITICAL FIX: The Python script centers the base mesh. We just need to apply the rotation.
          // Note: Position is handled by controls/autofit, not by source.position for this simple viewer.
          if (isDynamicModel) {
             // Model already has 180 deg rotation from backend, but adding yaw rotation here for manual placement
             model.rotation.y = source.rotation[1] * Math.PI / 180;
          }

          scene.add(model);
          loadedObjects.push(model);

          // Update combined bounding box
          if (firstModelLoaded) {
              combinedBox.union(new THREE.Box3().setFromObject(model));
          } else {
              combinedBox.setFromObject(model);
              firstModelLoaded = true;
          }
          
          loadedCount++;

          // Auto-fit camera after ALL objects are loaded
          if (loadedCount === expectedCount) {
            
            const center = combinedBox.getCenter(new THREE.Vector3());
            const size = combinedBox.getSize(new THREE.Vector3());
            
            // Adjust camera to look at center and zoom out based on size
            const maxDimension = Math.max(size.x, size.y, size.z);
            const fitDistance = maxDimension / (2 * Math.tan(camera.fov * Math.PI / 360));
            
            // Set camera position to see the entire model
            camera.position.set(center.x, center.y + size.y * 0.5, center.z + fitDistance * 1.5);
            controls.target.set(center.x, center.y, center.z);
            controls.update(); // Update controls to look at the new target
            
            // Ensure the model is resting on the floor (Y=0)
            const floorOffset = center.y - size.y / 2;
            scene.children.forEach(child => {
                if (loadedObjects.includes(child)) {
                    child.position.y -= floorOffset;
                }
            });
          }
        },
        undefined,
        (err) => {
          console.error("❌ Model load error:", modelPath, err);
          loadedCount++;
        }
      );
    });

    // --- Animation and Cleanup ---
    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const { clientWidth, clientHeight } = mountRef.current;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);
      
      // ... (Cleanup logic remains the same for brevity)
      if (mountRef.current && renderer.domElement.parentElement === mountRef.current) {
         mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      envTexture.dispose();
      pmremGen.dispose();
    };
  }, [objects, viewMode]);

  return (
    <div
      ref={mountRef}
      className="w-full h-[80vh] bg-black rounded-lg border border-primary/20 shadow-inner overflow-visible"
    />
  );
}
