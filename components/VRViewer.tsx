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
  const [aframeReady, setAframeReady] = useState(false);

  // Load A-Frame only on client
  useEffect(() => {
    AFrame.then(() => setAframeReady(true));
  }, []);

  if (!aframeReady) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-white">
        Loading VR Viewer…
      </div>
    );
  }

  const modelMap: Record<string, string> = {
    pottedplant: "/assets/pottedplant/scene.glb",
    vase: "/assets/vase/scene.glb",
    wedding: "/assets/wedding_stage/wedding_stage_shape.glb",
    stage: "/assets/stage/stage.glb",
  };

  const scaleMap: Record<string, string> = {
    pottedplant: "0.8 0.8 0.8",
    vase: "1.8 1.8 1.8",
    wedding: "1.8 1.8 1.8",
    stage: "1.8 1.8 1.8",
  };

  return (
    <div className="w-full h-full bg-black">
      <a-scene
        vr-mode-ui="enabled: true"
        embedded
        renderer="antialias: true;"
      >
        {/* Preload assets */}
        <a-assets>
          {objects.map((o, i) =>
            modelMap[o.name] ? (
              <a-asset-item
                key={i}
                id={`asset-${i}`}
                src={modelMap[o.name]}
              />
            ) : null
          )}
        </a-assets>

        {/* Proper VR camera */}
        <a-entity
          id="cameraRig"
          position="0 1.6 0"
        >
          <a-camera wasd-controls look-controls></a-camera>
        </a-entity>

        {/* Place 3D models */}
        {objects.map((o, i) => {
          if (!modelMap[o.name]) return null;

          const pos = `${o.position[0] * 2} ${o.position[1]} ${
            o.position[2] * 2
          }`;

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

        {/* VR Sky Background */}
        <a-sky color="#111"></a-sky>
      </a-scene>
    </div>
  );
}
