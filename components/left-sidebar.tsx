"use client"

import { useRef } from "react"
import { Plus, Save, Download, Eye, Settings } from "lucide-react"

export default function LeftSidebar() {
  const fileInputRef = useRef(null)

  const menuItems = [
    { icon: Plus, label: "Upload Sketch", color: "text-primary", upload: true },
    { icon: Save, label: "Saved Versions", color: "text-primary" },
    { icon: Download, label: "Export Scene", color: "text-primary" },
    { icon: Eye, label: "AR/VR Preview", color: "text-primary" },
    { icon: Settings, label: "Settings", color: "text-muted-foreground" },
  ]

  // When user selects a file
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log("📁 File uploaded:", file)

    // TODO: send to backend or store globally
    // Example:
    // uploadSketch(file)
  }

  return (
    <aside className="w-20 glass border-r border-white/10 flex flex-col items-center py-6 gap-6">
      {menuItems.map((item, index) => {
        const Icon = item.icon

        return (
          <div key={index} className="relative">
            {/* Hidden file input for ONLY the first button */}
            {item.upload && (
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
            )}

            {/* Existing button (unchanged visually) */}
            <button
              className={`p-3 rounded-lg glass border border-white/10 hover:border-primary/50 transition-all duration-300 group relative ${item.color}`}
              title={item.label}
              onClick={() => {
                if (item.upload) fileInputRef.current.click()
              }}
            >
              <Icon className="w-5 h-5" />
              <div className="absolute left-full ml-2 px-2 py-1 bg-card text-card-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {item.label}
              </div>
            </button>
          </div>
        )
      })}
    </aside>
  )
}
