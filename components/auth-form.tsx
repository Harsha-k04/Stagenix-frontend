"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import LoginForm from "./login-form"
import RegisterForm from "./register-form"

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8 float-up">
        <h1 className="text-4xl font-bold text-primary mb-2">AR/VR Stage Studio</h1>
        <p className="text-muted-foreground text-sm">Enter the Creative Workspace</p>
      </div>

      <div className="glass-effect-strong rounded-2xl p-8 glow-pulse">
        <div className="flex gap-2 mb-8 bg-secondary/50 p-1 rounded-lg">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 font-medium ${
              isLogin
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-md transition-all duration-300 font-medium ${
              !isLogin
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/50"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Register
          </button>
        </div>

        <div className="transition-all duration-300">
          {isLogin ? <LoginForm setIsLogin={setIsLogin} /> : <RegisterForm setIsLogin={setIsLogin} />}
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
          <div className="glass-effect rounded-2xl p-8 text-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-foreground font-medium">Entering Creative Workspace...</p>
          </div>
        </div>
      )}
    </div>
  )
}
