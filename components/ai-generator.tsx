"use client"

import { useState } from "react"
import { Upload, Sparkles } from "lucide-react"

interface AIGeneratorProps {
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
}

export default function AIGenerator({ isGenerating, setIsGenerating }: AIGeneratorProps) {
  const [description, setDescription] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)

  const handleGenerate = () => {
    if (description.trim()) {
      setIsGenerating(true)
      setTimeout(() => setIsGenerating(false), 2000)
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Description Input */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Scene Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your stage design... e.g., 'Futuristic concert stage with holographic elements and dynamic lighting'"
          className="w-full h-24 px-3 py-2 bg-input border border-white/10 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Reference Image</label>
        <div className="border-2 border-dashed border-white/20 rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer group">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="cursor-pointer">
            <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
            <p className="text-xs text-muted-foreground">
              {imageFile ? imageFile.name : "Click to upload or drag and drop"}
            </p>
          </label>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !description.trim()}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Sparkles className="w-4 h-4" />
        {isGenerating ? "Generating..." : "Generate with AI"}
      </button>

      {/* Quick Presets */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Quick Presets</p>
        <div className="grid grid-cols-2 gap-2">
          {["Concert", "Theater", "Corporate", "Festival"].map((preset) => (
            <button
              key={preset}
              onClick={() => setDescription(preset)}
              className="px-3 py-2 text-xs bg-white/5 border border-white/10 rounded hover:border-primary/50 hover:bg-primary/10 transition-all duration-300"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
