"use client"

import { useState } from "react"
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface RegisterFormProps {
  setIsLogin?: (value: boolean) => void  // optional for standalone page
}

export default function RegisterForm({ setIsLogin }: RegisterFormProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Add display name
      await updateProfile(userCredential.user, { displayName: fullName })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (err: any) {
      // Friendlier error messages
      if (err.code === "auth/email-already-in-use") setError("This email is already registered.")
      else if (err.code === "auth/invalid-email") setError("Invalid email address.")
      else if (err.code === "auth/weak-password") setError("Password should be at least 6 characters.")
      else setError("Signup failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-3 w-5 h-5 text-primary/60" />
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className="w-full bg-secondary/50 border border-primary/20 rounded-lg pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
            required
          />
        </div>
      </div>

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

      <div className="relative">
        <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 w-5 h-5 text-primary/60" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-secondary/50 border border-primary/20 rounded-lg pl-10 pr-10 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-primary/60 hover:text-primary transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center border border-red-200 bg-red-50 py-1 rounded">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            Creating Account...
          </>
        ) : (
          "Create Account"
        )}
      </button>

      {setIsLogin && (
        <p className="text-center text-muted-foreground text-sm">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Sign In
          </button>
        </p>
      )}
    </form>
  )
}
