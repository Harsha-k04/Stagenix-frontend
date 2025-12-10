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
    // Initial Camera Position
    camera.position.set(0, 3, 10); 

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    (renderer as any).outputColorSpace = THREE.SRGBColorSpace;

    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    // We will update the target later once models load

    // Environment and Lighting
    const pmremGen = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGen.fromScene(new RoomEnvironment(renderer), 2).texture;
    scene.environment = envTexture;

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(2048, 2048);
    scene.add(mainLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
    scene.add(hemiLight);

    // Ground plane
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    const gridHelper = new THREE.GridHelper(50, 50, 0x888888, 0x444444);
    scene.add(gridHelper);

    if (objects.length > 0) {
      gridHelper.visible = false;
      plane.visible = false;
    }

    // --- Model Loading ---
    const loader = new GLTFLoader();
    const loadedObjects: THREE.Object3D[] = [];

    const toLoad = (objects || [])
      .map((obj) => {
        let modelPath = "";
        // Slightly increased scale for better visibility
        let scale = 1.5; 
        let isDynamicModel = false;

        if (obj.name === "pottedplant") {
          modelPath = "/assets/pottedplant/scene.glb";
          scale = 0.8;
        } else if (obj.name === "vase") {
          modelPath = "/assets/vase/scene.glb";
          scale = 1.8;
        } else if (obj.glbUrl || obj.name === "stage" || obj.name === "wedding") {
          modelPath = obj.glbUrl || (obj.name === "stage" ? "/assets/stage/stage.glb" : "https://stagenix-backend.onrender.com/model/perfect_stage_corrected.glb");
          // Scale is 1.5 here, combined with backend 5x = 7.5x total. 
          // Adjust this if it's too big or small.
          scale = 1.5; 
          isDynamicModel = true;
        }

        return { source: obj, modelPath, scale, isDynamicModel };
      })
      .filter((entry) => entry.modelPath);

    let loadedCount = 0;
    const expectedCount = toLoad.length;
    
    // We will calculate bounds incrementally
    let combinedBox = new THREE.Box3(); 
    let firstModelLoaded = false;

    toLoad.forEach(({ source, modelPath, scale, isDynamicModel }) => {
      loader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(scale, scale, scale);

          model.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                  child.castShadow = true;
                  child.receiveShadow = true;
              }
          });
          
          if (isDynamicModel) {
             model.rotation.y = source.rotation[1] * Math.PI / 180;
          }

          scene.add(model);
          loadedObjects.push(model);

          // Update bounding box logic
          model.updateMatrixWorld(true); // Ensure matrix is up to date for box calc
          if (!firstModelLoaded) {
              combinedBox.setFromObject(model);
              firstModelLoaded = true;
          } else {
              combinedBox.expandByObject(model);
          }
          
          loadedCount++;

          // --- Final Centering & Camera Fit ---
          if (loadedCount === expectedCount) {
            
            // 1. Calculate the center and size of all loaded objects
            const center = new THREE.Vector3();
            combinedBox.getCenter(center);
            const size = new THREE.Vector3();
            combinedBox.getSize(size);

            // 2. Calculate offsets to center the model at (0,0,0) horizontally and sit on Y=0
            const offsetX = -center.x;
            const offsetY = -combinedBox.min.y; // Shift down so the lowest point is at 0
            const offsetZ = -center.z;

            // 3. Apply offset to ALL loaded objects
            loadedObjects.forEach(obj => {
                obj.position.x += offsetX;
                obj.position.y += offsetY;
                obj.position.z += offsetZ;
            });

            // 4. Update camera to look at the new center
            // The new center of the model is now (0, size.y/2, 0)
            const newTargetY = size.y / 2;
            
            // Fit logic
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            cameraZ *= 2.0; // Zoom out multiplier (increase to zoom out more)

            camera.position.set(0, newTargetY + (size.y * 0.5), cameraZ);
            controls.target.set(0, newTargetY, 0);
            
            camera.updateProjectionMatrix();
            controls.update();
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
      
      loadedObjects.forEach(obj => { 
          scene.remove(obj);
          // Simple dispose logic
          obj.traverse((child) => {
            if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
          }) 
      });
      
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
