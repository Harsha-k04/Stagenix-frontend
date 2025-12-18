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
            console.log(`🛠️ Component attached to: ${this.el.id}`);

            this.el.addEventListener("model-loaded", () => {
              console.log(`✅ Model LOADED successfully for: ${this.el.id}`);

              const THREE = (window as any).THREE;
              const obj = this.el.getObject3D("mesh");
              if (!obj || !THREE) return;

              obj.updateMatrixWorld(true);

              const box = new THREE.Box3().setFromObject(obj);
              const size = new THREE.Vector3();
              const center = new THREE.Vector3();

              box.getSize(size);
              box.getCenter(center);

              console.log(
                `📏 Dimensions of ${this.el.id}: X:${size.x.toFixed(
                  2
                )} Y:${size.y.toFixed(2)} Z:${size.z.toFixed(2)}`
              );

              obj.position.x -= center.x;
              obj.position.z -= center.z;
              obj.position.y -= box.min.y;

              obj.updateMatrixWorld(true);

              const maxDim = Math.max(size.x, size.y, size.z);
              const TARGET_SIZE = 4;
              const scale = TARGET_SIZE / maxDim;

              this.el.setAttribute("scale", `${scale} ${scale} ${scale}`);

              console.log("🎯 Normalized + Scaled for VR");
            });

            this.el.addEventListener("model-error", (e: any) => {
              console.error(`❌ Model ERROR for ${this.el.id}:`, e.detail.src);
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
      <a-scene embedded renderer="antialias: true; colorManagement: true;">
        
        {/* ⭐ ONLY LIGHT CHANGES */}
        <a-entity light="type: ambient; intensity: 2" />
        <a-entity light="type: directional; intensity: 2.2" position="8 12 8" />
        <a-entity light="type: point; intensity: 1.5; distance: 50" position="0 5 0" />

        {/* ⭐ ONLY CAMERA CHANGE */}
        <a-camera position="0 2.2 28" far="20000" />

        <a-plane rotation="-90 0 0" width="200" height="200" color="#222" />

        {objects.map((o, i) => {
          const url = o.glbUrl || modelMap[o.name];

          return (
            <a-entity
              key={i}
              id={`model-${o.name}-${i}`}
              gltf-model={`url(${url})`}
              crossorigin="anonymous"

              {/* ⭐ ONLY PUSHING MODEL BACK MORE */}
              position={`${o.position[0]} 0 ${o.position[2] - 25}`}

              rotation={`${o.rotation[0]} ${o.rotation[1]} ${o.rotation[2]}`}
              auto-center
            />
          );
        })}

        <a-box
          position="0 0.5 -5"
          color="red"
          width="0.5"
          height="0.5"
          depth="0.5"
        />

        <a-sky color="#111" />
      </a-scene>
    </div>
  );
}
