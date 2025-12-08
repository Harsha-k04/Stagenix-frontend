"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const AFrame = dynamic(() => import("aframe"), { ssr: false });

interface StageObject {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
}

export default function VRViewer({ objects }: { objects: StageObject[] }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    import("aframe")
      .then(() => setReady(true))
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
    wedding: "https://stagenix-backend.onrender.com/model/perfect_stage_corrected.glb",
    stage: "/assets/stage/stage.glb",
  };

  // The scale for 'wedding' and 'stage' is 1 1 1 because the 5x scaling is now applied in the GLB file.
  const scaleMap: Record<string, string> = {
    pottedplant: "2 2 2",
    vase: "3 3 3",
    wedding: "1 1 1", 
    stage: "1 1 1",
  };

  // Offset Z by a negative value to place the model forward
  const Z_OFFSET = -5; 

  return (
    <div className="w-full h-full bg-black">
      <a-scene
        embedded
        vr-mode-ui="enabled: true"
        renderer="antialias: true; colorManagement: true;"
      >
        {/* LIGHTING: This setup is good for realistic shading. */}
        <a-entity light="type: ambient; color: #ffffff; intensity: 0.5"></a-entity>
        <a-entity light="type: directional; color: #ffffff; intensity: 1.5" position="1 4 2"></a-entity>
        <a-entity light="type: hemisphere; color: #aaaaaa; groundColor: #333333; intensity: 0.8"></a-entity>


        <a-assets>
          {objects.map((o, i) =>
            modelMap[o.name] ? (
              <a-asset-item key={i} id={`asset-${i}`} src={modelMap[o.name]} />
            ) : null
          )}
        </a-assets>

        {/* Camera (position changed from 0 1.6 3 to 0 1.6 10 to zoom out) */}
        {/* ⭐ FIX: Increased Z to 10 to move the camera further back for a better initial view. */}
        <a-entity id="cameraRig" position="0 1.6 10">
          <a-camera look-controls wasd-controls></a-camera>
        </a-entity>

        {/* Model */}
        {objects.map((o, i) => {
          if (!modelMap[o.name]) return null;

          // POSITION FIX: Apply negative Z offset (Z_OFFSET) to bring the model into view
          const pos = `${o.position[0] * 1} ${o.position[1]} ${o.position[2] * 1 + Z_OFFSET}`; 
          const rot = `${o.rotation[0]} ${o.rotation[1]} ${o.rotation[2]}`;

          return (
            <a-entity
              key={i}
              gltf-model={`url(${modelMap[o.name]})`}
              position={pos}
              rotation={rot}
              scale={scaleMap[o.name]}
            />
          );
        })}

        <a-sky color="#111"></a-sky>
      </a-scene>
    </div>
  );
}
