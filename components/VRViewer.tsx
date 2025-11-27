"use client";

import dynamic from "next/dynamic";
const AFrame = dynamic(() => import("aframe"), { ssr: false });

interface StageObject {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
}

export default function VRViewer({ objects }: { objects: StageObject[] }) {
  AFrame; // ensures module loads client-side only

  const modelMap = {
    pottedplant: "/assets/pottedplant/scene.glb",
    vase: "/assets/vase/scene.glb",
    wedding: "/assets/wedding_stage/wedding_stage_shape.glb",
    stage: "/assets/stage/stage.glb",
  };

  return (
    <div className="w-full h-full bg-black">
      <a-scene vr-mode-ui="enabled: true" renderer="antialias: true" embedded>
        <a-assets>
          {objects.map((o, i) =>
            modelMap[o.name] ? (
              <a-asset-item key={i} id={`asset-${i}`} src={modelMap[o.name]} />
            ) : null
          )}
        </a-assets>

        <a-entity camera look-controls wasd-controls="acceleration: 15" position="0 1.6 0" />

        {objects.map((o, i) =>
          modelMap[o.name] ? (
            <a-entity
              key={i}
              gltf-model={`url(${modelMap[o.name]})`}
              position={`${o.position[0] * 2} ${o.position[1]} ${o.position[2] * 2}`}
              rotation={`${o.rotation[0]} ${o.rotation[1]} ${o.rotation[2]}`}
              scale="1.2 1.2 1.2"
            />
          ) : null
        )}

        <a-sky color="#111" />
      </a-scene>
    </div>
  );
}
