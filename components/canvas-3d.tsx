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
}

interface Canvas3DProps {
  objects: StageObject[];
  viewMode: "perspective" | "ar" | "vr";
}

export default function Canvas3D({ objects, viewMode }: Canvas3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151515);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 3, 6);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    (renderer as any).toneMapping = THREE.ACESFilmicToneMapping;
    (renderer as any).toneMappingExposure = 1.3;

    if ((THREE as any).SRGBColorSpace) {
      (renderer as any).outputColorSpace = (THREE as any).SRGBColorSpace;
    }

    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1, 0);

    // Env map
    const pmremGen = new THREE.PMREMGenerator(renderer);
    const envTexture = pmremGen.fromScene(new RoomEnvironment(renderer), 2).texture;
    scene.environment = envTexture;

    // Lights (your original lights)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(4, 10, 6);
    keyLight.castShadow = true;

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.8);
    fillLight.position.set(-6, 6, 2);

    const backLight = new THREE.DirectionalLight(0xffffff, 2.0);
    backLight.position.set(0, 8, -6);

    scene.add(keyLight, fillLight, backLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
    hemiLight.position.set(0, 20, 0);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(hemiLight, dirLight);

    const envLight = new THREE.HemisphereLight(0xffffff, 0x222222, 0.8);
    scene.add(envLight);

    // Ground
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

    if (objects.length > 0) {
      gridHelper.visible = false;
      axesHelper.visible = false;
      debugCube.visible = false;
      plane.visible = false;
    }

    // Loader
    const loader = new GLTFLoader();
    const loadedObjects: THREE.Object3D[] = [];

    const toLoad = (objects || [])
      .map((obj) => {
        let modelPath = "";
        let scale = 3;

        if (obj.name === "pottedplant") {
          modelPath = "/assets/pottedplant/scene.glb";
          scale = 0.8;
        } else if (obj.name === "vase") {
          modelPath = "/assets/vase/scene.glb";
          scale = 1.8;
        } else if (obj.glbUrl) {
          modelPath = obj.glbUrl;
          scale = 20;
        } else if (obj.name === "stage") {
          modelPath = "/assets/stage/stage.glb";
          scale = 1.8;
        }

        return { source: obj, modelPath, scale };
      })
      .filter((x) => x.modelPath);

    // LOAD LOOP
    toLoad.forEach(({ source, modelPath, scale }) => {
      loader.load(
        modelPath,
        (gltf) => {
          const model = gltf.scene;

          // Apply user scale
          model.scale.set(scale, scale, scale);

          // ⭐ MAKE MODEL PERFECTLY CENTERED ⭐
          const box = new THREE.Box3().setFromObject(model);
          const center = new THREE.Vector3();
          box.getCenter(center);
          model.position.sub(center); // shift so center is (0,0,0)

          // ⭐ Auto camera distance based on size ⭐
          const size = box.getSize(new THREE.Vector3()).length();
          const distance = size * 1.2;
          camera.position.set(0, distance * 0.6, distance);

          controls.target.set(0, 0.5 * size, 0);
          controls.update();

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          });

          scene.add(model);
          loadedObjects.push(model);
        },
        undefined,
        (err) => console.error("Model load error:", modelPath, err)
      );
    });

    // Animation loop
    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();
      debugCube.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (mountRef.current) {
        camera.aspect =
          mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(
          mountRef.current.clientWidth,
          mountRef.current.clientHeight
        );
      }
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafId);

      loadedObjects.forEach((obj) => {
        scene.remove(obj);
      });

      if (
        mountRef.current &&
        renderer.domElement.parentElement === mountRef.current
      ) {
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
