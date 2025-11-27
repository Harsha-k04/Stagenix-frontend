"use client"

import AuthForm from "@/components/auth-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full bg-background overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e4b343" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="grid-fade" />
        </svg>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <AuthForm />
      </div>
    </div>
  )
}
