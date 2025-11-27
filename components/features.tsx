"use client"

import { useEffect, useState } from "react"
import { Cpu, Users, Headset } from "lucide-react"

const features = [
  {
    icon: Cpu,
    title: "AI-Generated Design",
    description: "Convert sketches and text into intelligent 3D stage setups using AI-assisted asset assembly.",
  },
  {
    icon: Users,
    title: "Real-Time Collaboration",
    description: "Multi-user creative workspace with live comments and synchronized design sessions.",
  },
  {
    icon: Headset,
    title: "Immersive AR/VR Preview",
    description: "Preview your stage designs in full 360° AR and VR using WebXR — right in your browser.",
  },
]

export default function Features() {
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

    const section = document.getElementById("features-section")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="features-section" className="relative py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-orbitron text-4xl md:text-5xl font-bold mb-4 text-balance">Platform Highlights</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-transparent mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className={`group relative p-8 rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{
                  transitionDelay: isVisible ? `${index * 100}ms` : "0ms",
                }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/40 transition-colors duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>

                  <h3 className="font-orbitron text-xl font-bold mb-3 text-foreground">{feature.title}</h3>

                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
