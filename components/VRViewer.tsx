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
    import("aframe").then(() => {
      const AFRAME = (window as any).AFRAME;

      if (AFRAME && !AFRAME.components["auto-center"]) {
        AFRAME.registerComponent("auto-center", {
          init: function () {
            this.el.addEventListener("model-loaded", () => {
              const THREE = (window as any).THREE;
              const obj = this.el.getObject3D("mesh");
              if (!obj || !THREE) return;

              obj.updateMatrixWorld(true);

              const box = new THREE.Box3().setFromObject(obj);
              const size = new THREE.Vector3();
              const center = new THREE.Vector3();

              box.getSize(size);
              box.getCenter(center);

              obj.position.x -= center.x;
              obj.position.z -= center.z;
              obj.position.y -= box.min.y;

              obj.updateMatrixWorld(true);

              const maxDim = Math.max(size.x, size.y, size.z);
              const TARGET_SIZE = 4;
              const scale = TARGET_SIZE / maxDim;

              this.el.setAttribute("scale", `${scale} ${scale} ${scale}`);
            });
          },
        });
      }

      setReady(true);
    });
  }, []);

  if (!ready)
    return (
      <div className="p-10 bg-black text-white">
        Initializing VR System...
      </div>
    );

  const modelMap: Record<string, string> = {
    pottedplant: "/assets/pottedplant/scene.glb",
    vase: "/assets/vase/scene.glb",
    stage: "/assets/stage/stage.glb",
    wedding: "/assets/wedding/wedding.glb",
  };

  return (
    <div className="w-full h-full bg-black">
      <a-scene
        embedded
        renderer="
          antialias: true;
          physicallyCorrectLights: true;
          colorManagement: true;
          toneMapping: ACESFilmicToneMapping;
          exposure: 2.5;
        "
      >

        {/* 🌞 EXTREME BRIGHT MODE */}
        <a-entity light="type: ambient; intensity: 3" />
        <a-entity light="type: hemisphere; intensity: 2.5; color: #ffffff; groundColor: #888888" />
        <a-entity light="type: directional; intensity: 4" position="6 12 10" castShadow="true" />
        <a-entity light="type: point; intensity: 3; distance: 120" position="0 6 10" />

        {/* CAMERA */}
        <a-camera position="0 1.8 16" far="20000" />

        {/* FLOOR */}
        <a-plane rotation="-90 0 0" width="400" height="400" color="#2a2a2a" />

        {objects.map((o, i) => {
          const url = o.glbUrl || modelMap[o.name];

          return (
            <a-entity
              key={i}
              id={`model-${o.name}-${i}`}
              gltf-model={`url(${url})`}
              crossorigin="anonymous"
              position={`${o.position[0]} 0 ${o.position[2] - 16}`}
              rotation={`${o.rotation[0]} ${o.rotation[1]} ${o.rotation[2]}`}
              auto-center
            />
          );
        })}

        <a-box position="0 0.5 -5" color="red" width="0.5" height="0.5" depth="0.5" />

        <a-sky color="#111" />
      </a-scene>
    </div>
  );
}
