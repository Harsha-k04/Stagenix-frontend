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
                // FIX: Added small lift for visibility above the ground plane.
                mesh.position.y = -box.min.y + 0.005; 
                mesh.position.z = -center.z; 
                
                console.log("✅ Auto-centered model in VR, with a small lift.");
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
    // Extreme 1000x scaling reduction for the giant stage model. 
    wedding: "0.001 0.001 0.001", 
    stage: "1 1 1",
  };

  // ⭐ CRITICAL CHANGE: Removing Z_OFFSET and relying only on camera position.
  const Z_OFFSET = 0; 
  // ⭐ CRITICAL ADJUSTMENT: Camera Z position pushed back to 50 meters, pointing toward Z=0.
  const INITIAL_CAMERA_Z = 50; 
  const INITIAL_CAMERA_Y = 2; 

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
        {/* Camera positioned far back (Z=50) looking towards the origin (0, 0, 0) */}
        <a-entity id="cameraRig" position={`0 ${INITIAL_CAMERA_Y} ${INITIAL_CAMERA_Z}`}> 
          <a-camera 
            look-controls 
            wasd-controls
            // Set far clipping plane high
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

          // ⭐ CRITICAL CHANGE: Use the object's original position, 
          // but without the Z_OFFSET, forcing it close to the origin (0, 0, 0).
          // The camera at Z=50 will now be looking directly at this object.
          const pos = `${o.position[0]} ${o.position[1]} ${o.position[2]}`;
          
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
              auto-center // Centers and grounds the model (now with a small lift)
              shadow="cast: true; receive: true"
            />
          );
        })}

        <a-sky color="#151515"></a-sky>
      </a-scene>
    </div>
  );
}
