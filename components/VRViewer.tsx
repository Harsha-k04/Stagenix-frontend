"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const AFrame = dynamic(() => import("aframe"), { ssr: false });

interface StageObject {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  glbUrl?: string;
}

export default function VRViewer({ objects }: { objects: StageObject[] }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    import("aframe")
      .then(() => {
        const AFRAME = (window as any).AFRAME;

        if (AFRAME && !AFRAME.components["auto-center"]) {
          AFRAME.registerComponent("auto-center", {
            init: function () {
              this.el.addEventListener("model-loaded", () => {
                const THREE = AFRAME.THREE;
                const obj = this.el.object3D;
                if (!obj) return;

                // 1. Calculate the bounding box
                obj.updateMatrixWorld(true);
                const box = new THREE.Box3().setFromObject(obj);
                const size = new THREE.Vector3();
                box.getSize(size);
                const center = new THREE.Vector3();
                box.getCenter(center);

                // --- DIAGNOSTIC LOGS ---
                console.log(`📦 Model Loaded: ${this.el.id}`);
                console.log(`📏 Original Size: Width:${size.x.toFixed(2)}, Height:${size.y.toFixed(2)}, Depth:${size.z.toFixed(2)}`);
                console.log(`📍 Original Center: ${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)}`);

                // 2. Center the model's geometry
                obj.position.x -= center.x;
                obj.position.z -= center.z;
                obj.position.y -= box.min.y; // Sit on the floor

                // 3. AUTO-NORMALIZATION 
                // This makes the model roughly 4 meters wide regardless of how big the file was
                const maxDim = Math.max(size.x, size.y, size.z);
                if (maxDim > 0) {
                  const scaleFactor = 4 / maxDim; 
                  obj.scale.set(scaleFactor, scaleFactor, scaleFactor);
                  console.log(`⚖️ Auto-scaled by: ${scaleFactor.toFixed(5)} to fit VR view.`);
                }

                obj.updateMatrixWorld(true);
              });

              this.el.addEventListener("model-error", (e: any) => {
                console.error("❌ GLB failed to load path:", this.el.getAttribute("gltf-model"), e);
              });
            },
          });
        }
        setReady(true);
      })
      .catch(console.error);
  }, []);

  if (!ready) return <div className="bg-black text-white p-10">Loading VR...</div>;

  const modelMap: Record<string, string> = {
    pottedplant: "/assets/pottedplant/scene.glb",
    vase: "/assets/vase/scene.glb",
    stage: "/assets/stage/stage.glb",
    wedding: "/assets/wedding/wedding.glb",
  };

  // We are removing the manual scaleMap because the "auto-center" component 
  // now handles normalization automatically.
  
  const Z_OFFSET = -5; // Move models further back from camera

  return (
    <div className="w-full h-full bg-black">
      <a-scene 
        embedded 
        renderer="antialias: true; colorManagement: true;"
      >
        <a-assets>
          {objects.map((o, i) => (
            <a-asset-item 
                key={i} 
                id={`asset-${i}`} 
                src={o.glbUrl || modelMap[o.name]} 
                crossorigin="anonymous" 
            />
          ))}
        </a-assets>

        {/* LIGHTING */}
        <a-entity light="type: ambient; intensity: 0.8" />
        <a-entity light="type: directional; intensity: 1" position="1 4 3" />

        {/* CAMERA: Higher up and further back */}
        <a-entity position="0 1.6 5">
          <a-camera look-controls wasd-controls far="10000" near="0.1" />
        </a-entity>

        {/* GROUND */}
        <a-plane rotation="-90 0 0" width="100" height="100" color="#222" />

        {/* MODELS */}
        {objects.map((o, i) => (
          <a-entity
            key={i}
            id={`entity-${o.name}`}
            gltf-model={`#asset-${i}`}
            position={`${o.position[0]} 0 ${o.position[2] + Z_OFFSET}`}
            rotation={`${o.rotation[0]} ${o.rotation[1]} ${o.rotation[2]}`}
            auto-center // This component now handles scaling automatically
          />
        ))}

        {/* DEBUG BOX: If you see this, the center is here */}
        <a-box position="0 0.5 -5" color="red" width="0.2" height="1" depth="0.2" />
        <a-sky color="#111" />
      </a-scene>
    </div>
  );
}
