"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "./auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Loader2, Shield, Clock, User, Eye, EyeOff } from "lucide-react"
import { SecurityVerification } from "./security-verification"

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [securityVerified, setSecurityVerified] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleSecurityVerify = (isValid: boolean) => {
    setSecurityVerified(isValid)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!securityVerified) {
      return
    }

    setIsLoading(true)

    console.log("Login form: Submitting with", { username, password: "***", securityVerified })

    try {
      const result = await login(username, password)

      if (result.success) {
        console.log("SUCCESS: Login successful")
      } else {
        console.log("ERROR: Login failed:", result.error)
        router.push("/login-error")
      }
    } catch (error) {
      console.error("Login form error:", error)
      router.push("/login-error")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="w-full max-w-md space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-primary rounded-2xl shadow-strong">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Library Management System</h1>
            <p className="text-lg text-gray-600 font-medium">Institutional Access Portal</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-strong border border-gray-200/50 bg-white/80 backdrop-blur-sm animate-scale-in">
          <CardHeader className="text-center pb-8 pt-8">
            <CardTitle className="text-2xl font-bold text-gray-900 tracking-tight">User Authentication</CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Please enter your credentials to access the library system
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Username Field */}
              <div className="space-y-3">
                <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="Enter your username"
                    className="h-12 pl-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-soft transition-all-smooth"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="Enter your password"
                    className="h-12 pl-12 pr-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl shadow-soft transition-all-smooth"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors-smooth"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Security Verification */}
              <div className="border-t border-gray-200 pt-8">
                <SecurityVerification onVerify={handleSecurityVerify} disabled={isLoading} />
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-primary hover:shadow-medium text-white font-semibold rounded-xl transition-all-smooth"
                disabled={isLoading || !securityVerified}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-5 w-5" />
                    Sign In
                  </>
                )}
              </Button>

              {/* Session Information */}
              <div className="bg-blue-50/50 border border-blue-200/50 p-6 rounded-xl shadow-soft">
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-4">
                  <Clock className="h-4 w-4" />
                  <span>Session Information</span>
                </div>
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span className="font-medium">Session Duration:</span>
                    <span className="font-semibold">10 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Auto-logout:</span>
                    <span className="font-semibold">On inactivity</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Security:</span>
                    <span className="font-semibold">Encrypted connection</span>
                  </div>
                </div>
              </div>

              {/* Security Status */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600 font-medium">
                <Shield className="h-4 w-4" />
                <span>Secure Authentication System</span>
                {securityVerified && <span className="text-green-700 font-semibold ml-2">✓ Verified</span>}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 font-medium animate-fade-in">
          <p className="font-semibold">Library Management System</p>
          <p className="mt-1">Secure Access Portal</p>
        </div>
      </div>
    </div>
  )
}
