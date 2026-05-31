"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { AuthShell } from "@/components/auth/AuthShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoogleLogin } from "@/components/GoogleLogin"
import { Loader2, Eye, EyeOff, User, Mail, Lock, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const router = useRouter()

  const getPasswordStrength = () => {
    if (password.length < 6) return { strength: 0, text: "Too short", color: "bg-red-500" }
    if (password.length < 8) return { strength: 1, text: "Weak", color: "bg-amber-500" }
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) return { strength: 3, text: "Strong", color: "bg-emerald-500" }
    return { strength: 2, text: "Medium", color: "bg-violet-500" }
  }

  const passwordStrength = getPasswordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }
    if (name.length < 2) {
      setError("Name must be at least 2 characters")
      return
    }

    setLoading(true)
    const result = await register(name, email, password)
    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error || "Registration failed")
    }
    setLoading(false)
  }

  return (
    <AuthShell
      accent="emerald"
      title="Create your account"
      subtitle="Start your expense tracking journey in seconds"
      heroTitle="Start your financial journey"
      heroSubtitle="Join thousands who've taken control of their expenses with Budget Baba."
      features={[
        { icon: CheckCircle2, title: "Free forever", description: "No credit card, no hidden fees" },
        { icon: CheckCircle2, title: "AI categorization", description: "Smart expense sorting out of the box" },
        { icon: CheckCircle2, title: "Beautiful insights", description: "Charts, budgets, and goal tracking" },
      ]}
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerHref="/auth/login"
    >
      <GoogleLogin />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider">
          <span className="bg-card px-3 text-muted-foreground">or sign up with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className="input-brand pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="input-brand pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="input-brand pl-10 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Password strength</span>
                <span className={passwordStrength.strength >= 2 ? "text-emerald-600" : "text-amber-600"}>
                  {passwordStrength.text}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="input-brand pl-10 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-xs text-destructive">Passwords do not match</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 brand-btn mt-2"
          disabled={loading || password !== confirmPassword}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </AuthShell>
  )
}
