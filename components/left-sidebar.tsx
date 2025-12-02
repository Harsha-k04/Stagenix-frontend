"use client"

import { Plus, Save, Download, Eye, Settings } from "lucide-react"
import { useRef } from "react"

export default function LeftSidebar({ onSketchSelected }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) onSketchSelected(file)
  }

  return (
    <aside className="w-20 glass border-r border-white/10 flex flex-col items-center py-6 gap-6">

      {/* hidden upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* PLUS BUTTON */}
      <button
        onClick={handleFileClick}
        className="p-3 rounded-lg glass border border-white/10 hover:border-primary/50 transition-all duration-300 group relative text-primary"
        title="Upload Sketch"
      >
        <Plus className="w-5 h-5" />
      </button>

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
