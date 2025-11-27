"use client"

import { useState } from "react"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface LoginFormProps {
  setIsLogin?: (value: boolean) => void  // optional (like register-form)
}

export default function LoginForm({ setIsLogin }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/dashboard") // Redirect after login
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") setError("Invalid email or password.")
      else if (err.code === "auth/user-not-found") setError("No account found with this email.")
      else if (err.code === "auth/wrong-password") setError("Incorrect password.")
      else setError("Login failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="relative">
        <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-primary/60" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-secondary/50 border border-primary/20 rounded-lg pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
            required
          />
        </div>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-foreground mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-5 h-5 text-primary/60" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-secondary/50 border border-primary/20 rounded-lg pl-10 pr-10 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-primary/60 hover:text-primary transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center border border-red-200 bg-red-50 py-1 rounded">
          {error}
        </p>
      )}

      <div className="text-right">
        <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
          Forgot Password?
        </a>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </button>

      {setIsLogin && (
        <p className="text-center text-muted-foreground text-sm">
          Don’t have an account?{" "}
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Register
          </button>
        </p>
      )}
    </form>
  )
}
