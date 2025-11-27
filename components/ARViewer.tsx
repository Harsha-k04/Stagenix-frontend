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

    // Model map (unchanged except scale fixes)
    const modelMap: Record<string, { src: string; scale: string }> = {
      pottedplant: {
        src: "/assets/pottedplant/scene.glb",
        scale: "0.8 0.8 0.8",
      },
      vase: {
        src: "/assets/vase/scene.glb",
        scale: "1.8 1.8 1.8",
      },
      wedding: {
        src: "/assets/wedding_stage/wedding_stage_shape.glb",
        scale: "1.8 1.8 1.8",
      },
      stage: {
        src: "/assets/stage/stage.glb",
        scale: "1.8 1.8 1.8",
      },
    };

    // Build A-Frame entities
    const entityStrings = (objects || [])
      .filter((o) => modelMap[o.name])
      .map((o, i) => {
        const map = modelMap[o.name];

        const pos = `${o.position[0]} ${o.position[1]} ${o.position[2]}`;
        const rot = `${o.rotation[0]} ${o.rotation[1]} ${o.rotation[2]}`;

        return `<a-entity 
                  id="obj-${i}"
                  gltf-model="url(${map.src})"
                  position="${pos}"
                  rotation="${rot}"
                  scale="${map.scale}"
                  gesture-detector
                ></a-entity>`;
      })
      .join("\n");

    const fallbackHTML = `<a-entity position="0 0 -1">
      <a-text value="No compatible models found" color="#fff" align="center"></a-text>
    </a-entity>`;

    // Build the full AR iframe document
    doc.open();
    doc.write(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Stagenix AR</title>

<!-- A-Frame + AR.js -->
<script src="https://aframe.io/releases/1.2.0/aframe.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/AR-js-org/AR.js@3.3.2/aframe/build/aframe-ar.min.js"></script>

<script>
  function showHint(msg) {
    const el = document.getElementById('hint');
    if (el) el.innerText = msg;
  }
</script>

<style>
  html, body {
    margin:0;
    padding:0;
    width:100%;
    height:100%;
    background:#000;
    overflow:hidden;
  }
  a-scene {
    width:100vw;
    height:100vh;
  }
  #hint {
    position: absolute;
    z-index: 9999;
    left: 10px;
    top: 10px;
    background: rgba(0,0,0,0.6);
    color: #fff;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 13px;
    font-family: system-ui, sans-serif;
  }
  #hiroWrap { 
    position: absolute;
    right: 12px;
    bottom: 12px;
    z-index:9999;
    background: rgba(255,255,255,0.9);
    padding:6px;
    border-radius:6px;
  }
  #hiroWrap img { width: 86px; height:86px; }
</style>
</head>
<body>

<div id="hint">Point camera at the Hiro marker</div>

<div id="hiroWrap">
  <div style="font-size:11px; text-align:center; margin-bottom:4px;">Hiro marker</div>
  <img src="https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png" />
</div>

<a-scene
  embedded
  vr-mode-ui="enabled: false"
  renderer="logarithmicDepthBuffer: true;"
  arjs="trackingMethod: best; sourceType: webcam; sourceWidth:1280; sourceHeight:720; debugUIEnabled:false;"
>
  <a-assets>
    ${Object.values(modelMap)
      .map(
        (m) =>
          `<a-asset-item id="${m.src}" src="${m.src}"></a-asset-item>`
      )
      .join("\n")}
  </a-assets>

  <a-marker preset="hiro" emitevents="true" id="hiroMarker">
    <a-entity id="markerObjects">
      ${entityStrings || fallbackHTML}
    </a-entity>
  </a-marker>

  <a-entity camera></a-entity>
</a-scene>

<script>
  navigator.mediaDevices?.getUserMedia({ video: true })
    .then(s => { 
      s.getTracks().forEach(t=>t.stop());
      showHint('Point camera at the Hiro marker');
    })
    .catch(e => { 
      showHint('Camera blocked. Enable camera & reload.');
    });

  setTimeout(() => {
    const marker = document.getElementById('hiroMarker');
    if (marker) {
      marker.addEventListener('markerFound', () =>
        document.getElementById('hint').innerText = 'Marker detected'
      );
      marker.addEventListener('markerLost', () =>
        document.getElementById('hint').innerText = 'Marker lost'
      );
    }
  }, 1500);
</script>

</body>
</html>`);
    doc.close();
  }, [objects]);

  return (
    <iframe
      ref={iframeRef}
      title="AR Viewer"
      className="w-full h-full border-none rounded-lg"
      allow="camera; microphone; accelerometer; gyroscope; encrypted-media; xr-spatial-tracking; fullscreen"
      allowFullScreen
      referrerPolicy="no-referrer"
      sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-modals"
    />
  );
}
