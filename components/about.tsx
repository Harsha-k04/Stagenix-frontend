"use client"

import { useEffect, useState } from "react"

export default function About() {
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

    const section = document.getElementById("about-section")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="about-section" className="relative py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />

        <div
          className={`relative z-10 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          <h2 className="font-orbitron text-4xl md:text-5xl font-bold mb-8 text-balance">Why Choose Our Platform?</h2>

          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            This platform bridges creativity and technology. Experience fast concept-to-preview workflows, version
            control, and browser-based AR/VR visualization that transforms how stage design teams collaborate and
            innovate.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { label: "Fast Workflows", value: "10x" },
              { label: "Real-Time Sync", value: "0ms" },
              { label: "Browser Native", value: "100%" },
            ].map((stat, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300"
              >
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
