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
              const obj = this.el.getObject3D('mesh');
              console.log(`✅ Model LOADED successfully for: ${this.el.id}`);
              
              if (obj) {
                const box = new (AFRAME.THREE.Box3)().setFromObject(obj);
                const size = new (AFRAME.THREE.Vector3)();
                box.getSize(size);
                console.log(`📏 Dimensions of ${this.el.id}: X:${size.x.toFixed(2)} Y:${size.y.toFixed(2)} Z:${size.z.toFixed(2)}`);
                
                // Auto-normalize to a visible size (4 meters)
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 4 / maxDim;
                this.el.setAttribute('scale', `${scale} ${scale} ${scale}`);
              }
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

  if (!ready) return <div className="p-10 bg-black text-white">Initializing VR System...</div>;

  const modelMap: Record<string, string> = {
    pottedplant: "/assets/pottedplant/scene.glb",
    vase: "/assets/vase/scene.glb",
    stage: "/assets/stage/stage.glb",
    wedding: "/assets/wedding/wedding.glb",
  };

  return (
    <div className="w-full h-full bg-black">
      {/* We use a simple renderer to avoid the sigmaRadians shadow error */}
      <a-scene embedded renderer="antialias: true; colorManagement: true;">
        
        {/* 🔥 BRIGHTER LIGHTING */}
        <a-entity light="type: ambient; intensity: 1.5" />
        <a-entity light="type: directional; intensity: 2" position="5 10 5" />

        {/* 🎯 MOVE CAMERA BACK + SLIGHTLY HIGHER */}
        <a-camera position="0 2 18" far="10000" />

        <a-plane rotation="-90 0 0" width="100" height="100" color="#222" />

        {objects.map((o, i) => {
          const url = o.glbUrl || modelMap[o.name];
          return (
            <a-entity
              key={i}
              id={`model-${o.name}-${i}`}
              gltf-model={url} 
              {/* 🎯 PUSH MODEL FORWARD SO USER STANDS IN FRONT */}
              position={`${o.position[0]} 0 ${o.position[2] - 15}`}
              rotation={`${o.rotation[0]} ${o.rotation[1]} ${o.rotation[2]}`}
              auto-center
            />
          );
        })}

        {/* Debug box (unchanged) */}
        <a-box position="0 0.5 -5" color="red" width="0.5" height="0.5" depth="0.5" />
        <a-sky color="#111" />
      </a-scene>
    </div>
  );
}
