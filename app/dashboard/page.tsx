"use client";

import { useState, useEffect, useRef } from "react";
import TopNavigation from "@/components/top-navigation";
import LeftSidebar from "@/components/left-sidebar";
import MainWorkspace from "@/components/main-workspace";
import RightPanel from "@/components/right-panel";
import BottomStatusBar from "@/components/bottom-status-bar";
import VRViewer from "@/components/VRViewer";
import ARViewer from "@/components/ARViewer";


/* -------------------------------------------
     ⭐ FULL SCREEN WEBXR MARKERLESS AR
------------------------------------------- */
function FullScreenAR({ objects, onExit }: any) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://aframe.io/releases/1.4.0/aframe.min.js";
    script.onload = () => console.log("A-Frame Loaded");
    document.body.appendChild(script);
  }, []);

  const modelUrl =
    objects?.[0]?.glbUrl ||
    "https://stagenix-backend.onrender.com/model/perfect_stage_corrected.glb";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999,
        background: "#000",
      }}
    >
      {/* EXIT BUTTON */}
      <button
        style={{
          position: "absolute",
          top: 14,
          right: 14,
          zIndex: 1000000,
          padding: "10px 14px",
          borderRadius: 10,
          background: "#000000aa",
          color: "white",
          border: "1px solid #444",
        }}
        onClick={onExit}
      >
        Exit AR
      </button>

      <a-scene
        embedded
        vr-mode-ui="enabled: false"
        webxr="mode: immersive-ar; optionalFeatures: hit-test;"
        renderer="
          antialias: true;
          physicallyCorrectLights: true;
          colorManagement: true;
          toneMapping: ACESFilmicToneMapping;
          exposure: 2.5;
        "
      >
        <a-entity camera></a-entity>

        {/* LIGHTING */}
        <a-entity light="type: ambient; intensity: 3"></a-entity>
        <a-entity light="type: hemisphere; intensity: 2.5; color:#ffffff; groundColor:#888888"></a-entity>
        <a-entity light="type: directional; intensity: 4" position="4 8 4"></a-entity>

        {/* RETICLE */}
        <a-ring
          id="reticle"
          radius-inner="0.03"
          radius-outer="0.05"
          material="color: yellow"
          rotation="-90 0 0"
          visible="false"
        ></a-ring>

        {/* MODEL */}
        <a-entity
          id="stageModel"
          gltf-model={`url(${modelUrl})`}
          visible="false"
          scale="0.6 0.6 0.6"
        ></a-entity>

        <a-sky color="#000"></a-sky>

        {/* ⭐ FIXED NEXT.JS SAFE SCRIPT */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
(function(){
  const scene = document.querySelector("a-scene");
  let xrSession = null;
  let viewerSpace = null;
  let hitTestSource = null;

  const reticle = document.getElementById("reticle");
  const model = document.getElementById("stageModel");

  scene.addEventListener("enter-vr", async () => {
    xrSession = scene.renderer.xr.getSession();
    viewerSpace = await xrSession.requestReferenceSpace("viewer");
    hitTestSource = await xrSession.requestHitTestSource({ space: viewerSpace });

    xrSession.addEventListener("select", () => {
      if (!reticle.getAttribute("visible")) return;
      model.setAttribute("position", reticle.getAttribute("position"));
      model.setAttribute("visible", true);
    });

    scene.renderer.xr.addEventListener("sessionend", () => {
      xrSession = null;
      hitTestSource = null;
    });
  });

  scene.addEventListener("loaded", () => {
    scene.renderer.setAnimationLoop((timestamp, frame) => {
      if (!xrSession || !hitTestSource || !frame) return;
      const refSpace = scene.renderer.xr.getReferenceSpace();
      const hits = frame.getHitTestResults(hitTestSource);

      if (hits.length > 0) {
        const pose = hits[0].getPose(refSpace);
        reticle.object3D.position.copy(pose.transform.position);
        reticle.object3D.quaternion.copy(pose.transform.orientation);
        reticle.setAttribute("visible", true);
      } else {
        reticle.setAttribute("visible", false);
      }
    });
  });
})();
          `,
          }}
        />
      </a-scene>
    </div>
  );
}

/* -------------------------------------------
              ORIGINAL DASHBOARD
------------------------------------------- */
export default function Dashboard() {
  const [viewMode, setViewMode] =
    useState<"perspective" | "ar" | "vr">("perspective");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sceneObjects, setSceneObjects] = useState<any[]>([]);

  const rightPanelRef = useRef<any>(null);

  const handleSketchSelected = (file: File) => {
    console.log("Sketch received in Dashboard:", file);
    rightPanelRef.current?.handleSketchUpload(file);
  };

  useEffect(() => {
    fetch("https://stagenix-backend.onrender.com/ping").catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-y-auto flex flex-col">
      {/* Top */}
      <div className="relative z-20 flex items-center justify-between px-6 py-3 shadow-md bg-background/90 backdrop-blur-md border-b border-primary/10">
        <div className="text-xl font-semibold text-primary flex items-center gap-2">
          <div className="bg-primary/20 text-primary px-3 py-1 rounded-lg font-bold">
            AR
          </div>
          <span>AR/VR Stage Studio</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary">Home</a>
          <a href="#" className="hover:text-primary">Create Stage</a>
          <a href="#" className="hover:text-primary">My Projects</a>
          <a href="#" className="hover:text-primary">Collaboration</a>
          <a href="#" className="hover:text-primary">Metrics</a>
          <a href="#" className="hover:text-primary">Profile</a>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setViewMode("perspective")} className="px-3 py-2 bg-primary/20 border border-primary/40 text-primary rounded-lg">
            3D
          </button>
          <button onClick={() => setViewMode("ar")} className="px-3 py-2 bg-primary/20 border border-primary/40 text-primary rounded-lg">
            AR
          </button>
          <button onClick={() => setViewMode("vr")} className="px-3 py-2 bg-primary/20 border border-primary/40 text-primary rounded-lg">
            VR
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row flex-1">
        <div className="lg:w-[70px] shrink-0 border-r border-primary/10 bg-card/20">
          <LeftSidebar onSketchSelected={handleSketchSelected} />
        </div>

        <div className="flex-1 flex flex-col md:flex-row">
          <div className="flex-1 relative min-h-[600px] p-2">
            {viewMode === "ar" ? (
              <ARViewer objects={sceneObjects} />
            ) : viewMode === "vr" ? (
              <VRViewer objects={sceneObjects} />
            ) : (
              <MainWorkspace
                viewMode={viewMode}
                setViewMode={setViewMode}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                sceneObjects={sceneObjects}
              />
            )}
          </div>

          <div className="w-full md:w-[370px] border-l border-primary/20 bg-card/30">
            <RightPanel
              ref={rightPanelRef}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              setSceneObjects={setSceneObjects}
            />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 bg-background border-t border-primary/10">
        <BottomStatusBar />
      </div>
    </div>
  );
}
