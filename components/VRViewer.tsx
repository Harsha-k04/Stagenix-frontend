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
        
        // Access AFRAME from the global window object.
        const AFRAME = (window as any).AFRAME;

        if (AFRAME && !AFRAME.components["auto-center"]) {
          /**
           * auto-center component
           * Calculates the model's bounding box and shifts its internal mesh 
           * to center it horizontally (X/Z) and ground it vertically (Y=0).
           */
          AFRAME.registerComponent("auto-center", {
            init: function () {
              this.el.addEventListener("model-loaded", () => {
                const THREE = (window as any).THREE;
                const mesh = this.el.getObject3D("mesh");
                
                if (!mesh) return;

                // 1. Calculate Bounding Box
                const box = new THREE.Box3().setFromObject(mesh);
                const center = new THREE.Vector3();
                box.getCenter(center);
                
                // 2. Apply Offsets 
                // X/Z: Center the object.
                // Y: Shift up so the lowest point (box.min.y) rests on Y=0.
                mesh.position.x = -center.x;
                mesh.position.y = -box.min.y; 
                mesh.position.z = -center.z; 
                
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
    // ⭐ CRITICAL FIX: Extreme 1000x scaling reduction for the giant stage model. 
    wedding: "0.001 0.001 0.001", 
    stage: "1 1 1",
  };

  // Offset to place objects in front of the camera (0, 1.6, -Z_OFFSET)
  const Z_OFFSET = -12; 
  // ⭐ CRITICAL ADJUSTMENT: Initial Camera Z position pushed back to 50 meters.
  const INITIAL_CAMERA_Z = 50;

  // --- Rendered Scene ---
  return (
    <div className="w-full h-full bg-black">
      <a-scene
        embedded
        vr-mode-ui="enabled: true"
        // Shadow fixes to prevent console warnings
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
        <a-entity light="type: ambient; color: #ffffff; intensity: 0.5"></a-entity>
        {/* Directional light provides shadows (castShadow: true) */}
        <a-entity 
          light="type: directional; color: #ffffff; intensity: 1.5; castShadow: true" 
          position="1 4 2"
        ></a-entity>
        <a-entity light="type: hemisphere; color: #aaaaaa; groundColor: #333333; intensity: 0.8"></a-entity>

        <a-assets>
          {objects.map((o, i) => {
             const url = o.glbUrl || modelMap[o.name];
             return url ? <a-asset-item key={i} id={`asset-${i}`} src={url} /> : null;
          })}
        </a-assets>

        {/* Camera Rig (Handles movement and viewing position) */}
        {/* Set camera Z position very far back. */}
        <a-entity id="cameraRig" position={`0 1.6 ${INITIAL_CAMERA_Z}`}> 
          <a-camera 
            look-controls 
            wasd-controls
            // Set far clipping plane higher to ensure large models don't disappear
            far="5000"
          ></a-camera>
        </a-entity>
        
        {/* Environment: Ground Plane */}
        <a-plane 
            rotation="-90 0 0" 
            width="500" // Increased size to cover vast distances
            height="500" 
            color="#333333" 
            shadow="receive: true"
        ></a-plane>


        {/* Models */}
        {objects.map((o, i) => {
          const url = o.glbUrl || modelMap[o.name];
          if (!url) return null;

          // Apply Z offset to place the model in view
          const pos = `${o.position[0]} ${o.position[1]} ${o.position[2] + Z_OFFSET}`;
          
          // FIX: Add 180-degree rotation to the X-axis to correct glTF models loaded upside down.
          const rotationCorrection = `180 ${o.rotation[1]} ${o.rotation[2]}`;
          
          // Use the scaled map value
          const scale = scaleMap[o.name] || "1 1 1";

          return (
            <a-entity
              key={i}
              gltf-model={`url(${url})`}
              position={pos}
              // Use the corrected rotation
              rotation={rotationCorrection} 
              scale={scale}
              auto-center // Centers and grounds the model
              shadow="cast: true; receive: true"
            />
          );
        })}

        <a-sky color="#151515"></a-sky>
      </a-scene>
    </div>
  );
}
