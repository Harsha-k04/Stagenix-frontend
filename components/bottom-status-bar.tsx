"use client"

import { useState, useEffect } from "react"

export default function BottomStatusBar() {
  const [metrics, setMetrics] = useState({
    latency: 45,
    stability: 99.8,
    loadTime: 234,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        latency: Math.floor(Math.random() * 100) + 20,
        stability: 99 + Math.random(),
        loadTime: Math.floor(Math.random() * 300) + 100,
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="glass border-t border-white/10 px-6 py-3">
      {/* Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 gradient-line"></div>

      {/* Metrics */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Generation Latency:</span>
            <span className="text-primary font-semibold">{metrics.latency}ms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Session Stability:</span>
            <span className="text-primary font-semibold">{metrics.stability.toFixed(1)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Asset Load Time:</span>
            <span className="text-primary font-semibold">{metrics.loadTime}ms</span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-muted-foreground">System Online</span>
        </div>
      </div>
    </div>
  )
}
