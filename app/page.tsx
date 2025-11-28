"use client"

import { useEffect, useRef } from "react"
import Hero from "@/components/hero"
import Features from "@/components/features"
import About from "@/components/about"
import Showcase from "@/components/showcase"
import CTA from "@/components/cta"
import Footer from "@/components/footer"
import ParticleField from "@/components/particle-field"

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (/Mobi|Android/i.test(navigator.userAgent)) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const x = (e.clientX / window.innerWidth) * 100
      const y = (e.clientY / window.innerHeight) * 100

      containerRef.current.style.setProperty("--mouse-x", `${x}%`)
      containerRef.current.style.setProperty("--mouse-y", `${y}%`)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden bg-background">
      <ParticleField />

      <div className="relative z-10">
        <Hero />
        <Features />
        <About />
        <Showcase />
        <CTA />
        <Footer />
      </div>
    </div>
  )
}
