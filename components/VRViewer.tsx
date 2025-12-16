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
          /**
           * auto-center component:
           * - Centers model
           * - Grounds model on Y=0
           * - Auto-scales model to human VR size
           */
          AFRAME.registerComponent("auto-center", {
            init: function () {
              this.el.addEventListener("model-loaded", () => {
                const THREE = (window as any).THREE;
                const mesh = this.el.getObject3D("mesh");
                if (!mesh) return;

                // --- Bounding box ---
                const box = new THREE.Box3().setFromObject(mesh);
                const size = new THREE.Vector3();
                const center = new THREE.Vector3();
                box.getSize(size);
                box.getCenter(center);

                // --- Center model ---
                mesh.position.x = -center.x;
                mesh.position.y = -box.min.y;
                mesh.position.z = -center.z;

                // --- Auto-scale (MATCHES Canvas3D logic conceptually) ---
                const maxDim = Math.max(size.x, size.y, size.z);
                const TARGET_SIZE = 3; // meters in VR (stage-friendly)
                const scale = TARGET_SIZE / maxDim;

                this.el.setAttribute(
                  "scale",
                  `${scale} ${scale} ${scale}`
                );

                console.log("✅ Auto-centered & auto-scaled model for VR");
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

  // --- Configuration ---
  const modelMap: Record<string, string> = {
    pottedplant: "/assets/pottedplant/scene.glb",
    vase: "/assets/vase/scene.glb",
    stage: "/assets/stage/stage.glb",
    wedding: "/assets/wedding/wedding.glb",
  };

  const scaleMap: Record<string, string> = {
    pottedplant: "2 2 2",
    vase: "3 3 3",
    // Kept for safety, but auto-center overrides for large stages
    wedding: "0.01 0.01 0.01",
    stage: "1 1 1",
  };

  // Keep offset but ensure visibility
  const Z_OFFSET = -3;

  // Camera setup (human eye height)
  const INITIAL_CAMERA_Z = 5;
  const INITIAL_CAMERA_Y = 1.6;

  // --- Rendered Scene ---
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
          shadowMap.type: THREE.PCFSoftShadowMap; 
          shadowMap.maxSamples: 10;
          shadowMap.csm.maxSamples: 10;
          shadowMap.csm.sigma: 1;
        "
      >
        {/* LIGHTING */}
        <a-entity light="type: ambient; color: #ffffff; intensity: 0.8"></a-entity>
        <a-entity
          light="type: directional; color: #ffffff; intensity: 1.2; castShadow: true"
          position="2 5 3"
        ></a-entity>
        <a-entity light="type: hemisphere; color: #aaaaaa; groundColor: #333333; intensity: 0.6"></a-entity>

        <a-assets>
          {objects.map((o, i) => {
            const url = o.glbUrl || modelMap[o.name];
            return url ? (
              <a-asset-item key={i} id={`asset-${i}`} src={url} />
            ) : null;
          })}
        </a-assets>

        {/* Camera Rig */}
        <a-entity id="cameraRig" position={`0 ${INITIAL_CAMERA_Y} ${INITIAL_CAMERA_Z}`}>
          <a-camera
            look-controls
            wasd-controls
            near="0.01"
            far="5000"
          ></a-camera>
        </a-entity>

        {/* Ground */}
        <a-plane
          rotation="-90 0 0"
          width="500"
          height="500"
          color="#333333"
          shadow="receive: true"
        ></a-plane>

        {/* Models */}
        {objects.map((o, i) => {
          const url = o.glbUrl || modelMap[o.name];
          if (!url) return null;

          const pos = `${o.position[0]} ${o.position[1]} ${o.position[2] + Z_OFFSET}`;
          const rotationCorrection = `${o.rotation[0]} ${o.rotation[1]} ${o.rotation[2]}`;
          const scale = scaleMap[o.name] || "1 1 1";

          return (
            <a-entity
              key={i}
              gltf-model={`url(${url})`}
              position={pos}
              rotation={rotationCorrection}
              scale={scale}
              auto-center
              shadow="cast: true; receive: true"
            />
          );
        })}

        {/* Debug reference */}
        <a-box position="0 1 -3" color="red"></a-box>

        <a-sky color="#151515"></a-sky>
      </a-scene>
    </div>
  );
}
