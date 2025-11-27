"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function CTA() {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const section = document.getElementById("cta-section")
    if (section) observer.observe(section)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="cta-section" className="relative py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Gradient orbs */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

        <div
          className={`relative z-10 text-center transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="font-orbitron text-4xl md:text-5xl font-bold mb-4 text-balance">
            Start Designing Smarter Today
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the next generation of AI-powered designers.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.push("/login")}
              className="btn-glow"
            >
              Login
            </button>
            <button
              onClick={() => router.push("/register")}
              className="btn-outline"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
