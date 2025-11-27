"use client";

import { useState } from "react";
import TopNavigation from "@/components/top-navigation";
import LeftSidebar from "@/components/left-sidebar";
import MainWorkspace from "@/components/main-workspace";
import RightPanel from "@/components/right-panel";
import BottomStatusBar from "@/components/bottom-status-bar";
import ARViewer from "@/components/ARViewer";
import VRViewer from "@/components/VRViewer";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<"perspective" | "ar" | "vr">("perspective");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sceneObjects, setSceneObjects] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-y-auto flex flex-col">
      {/* Top Navigation */}
      <div className="relative z-20 flex items-center justify-between px-6 py-3 shadow-md bg-background/90 backdrop-blur-md border-b border-primary/10">
        
        {/* Logo */}
        <div className="text-xl font-semibold text-primary flex items-center gap-2">
          <div className="bg-primary/20 text-primary px-3 py-1 rounded-lg font-bold">AR</div>
          <span>AR/VR Stage Studio</span>
        </div>

        {/* Navbar menu */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">Home</a>
          <a href="#" className="hover:text-primary transition-colors">Create Stage</a>
          <a href="#" className="hover:text-primary transition-colors">My Projects</a>
          <a href="#" className="hover:text-primary transition-colors">Collaboration</a>
          <a href="#" className="hover:text-primary transition-colors">Metrics</a>
          <a href="#" className="hover:text-primary transition-colors">Profile</a>
        </div>

        {/* Right: Mode Select Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("perspective")}
            className="px-3 py-2 bg-primary/20 border border-primary/40 text-primary rounded-lg hover:bg-primary/30"
          >
            3D
          </button>

          <button
            onClick={() => setViewMode("ar")}
            className="px-3 py-2 bg-primary/20 border border-primary/40 text-primary rounded-lg hover:bg-primary/30"
          >
            AR
          </button>

          <button
            onClick={() => setViewMode("vr")}
            className="px-3 py-2 bg-primary/20 border border-primary/40 text-primary rounded-lg hover:bg-primary/30"
          >
            VR
          </button>
        </div>
      </div>

      {/* Main Section */}
      <div className="flex flex-col lg:flex-row flex-1">
        
        {/* Sidebar */}
        <div className="lg:w-[70px] shrink-0 border-r border-primary/10 bg-card/20">
          <LeftSidebar />
        </div>

        {/* Workspace */}
        <div className="flex-1 flex flex-col md:flex-row overflow-visible">
          
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

          {/* Right panel */}
          <div className="w-full md:w-[370px] border-l border-primary/20 bg-card/30">
            <RightPanel
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              setSceneObjects={setSceneObjects}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 z-10 bg-background border-t border-primary/10">
        <BottomStatusBar />
      </div>
    </div>
  );
}
