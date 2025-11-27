"use client"

import { Eye, Headset } from "lucide-react"
import Canvas3D from "./canvas-3d"

interface MainWorkspaceProps {
  viewMode: "perspective" |  "ar" | "vr"
  setViewMode: (mode: "perspective" | "ar" | "vr") => void
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
  sceneObjects: any[]
}

export default function MainWorkspace({
  viewMode,
  setViewMode,
  isGenerating,
  setIsGenerating,
  sceneObjects,
}: MainWorkspaceProps) {
  return (
    <div className="flex-1 relative overflow-hidden">
      {/* 🎨 3D Canvas Area */}
      <Canvas3D objects={sceneObjects} viewMode={viewMode} />

      {/* 👁️ View Mode Buttons (bottom-right) */}
      <div className="absolute bottom-6 right-6 flex gap-3 pointer-events-auto">
        {/* Perspective View */}
        <button
          onClick={() => setViewMode("perspective")}
          className={`p-3 rounded-lg transition-all duration-300 ${
            viewMode === "perspective"
              ? "glass border border-primary/50 bg-primary/10 text-primary"
              : "glass border border-white/10 text-muted-foreground hover:border-primary/30"
          }`}
          title="Perspective View"
        >
          <Eye className="w-5 h-5" />
        </button>

        {/* AR/VR View */}
        <button
          onClick={() => {
            if (viewMode === "perspective") setViewMode("ar")
            else if (viewMode === "ar") setViewMode("vr")
            else setViewMode("perspective")
          }}
          className={`p-3 rounded-lg transition-all duration-300 ${
          viewMode === "ar" || viewMode === "vr"
            ? "glass border border-primary/50 bg-primary/10 text-primary"
            : "glass border border-white/10 text-muted-foreground hover:border-primary/30"
          }`}
          title="AR/VR Preview"
        >
          <Headset className="w-5 h-5" />
        </button>
      </div>

      {/* 🚀 Enter AR/VR Mode Button (top-right) */}
      <div className="absolute top-6 right-6 pointer-events-auto">
        <button className="px-4 py-2 bg-primary/20 border border-primary/50 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-all duration-300 glow-accent">
          Enter AR/VR Mode
        </button>
      </div>
    </div>
  )
}
