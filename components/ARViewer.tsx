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

    const modelMap: Record<
      string,
      { src: string; scale: string; position: string }
    > = {
      pottedplant: { src: "/assets/pottedplant/scene.glb", scale: "1 1 1", position: "0 0 0" },
      vase: { src: "/assets/vase/scene.glb", scale: "1 1 1", position: "0 0 0" },
      wedding: {
        src: "https://stagenix-backend.onrender.com/model/perfect_stage_corrected.glb",
        scale: "1 1 1",
        position: "0 0 0",
      },
      stage: { src: "/assets/stage/stage.glb", scale: "1 1 1", position: "0 0 0" },
    };

    const entityStrings = (objects || [])
      .filter((o) => modelMap[o.name])
      .map((o, i) => {
        const pos = `${o.position[0]} ${o.position[1]} ${o.position[2]}`;
        const rot = `${o.rotation[0]} ${o.rotation[1]} ${o.rotation[2]}`;

        return `<a-entity 
          id="obj-${i}"
          gltf-model="#asset-${i}"
          crossorigin="anonymous"

          position="${pos}"
          rotation="${rot}"

          auto-center           <!-- ⭐ Same VR logic -->
        ></a-entity>`;
      })
      .join("\n");

    const fallbackHTML = `<a-entity position="0 0 -1">
      <a-text value="No compatible models found" color="#fff" align="center"></a-text>
    </a-entity>`;

    doc.open();
    doc.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Stagenix AR</title>

<script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.3.2/aframe/build/aframe-ar.min.js"></script>

<style>
html,body{
 margin:0;height:100%;overflow:hidden;background:transparent!important;
}

video,#arjs-video,.a-video{
 position:fixed!important;top:0!important;left:0!important;
 width:100%!important;height:100%!important;object-fit:cover!important;z-index:1!important;
}

a-scene{z-index:2!important;background:transparent!important;}
canvas{background:transparent!important;}

#hint{
 position:absolute;left:10px;top:10px;z-index:9999;
 background:rgba(0,0,0,.65);color:#fff;padding:8px 10px;border-radius:8px;
}
</style>

<script>
AFRAME.registerComponent("auto-center", {
  init: function () {
    this.el.addEventListener("model-loaded", () => {
      const THREE = window.THREE;
      const obj = this.el.getObject3D("mesh");
      if (!obj || !THREE) return;

      obj.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(obj);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();

      box.getSize(size);
      box.getCenter(center);

      // ⭐ Same VR normalization
      obj.position.x -= center.x;
      obj.position.z -= center.z;
      obj.position.y -= box.min.y;

      obj.updateMatrixWorld(true);

      const maxDim = Math.max(size.x, size.y, size.z);
      const TARGET_SIZE = 4;
      const scale = TARGET_SIZE / maxDim;

      this.el.setAttribute("scale", scale + " " + scale + " " + scale);

      console.log("✔ AR model normalized same as VR");
    });
  }
});
</script>

</head>
<body>

<div id="hint">Point camera at the Hiro marker</div>

<a-scene
 embedded
 vr-mode-ui="enabled:false"
 renderer="
   alpha:true;
   antialias:true;
   physicallyCorrectLights:true;
   colorManagement:true;
   toneMapping:ACESFilmicToneMapping;
   exposure:3.0;
"
 arjs="trackingMethod: best; sourceType: webcam; debugUIEnabled:false;"
>

<a-assets timeout="30000">
${(objects || [])
  .filter(o => modelMap[o.name])
  .map((o, i) => `<a-asset-item id="asset-${i}" src="${modelMap[o.name].src}" crossorigin="anonymous"></a-asset-item>`)
  .join("\n")}
</a-assets>

<a-marker preset="hiro" id="hiroMarker">
  <a-entity>
    ${entityStrings || fallbackHTML}
  </a-entity>
</a-marker>

<a-entity camera></a-entity>

<!-- ⭐ EXACT VR LIGHTING -->
<a-entity light="type: ambient; intensity: 3"></a-entity>
<a-entity light="type: hemisphere; intensity: 2.5; color: #ffffff; groundColor: #888888"></a-entity>
<a-entity light="type: directional; intensity: 4" position="6 12 10" castShadow="true"></a-entity>
<a-entity light="type: point; intensity: 3; distance: 120" position="0 6 10"></a-entity>

</a-scene>

<script>
setTimeout(()=>{
 const marker=document.getElementById("hiroMarker");
 if(!marker) return;

 marker.addEventListener("markerFound",()=>{document.getElementById("hint").innerText="Marker detected";});
 marker.addEventListener("markerLost",()=>{document.getElementById("hint").innerText="Point camera at Hiro marker";});
},1200);
</script>

</body>
</html>`);
    doc.close();
  }, [objects]);

  return (
    <iframe
      ref={iframeRef}
      title="AR Viewer"
      className="border-none"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999,
      }}
      allow="camera *; microphone *; xr-spatial-tracking *; fullscreen *"
      allowFullScreen
      referrerPolicy="no-referrer"
      sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms allow-popups allow-popups-to-escape-sandbox"
    />
  );
}
