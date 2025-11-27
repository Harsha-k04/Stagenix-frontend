"use client"

import { useEffect, useState } from "react"

export default function Hero() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay opacity-20" />

      {/* Gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div
          className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h1 className="font-orbitron text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight">
            <span className="text-foreground">AI-Based</span>
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AR/VR Stage Design
            </span>
            <br />
            <span className="text-foreground">Platform</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
            Turn sketches and text prompts into immersive 3D stage designs — right in your browser.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="btn-glow animate-slide-up">Get Started</button>
            <button className="btn-outline animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Watch Demo
            </button>
          </div>
        </div>

        {/* 3D rotating stage model placeholder */}
        <div
          className={`mt-20 transition-all duration-1000 ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        >
          <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-transparent rounded-2xl animate-rotate-slow" />
            <div
              className="absolute inset-4 bg-gradient-to-tr from-primary/20 to-transparent rounded-2xl animate-rotate-slow"
              style={{ animationDirection: "reverse", animationDuration: "25s" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full animate-float" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
