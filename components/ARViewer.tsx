"use client";

import { useEffect, useRef } from "react";

type StageObject = {
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
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

    const url =
      objects?.length && modelMap[objects[0].name]
        ? modelMap[objects[0].name]
        : "/assets/stage/stage.glb";

    doc.open();
    doc.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>Markerless WebXR</title>

<script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/aframe-extras@6.1.1/dist/aframe-extras.min.js"></script>

<style>
html, body {
  margin:0;
  padding:0;
  overflow:hidden;
}

#hint {
  position: fixed;
  top:12px;
  left:12px;
  z-index: 999;
  background: rgba(0,0,0,0.7);
  color:white;
  padding:8px 12px;
  border-radius:10px;
  font-size:14px;
}
</style>

<script>
AFRAME.registerComponent("auto-center-scale", {
  init: function(){
    this.el.addEventListener("model-loaded", () => {
      const THREE = window.THREE;
      const obj = this.el.getObject3D("mesh");
      if(!obj) return;

      obj.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(obj);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);

      obj.position.sub(center);
      obj.position.y -= box.min.y;

      const max = Math.max(size.x,size.y,size.z);
      const target = 4;   // ~4m real size
      const s = target/max;
      obj.scale.set(s,s,s);
    });
  }
});
</script>

</head>

<body>

<div id="hint">Move phone to scan floor… tap to place</div>

<a-scene
  xr-mode-ui="enabled: true"
  webxr="optionalFeatures: hit-test;"
  renderer="colorManagement: true; physicallyCorrectLights: true;"
  vr-mode-ui="enabled: false"
  embedded
>

  <a-entity camera look-controls></a-entity>

  <!-- Lighting -->
  <a-entity light="type: ambient; intensity: 2"></a-entity>
  <a-entity light="type: directional; intensity: 4" position="5 10 5"></a-entity>

  <!-- Placement reticle -->
  <a-ring
    id="reticle"
    color="yellow"
    radius-inner="0.08"
    radius-outer="0.1"
    visible="false"
    rotation="-90 0 0">
  </a-ring>

  <!-- Model Holder -->
  <a-entity id="placedModel"></a-entity>

</a-scene>

<script>
let xrHitRefSpace;
let viewerSpace;
let placed = false;

const scene = document.querySelector("a-scene");
const reticle = document.getElementById("reticle");
const modelHolder = document.getElementById("placedModel");

scene.renderer.xr.addEventListener("sessionstart", async () => {
  const session = scene.renderer.xr.getSession();
  viewerSpace = await session.requestReferenceSpace("viewer");
  xrHitRefSpace = await session.requestReferenceSpace("local");

  session.requestAnimationFrame(onXRFrame);

  scene.addEventListener("click", () => {
    if (reticle.visible && !placed) {
      placed = true;
      document.getElementById("hint").innerText = "Placed!";
      modelHolder.setAttribute("gltf-model", "${url}");
      modelHolder.setAttribute("auto-center-scale", "");
      modelHolder.setAttribute("position",
        reticle.object3D.position.x + " " +
        reticle.object3D.position.y + " " +
        reticle.object3D.position.z
      );
    }
  });
});

function onXRFrame(t, frame){
  const session = scene.renderer.xr.getSession();
  session.requestAnimationFrame(onXRFrame);

  const results = frame.getHitTestResultsForTransientInput
    ? []
    : frame.getHitTestResults(frame.createHitTestSource
       ? frame.createHitTestSource
       : session.requestHitTestSource);

  const viewerPose = frame.getViewerPose(xrHitRefSpace);
  if (!viewerPose) return;

  const hitTestResults = frame.getHitTestResults(
    frame.createHitTestSource
      ? null
      : session.requestHitTestSource({ space: viewerSpace })
  );

  if (!hitTestResults.length || placed) return;

  const hit = hitTestResults[0];
  const pose = hit.getPose(xrHitRefSpace);

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

  reticle.setAttribute("visible", true);
}
</script>

</body>
</html>`);
    doc.close();
  }, [objects]);

  return (
    <iframe
      ref={iframeRef}
      title="Markerless WebXR"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999,
        border: "none",
      }}
      allow="camera *; microphone *; xr-spatial-tracking *; fullscreen *"
      allowFullScreen
    />
  );
}
