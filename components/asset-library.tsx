"use client"

const assets = [
  { id: 1, name: "LED Panel", category: "Lighting", color: "bg-yellow-500/20" },
  { id: 2, name: "Hologram", category: "Effects", color: "bg-cyan-500/20" },
  { id: 3, name: "Stage Riser", category: "Structure", color: "bg-purple-500/20" },
  { id: 4, name: "Spotlight", category: "Lighting", color: "bg-orange-500/20" },
  { id: 5, name: "Smoke Machine", category: "Effects", color: "bg-gray-500/20" },
  { id: 6, name: "Sound System", category: "Audio", color: "bg-blue-500/20" },
]

export default function AssetLibrary() {
  return (
    <div className="p-4 space-y-3">
      {assets.map((asset) => (
        <div
          key={asset.id}
          className={`p-3 rounded-lg border border-white/10 hover:border-primary/50 cursor-pointer transition-all duration-300 group ${asset.color}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{asset.name}</p>
              <p className="text-xs text-muted-foreground">{asset.category}</p>
            </div>
            <div className="w-12 h-12 bg-white/5 rounded border border-white/10 group-hover:border-primary/30 transition-colors"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
