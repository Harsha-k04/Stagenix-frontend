"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const AFrame = dynamic(() => import("aframe"), { ssr: false });

interface StageObject {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  glbUrl?: string; // ⭐ Added to accept the dynamic URL
}

export default function VRViewer({ objects }: { objects: StageObject[] }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    import("aframe")
      .then((mod) => {
        setReady(true);
        
        // ⭐ NEW: Custom component to auto-center models and place them on the floor
        if (!mod.AFRAME.components["auto-center"]) {
          mod.AFRAME.registerComponent("auto-center", {
            init: function () {
              this.el.addEventListener("model-loaded", () => {
                const mesh = this.el.getObject3D("mesh");
                if (!mesh) return;

                // 1. Calculate Bounding Box
                const box = new (window as any).THREE.Box3().setFromObject(mesh);
                const center = new (window as any).THREE.Vector3();
                const size = new (window as any).THREE.Vector3();
                box.getCenter(center);
                box.getSize(size);

                // 2. Calculate Offsets (Center X/Z, Floor Y)
                const xOffset = -center.x;
                const yOffset = -box.min.y; // Shift up so the bottom touches 0
                const zOffset = -center.z;

                // 3. Apply Offset to the mesh geometry
                mesh.position.set(xOffset, yOffset, zOffset);
                
                console.log("✅ Auto-centered model in VR");
              });
            },
          });
        }
      })
      .catch(console.error);
  }, []);

  if (!ready) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white">
        Loading VR Viewer…
      </div>
    );
  }

  const modelMap: Record<string, string> = {
    pottedplant: "/assets/pottedplant/scene.glb",
    vase: "/assets/vase/scene.glb",
    // We removed the hardcoded 'wedding' URL to prevent 404s
    stage: "/assets/stage/stage.glb",
  };

  const scaleMap: Record<string, string> = {
    pottedplant: "2 2 2",
    vase: "3 3 3",
    wedding: "1 1 1", // Neutral scale (backend handles 5x)
    stage: "1 1 1",
  };

  // Place model 4 meters in front of the camera
  const Z_OFFSET = -4; 

  return (
    <div className="w-full h-full bg-black">
      <a-scene
        embedded
        vr-mode-ui="enabled: true"
        // ⭐ Enabled physicallyCorrectLights for better quality
        renderer="antialias: true; colorManagement: true; physicallyCorrectLights: true;"
      >
        {/* LIGHTING */}
        <a-entity light="type: ambient; color: #ffffff; intensity: 0.5"></a-entity>
        <a-entity light="type: directional; color: #ffffff; intensity: 1.5; castShadow: true" position="1 4 2"></a-entity>
        <a-entity light="type: hemisphere; color: #aaaaaa; groundColor: #333333; intensity: 0.8"></a-entity>

        <a-assets>
          {objects.map((o, i) => {
             // Check dynamic URL first, then static map
             const url = o.glbUrl || modelMap[o.name];
             return url ? <a-asset-item key={i} id={`asset-${i}`} src={url} /> : null;
          })}
        </a-assets>

        {/* Camera at 0, 1.6m high (eye level) */}
        <a-entity id="cameraRig" position="0 1.6 0">
          <a-camera look-controls wasd-controls></a-camera>
        </a-entity>

        {/* Models */}
        {objects.map((o, i) => {
          // ⭐ LOGIC FIX: Prioritize dynamic glbUrl
          const url = o.glbUrl || modelMap[o.name];
          if (!url) return null;

          // Position: Apply Z offset. 
          // 'auto-center' will handle the precise centering and grounding.
          const pos = `${o.position[0]} ${o.position[1]} ${o.position[2] + Z_OFFSET}`;
          const rot = `${o.rotation[0]} ${o.rotation[1]} ${o.rotation[2]}`;
          
          const scale = scaleMap[o.name] || "1 1 1";

          return (
            <a-entity
              key={i}
              gltf-model={`url(${url})`}
              position={pos}
              rotation={rot}
              scale={scale}
              auto-center // 👈 Triggers the centering/grounding logic
              shadow="cast: true; receive: true"
            />
          );
        })}

        <a-sky color="#151515"></a-sky>
      </a-scene>
    </div>
  );
}
