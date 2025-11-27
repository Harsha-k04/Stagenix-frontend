"use client"

import { useEffect, useState } from "react"

export default function Showcase() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const section = document.getElementById("showcase-section")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="showcase-section" className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-orbitron text-4xl md:text-5xl font-bold mb-4 text-balance">Experience 360° Immersion</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Interact with your stage design through a 3D environment powered by Three.js and WebXR.
          </p>
        </div>

        <div
          className={`relative transition-all duration-1000 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          {/* 360 panorama container */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-primary/30 bg-card/50 backdrop-blur-sm">
            {/* Grid floor effect */}
            <div className="absolute inset-0 grid-overlay opacity-30" />

            {/* Floating 3D elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Central rotating element */}
                <div className="absolute w-40 h-40 rounded-full border-2 border-primary/40 animate-rotate-slow" />
                <div
                  className="absolute w-56 h-56 rounded-full border border-primary/20 animate-rotate-slow"
                  style={{ animationDirection: "reverse", animationDuration: "30s" }}
                />

                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-primary/60 animate-float"
                    style={{
                      left: `${50 + 30 * Math.cos((i / 6) * Math.PI * 2)}%`,
                      top: `${50 + 30 * Math.sin((i / 6) * Math.PI * 2)}%`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}

                {/* Center glow */}
                <div className="absolute w-20 h-20 rounded-full bg-primary/30 blur-2xl animate-pulse-glow" />
              </div>
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>

          {/* Info text */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground">Click and drag to explore • Use your VR headset for full immersion</p>
          </div>
        </div>
      </div>
    </section>
  )
}
