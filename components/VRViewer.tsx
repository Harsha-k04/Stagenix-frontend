"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import aframe only on the client side
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
        setReady(true);

        const AFRAME = (window as any).AFRAME;

        if (AFRAME && !AFRAME.components["auto-center"]) {
          AFRAME.registerComponent("auto-center", {
            init: function () {
              this.el.addEventListener("model-loaded", () => {
                // ✅ FIX: use A-Frame's THREE instance
                const THREE = (window as any).AFRAME.THREE;

                const obj = this.el.object3D;
                if (!obj) return;

                obj.updateMatrixWorld(true);

                const box = new THREE.Box3().setFromObject(obj);
                const size = new THREE.Vector3();
                const center = new THREE.Vector3();

                box.getSize(size);
                box.getCenter(center);

                // Center horizontally
                obj.position.x -= center.x;
                obj.position.z -= center.z;

                // Ground vertically
                obj.position.y -= box.min.y;

                // Normalize scale for VR
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 3 / maxDim;
                obj.scale.set(scale, scale, scale);

                obj.updateMatrixWorld(true);

                console.log("✅ model-loaded fired, VR normalization done");
              });

              // Log model load failures
              this.el.addEventListener("model-error", (e: any) => {
                console.error("❌ GLB failed to load:", e);
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
    stage: "/assets/stage/stage.glb",
    wedding: "/assets/wedding/wedding.glb",
  };

  const scaleMap: Record<string, string> = {
    pottedplant: "2 2 2",
    vase: "3 3 3",
    wedding: "0.01 0.01 0.01",
    stage: "1 1 1",
  };

  const Z_OFFSET = -3;
  const INITIAL_CAMERA_Z = 5;
  const INITIAL_CAMERA_Y = 1.6;

  return (
    <div className="w-full h-full bg-black">
      <a-scene
        embedded
        vr-mode-ui="enabled: true"
        renderer="
          antialias: true;
          colorManagement: true;
          physicallyCorrectLights: true;
          shadowMapEnabled: true;
        "
      >
        {/* LIGHTING */}
        <a-entity light="type: ambient; intensity: 0.8" />
        <a-entity light="type: directional; intensity: 1.2" position="2 5 3" />
        <a-entity light="type: hemisphere; intensity: 0.6" />

        {/* ASSETS */}
        <a-assets>
          {objects.map((o, i) => {
            const url = o.glbUrl || modelMap[o.name];
            return url ? (
              <a-asset-item
                key={i}
                id={`asset-${i}`}
                src={url}
                crossorigin="anonymous"
              />
            ) : null;
          })}
        </a-assets>

        {/* CAMERA */}
        <a-entity position={`0 ${INITIAL_CAMERA_Y} ${INITIAL_CAMERA_Z}`}>
          <a-camera look-controls wasd-controls />
        </a-entity>

        {/* GROUND */}
        <a-plane rotation="-90 0 0" width="500" height="500" color="#333" />

        {/* MODELS */}
        {objects.map((o, i) => {
          const pos = `${o.position[0]} ${o.position[1]} ${o.position[2] + Z_OFFSET}`;
          const rot = `${o.rotation[0]} ${o.rotation[1]} ${o.rotation[2]}`;
          const scale = scaleMap[o.name] || "1 1 1";

          return (
            <a-entity
              key={i}
              gltf-model={`#asset-${i}`}
              position={pos}
              rotation={rot}
              scale={scale}
              auto-center
            />
          );
        })}

        {/* DEBUG */}
        <a-box position="0 1 -3" color="red" />
        <a-sky color="#151515" />
      </a-scene>
    </div>
  );
}
