"use client";

import { useEffect, useRef } from "react";

type StageObject = {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  glbUrl?: string;
};

export default function ARViewer({ objects }: { objects: StageObject[] }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const doc =
      iframeRef.current.contentDocument ||
      iframeRef.current.contentWindow?.document;
    if (!doc) return;

    const modelMap: Record<string, string> = {
      pottedplant: "/assets/pottedplant/scene.glb",
      vase: "/assets/vase/scene.glb",
      stage: "/assets/stage/stage.glb",
      wedding:
        "https://stagenix-backend.onrender.com/model/perfect_stage_corrected.glb",
    };

    const modelUrl =
      objects?.[0]?.glbUrl ||
      (objects?.length && modelMap[objects[0].name]) ||
      "https://stagenix-backend.onrender.com/model/perfect_stage_corrected.glb";

    doc.open();
    doc.write(`
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.3.2/aframe/build/aframe-ar.min.js"></script>

<style>
html,body{margin:0;padding:0;background:#000;overflow:hidden}
#hint{
 position:fixed;top:10px;left:10px;
 background:rgba(0,0,0,.7);color:#fff;
 padding:8px 12px;border-radius:10px;z-index:10000;
 font-family:Arial;font-size:14px;
}
</style>

<script>
AFRAME.registerComponent("auto-center-scale",{
 init(){
  this.el.addEventListener("model-loaded",()=>{
   const THREE = window.THREE;
   const obj = this.el.getObject3D("mesh");
   if(!obj) return;

   obj.updateMatrixWorld(true);
   const box=new THREE.Box3().setFromObject(obj);
   const size=new THREE.Vector3();
   const center=new THREE.Vector3();
   box.getSize(size);
   box.getCenter(center);

   obj.position.sub(center);
   obj.position.y -= box.min.y;

   const s = 3 / Math.max(size.x,size.y,size.z);
   obj.scale.set(s,s,s);
  })
 }
});
</script>

</head>
<body>

<div id="hint">Checking AR support...</div>

<script>

function loadMarkerFallback(){
 document.body.innerHTML += \`
 <div id="hint">Point camera at Hiro marker</div>

 <a-scene
   embedded
   vr-mode-ui="enabled:false"
   renderer="alpha:true; antialias:true;"
   arjs="trackingMethod: best; sourceType: webcam; debugUIEnabled:false;"
 >
   <a-assets timeout="25000">
     <a-asset-item id="model" src="${modelUrl}" crossorigin="anonymous"></a-asset-item>
   </a-assets>

   <a-marker preset="hiro">
     <a-entity gltf-model="#model" auto-center-scale></a-entity>
   </a-marker>

   <a-entity camera></a-entity>
   <a-entity light="type: ambient; intensity: 2.5"></a-entity>
   <a-entity light="type: directional; intensity: 4" position="4 8 4"></a-entity>
 </a-scene>
 \`;
}

(async function(){

 if(!navigator.xr){ loadMarkerFallback(); return; }

 let supports=false;
 try{
   supports = await navigator.xr.isSessionSupported("immersive-ar");
 }catch(e){supports=false;}

 if(!supports){ loadMarkerFallback(); return; }

 document.getElementById("hint").innerText="Starting AR...";

 let fallbackTimeout=setTimeout(()=>loadMarkerFallback(),6000);

 document.body.innerHTML += \`
 <a-scene
   xr-mode-ui="enabled:true"
   webxr="optionalFeatures: hit-test;"
   embedded
   renderer="physicallyCorrectLights:true; colorManagement:true;"
 >
   <a-entity light="type: ambient; intensity: 2"></a-entity>
   <a-entity light="type: directional; intensity: 4" position="5 10 5"></a-entity>

   <a-camera></a-camera>

   <a-ring id="reticle"
     visible="false"
     radius-inner="0.07"
     radius-outer="0.09"
     rotation="-90 0 0"
     color="yellow">
   </a-ring>

   <a-entity id="modelHolder"></a-entity>
 </a-scene>
 \`;

 const scene = document.querySelector("a-scene");

 scene.addEventListener("loaded",()=>{
   try{
     scene.enterVR();   // ⭐ FORCE START AR SESSION
   }catch(e){}
 });

 scene.renderer.xr.addEventListener("sessionstart",()=>{
   clearTimeout(fallbackTimeout);
   document.getElementById("hint").innerText="Move phone to find surface, tap to place";
 });

 scene.renderer.xr.addEventListener("sessionend",()=>loadMarkerFallback());

 let hitTestSource=null;
 let localSpace=null;
 let placed=false;

 const reticle=document.getElementById("reticle");
 const holder=document.getElementById("modelHolder");

 scene.renderer.xr.addEventListener("sessionstart", async ()=>{
   try{
     const session=scene.renderer.xr.getSession();
     const viewer=await session.requestReferenceSpace("viewer");
     hitTestSource=await session.requestHitTestSource({space:viewer});
     localSpace=await session.requestReferenceSpace("local");

     session.addEventListener("select",()=>{
       if(!placed && reticle.getAttribute("visible")){
         placed=true;
         holder.setAttribute("gltf-model","${modelUrl}");
         holder.setAttribute("auto-center-scale","");
         holder.object3D.position.copy(reticle.object3D.position);
         document.getElementById("hint").innerText="Placed!";
       }
     });

     session.requestAnimationFrame(onXRFrame);
   }catch(e){
     loadMarkerFallback();
   }
 });

 function onXRFrame(t,frame){
   const session=scene.renderer.xr.getSession();
   session.requestAnimationFrame(onXRFrame);

   if(!hitTestSource||!localSpace) return;

   const hits=frame.getHitTestResults(hitTestSource);
   if(!hits.length) return;

   const pose=hits[0].getPose(localSpace);

   reticle.object3D.position.set(
     pose.transform.position.x,
     pose.transform.position.y,
     pose.transform.position.z
   );

   reticle.object3D.quaternion.set(
     pose.transform.orientation.x,
     pose.transform.orientation.y,
     pose.transform.orientation.z,
     pose.transform.orientation.w
   );

   reticle.setAttribute("visible",!placed);
 }

})();
</script>

</body>
</html>
`);
    doc.close();
  }, [objects]);

  return (
    <iframe
      ref={iframeRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        border: "none",
        zIndex: 99999,
      }}
      allow="camera *; microphone *; xr-spatial-tracking *; fullscreen *"
      allowFullScreen
    />
  );
}
