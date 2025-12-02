"use client"

import { Plus, Save, Download, Eye, Settings } from "lucide-react"
import { useRef } from "react"

export default function LeftSidebar() {

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: any) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("sketch", file)

    const res = await fetch("/api/upload-sketch", {
      method: "POST",
      body: formData,
    })

    const result = await res.json()
    console.log("Processed:", result)
  }

  const menuItems = [
    {
      icon: Plus,
      label: "New Project",
      color: "text-primary",
      onClick: () => fileInputRef.current?.click(), // opens file dialog
    },
    { icon: Save, label: "Saved Versions", color: "text-primary" },
    { icon: Download, label: "Export Scene", color: "text-primary" },
    { icon: Eye, label: "AR/VR Preview", color: "text-primary" },
    { icon: Settings, label: "Settings", color: "text-muted-foreground" },
  ]

  return (
    <aside className="w-20 glass border-r border-white/10 flex flex-col items-center py-6 gap-6">

      {/* hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {menuItems.map((item, index) => {
        const Icon = item.icon
        return (
          <button
            key={index}
            onClick={item.onClick}
            className={`p-3 rounded-lg glass border border-white/10 hover:border-primary/50 transition-all duration-300 group relative ${item.color}`}
            title={item.label}
          >
            <Icon className="w-5 h-5" />
            <div className="absolute left-full ml-2 px-2 py-1 bg-card text-card-foreground text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {item.label}
            </div>
          </button>
        )
      })}
    </aside>
  )
}
