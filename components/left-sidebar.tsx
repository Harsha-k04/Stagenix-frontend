"use client"

import { Plus, Save, Download, Eye, Settings } from "lucide-react"
import { useRef } from "react"

export default function LeftSidebar() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileClick = () => {
    fileInputRef.current?.click()   // opens upload dialog
  }

  return (
    <aside className="w-20 glass border-r border-white/10 flex flex-col items-center py-6 gap-6">
      
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        id="sketchUpload"
      />

      {/* THE PLUS BUTTON → triggers file upload */}
      <button
        onClick={handleFileClick}
        className="p-3 rounded-lg glass border border-white/10 hover:border-primary/50 transition-all duration-300 group relative text-primary"
        title="Upload Sketch"
      >
        <Plus className="w-5 h-5" />
        <div className="absolute left-full ml-2 px-2 py-1 bg-card text-card-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Upload Sketch
        </div>
      </button>

      {/* Other sidebar buttons remain unchanged */}
      {[Save, Download, Eye, Settings].map((Icon, index) => (
        <button
          key={index}
          className="p-3 rounded-lg glass border border-white/10 hover:border-primary/50 transition-all duration-300 group relative text-primary"
        >
          <Icon className="w-5 h-5" />
        </button>
      ))}

    </aside>
  )
}
