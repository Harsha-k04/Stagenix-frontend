"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface StageObject {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
}

interface Canvas3DProps {
  objects: StageObject[];
  viewMode: "perspective" | "ar" | "vr";
}

export default function Canvas3D({ objects, viewMode }: Canvas3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 🧱 Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151515);

    // 🎥 Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3, 6);

    // ⚙️ Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // --- SAFE COLORSPACE FIX ---
    (renderer as any).toneMapping = THREE.ACESFilmicToneMapping;
    (renderer as any).toneMappingExposure = 1.1;

    // Only set SRGBColorSpace (modern THREE)
    if ((THREE as any).SRGBColorSpace) {
      (renderer as any).outputColorSpace = (THREE as any).SRGBColorSpace;
    }

    mountRef.current.appendChild(renderer.domElement);

    // 🎮 Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1, 0);

    // 💡 Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    hemiLight.position.set(0, 20, 0);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(hemiLight, dirLight);

    // Env light
    const envLight = new THREE.HemisphereLight(0xffffff, 0x222222, 0.8);
    scene.add(envLight);

    // 🟫 Ground plane
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    // Helpers
    const gridHelper = new THREE.GridHelper(20, 40, 0x888888, 0x444444);
    const axesHelper = new THREE.AxesHelper(3);
    scene.add(gridHelper, axesHelper);

    const debugCube = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xffcc00 })
    );
    debugCube.position.set(0, 0.3, 0);
    scene.add(debugCube);

    // Loader
    const loader = new GLTFLoader();
    const loadedObjects: THREE.Object3D[] = [];
    const modelPositions: THREE.Vector3[] = [];

    const toLoad = (objects || [])
      .map((obj) => {
        let modelPath = "";
        let scale = 2;

        if (obj.name === "pottedplant") {
          modelPath = "/assets/pottedplant/scene.glb";
          scale = 0.8;
        } else if (obj.name === "vase") {
          modelPath = "/assets/vase/scene.glb";
          scale = 1.8;
        } else if (obj.name === "wedding") {
          modelPath = "https://github.com/Harsha-k04/Stagenix-backend/releases/download/v1.0/perfect_stage_corrected.glb";
          scale = 1.8;
        } else if (obj.name === "stage") {
          modelPath = "/assets/stage/stage.glb";
          scale = 1.8;
        }

        return { source: obj, modelPath, scale };
      })
      .filter((entry) => entry.modelPath);

    let loadedCount = 0;
    const expectedCount = toLoad.length;

    toLoad.forEach(({ source, modelPath, scale }) => {
      const [px, py, pz] = source.position;
      const [rx, ry, rz] = source.rotation;

      loader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(scale, scale, scale);

          const box = new THREE.Box3().setFromObject(model);
          model.position.y -= box.min.y;

          model.position.x += px * 3;
          model.position.z += pz * 3;
          model.rotation.set(rx, ry, rz);

          model.traverse((child) => {
            const mesh = child as THREE.Mesh;
            if (mesh.isMesh) {
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });

          scene.add(model);
          loadedObjects.push(model);
          modelPositions.push(new THREE.Vector3(px * 3, py, pz * 3));

          loadedCount += 1;
          if (loadedCount === expectedCount) {
            const avg = new THREE.Vector3();
            modelPositions.forEach((p) => avg.add(p));
            avg.divideScalar(modelPositions.length);
            controls.target.copy(avg);
            camera.lookAt(avg);
          }
        },
        undefined,
        (err) => {
          loadedCount += 1;
          console.error("❌ Model load error:", modelPath, err);
        }
      );
    });

    // Animate
    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();
      debugCube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const { clientWidth, clientHeight } = mountRef.current;
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);

      loadedObjects.forEach((obj) => {
        scene.remove(obj);
        obj.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.geometry?.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => (m as THREE.Material).dispose?.());
            } else {
              (mesh.material as THREE.Material)?.dispose?.();
            }
          }
        });
      });

      gridHelper.geometry.dispose();
      (gridHelper.material as THREE.Material).dispose();
      plane.geometry.dispose();
      (plane.material as THREE.Material).dispose();
      debugCube.geometry.dispose();
      (debugCube.material as THREE.Material).dispose();
      axesHelper.geometry.dispose();
      (axesHelper.material as THREE.Material).dispose();

      if (mountRef.current && renderer.domElement.parentElement === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }

      renderer.dispose();
    };
  }, [objects, viewMode]);

  return (
    <div
      ref={mountRef}
      className="w-full h-[80vh] bg-black rounded-lg border border-primary/20 shadow-inner overflow-visible"
    />
  );
}
