"use client"

import { Menu } from "lucide-react"

export default function TopNavigation() {
  const menuItems = ["Home", "Create Stage", "My Projects", "Collaboration", "Metrics", "Profile"]

  return (
    <nav className="glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center glow-golden">
          <span className="text-primary-foreground font-bold text-sm">AR</span>
        </div>
        <h1 className="text-xl font-bold text-foreground">AR/VR Stage Studio</h1>
      </div>

      {/* Menu Links */}
      <div className="hidden md:flex items-center gap-8">
        {menuItems.map((item) => (
          <a
            key={item}
            href="#"
            className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 relative group"
          >
            {item}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
          </a>
        ))}
      </div>

      {/* Mobile Menu */}
      <button className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors">
        <Menu className="w-5 h-5" />
      </button>
    </nav>
  )
}
