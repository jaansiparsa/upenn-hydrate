import { Eye, EyeOff, Droplets, Waves } from "lucide-react";
import React, { useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthFormProps {
  mode: "signin" | "signup";
  onToggleMode: () => void;
}

// Water Fountain SVG Icon Component
const FountainIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    fill="currentColor"
  >
    {/* Fountain base */}
    <rect x="30" y="80" width="40" height="15" rx="2" />
    <rect x="25" y="75" width="50" height="10" rx="2" />
    
    {/* Fountain stem */}
    <rect x="47" y="40" width="6" height="35" />
    
    {/* Water streams */}
    <path d="M50 40 Q45 35 40 30 Q42 25 45 20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M50 40 Q50 30 50 20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M50 40 Q55 35 60 30 Q58 25 55 20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    
    {/* Water droplets */}
    <circle cx="45" cy="25" r="1.5" />
    <circle cx="55" cy="28" r="1.5" />
    <circle cx="50" cy="22" r="1.5" />
  </svg>
);

// Floating Water Drop Component
const WaterDrop = ({ delay, duration, x, y }: { delay: number; duration: number; x: number; y: number }) => (
  <div
    className={`absolute w-2 h-3 bg-blue-400 rounded-full opacity-60 animate-bounce`}
    style={{
      left: `${x}%`,
      top: `${y}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
      clipPath: 'ellipse(50% 60% at 50% 40%)',
    }}
  />
);


export const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } =
        mode === "signin"
          ? await signIn(email, password)
          : await signUp(email, password);

      if (error) {
        setError(error.message);
      } else if (mode === "signup") {
        setMessage("Check your email for the confirmation link!");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100">
      {/* Animated Wave Background */}
      <div className="absolute inset-0">
        {/* Wave 1 */}
        <div className="absolute inset-0 opacity-10">
          <svg
            viewBox="0 0 1200 800"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <path
              d="M0,300 C300,200 500,400 800,350 C900,330 1000,370 1200,350 L1200,800 L0,800 Z"
              fill="#0F44CD"
              className="animate-pulse"
              style={{ animationDuration: '4s' }}
            />
          </svg>
        </div>

        {/* Wave 2 */}
        <div className="absolute inset-0 opacity-5">
          <svg
            viewBox="0 0 1200 800"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid slice"
          >
            <path
              d="M0,400 C200,450 400,350 600,400 C800,450 1000,380 1200,400 L1200,800 L0,800 Z"
              fill="#446FE0"
              className="animate-pulse"
              style={{ animationDuration: '6s', animationDelay: '1s' }}
            />
          </svg>
        </div>
      </div>

      {/* Floating Water Drops */}
      <WaterDrop delay={0} duration={3} x={10} y={20} />
      <WaterDrop delay={1} duration={4} x={85} y={15} />
      <WaterDrop delay={2} duration={3.5} x={15} y={70} />
      <WaterDrop delay={3} duration={4.5} x={90} y={60} />
      <WaterDrop delay={0.5} duration={3.8} x={25} y={45} />
      <WaterDrop delay={2.5} duration={3.2} x={75} y={80} />

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 border-blue-200 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            {/* Fountain Icon with Water Theme */}
            <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 mb-4 shadow-lg">
              <FountainIcon className="h-10 w-10 text-blue-600" />
            </div>
            
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {mode === "signin" ? "Dive back in!" : "Join the flow!"}
            </CardTitle>
            
            <CardDescription className="text-blue-700">
              {mode === "signin" 
                ? "Welcome back to your hydration journey" 
                : "Start your yummy water experience at Penn"
              }
            </CardDescription>

            <p className="text-sm text-blue-600">
              {mode === "signin" ? (
                <>
                  New to HYDRATE?{" "}
                  <button
                    onClick={onToggleMode}
                    className="font-semibold text-cyan-600 hover:text-cyan-500 underline underline-offset-2 transition-colors"
                  >
                    Create account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={onToggleMode}
                    className="font-semibold text-cyan-600 hover:text-cyan-500 underline underline-offset-2 transition-colors"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input with Ripple Effect */}
              <div className="relative group">
                <label htmlFor="email" className="block text-sm font-medium text-blue-800 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={cn(
                      "pl-10 pr-4 py-2 border-blue-200 focus:border-cyan-400 focus:ring-cyan-400 bg-white/70 backdrop-blur-sm transition-all duration-300",
                      "hover:bg-white/90 hover:shadow-md"
                    )}
                    placeholder="your.email@penn.edu"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Waves className="h-4 w-4 text-cyan-500" />
                  </div>
                </div>
              </div>

              {/* Password Input */}
              <div className="relative group">
                <label htmlFor="password" className="block text-sm font-medium text-blue-800 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    required
                    className={cn(
                      "pl-10 pr-12 py-2 border-blue-200 focus:border-cyan-400 focus:ring-cyan-400 bg-white/70 backdrop-blur-sm transition-all duration-300",
                      "hover:bg-white/90 hover:shadow-md"
                    )}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Droplets className="h-4 w-4 text-cyan-500" />
                  </div>
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-400 hover:text-blue-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {/* Success Message */}
              {message && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                  <div className="text-sm text-emerald-700">{message}</div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full bg-brand-500 hover:bg-brand-600",
                  "text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300",
                  "hover:shadow-lg transform hover:scale-105",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                )}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>Creating your splash...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    {mode === "signin" ? "Dive In" : "Make a Splash"}
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-100/50 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-cyan-200/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-gradient-radial from-blue-200/20 to-transparent rounded-full blur-2xl pointer-events-none" />
    </div>
  );
};
