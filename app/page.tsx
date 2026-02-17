"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Login() {
  const [role, setRole] = useState<"advisor" | "support">("advisor");
  const { loginWithGoogle, loginWithEmail, signupWithEmail, setRole: saveRolePreference } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // For Sign Up

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      saveRolePreference(role);

      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password, name);
        // If successful, maybe show a success message or auto-login?
        // Supabase usually requires email confirmation for signup by default, 
        // but let's assume it might auto-login or prompt. 
        // For better UX, let's treat it as a success and maybe switch to login or wait for redirect.
        alert("Account created! Please check your email for confirmation if required, or sign in.");
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error("Auth failed:", err);
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      saveRolePreference(role);
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Google Login failed:", err);
      setError(err.message || "Failed to initiate Google login");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md relative group">



        <div className="relative w-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
              BudgetDog
              <span className="block text-xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200 mt-1">
                Command Center
              </span>
            </h1>
            <p className="text-zinc-400 text-sm mt-4">Secure Workspace Access</p>
          </div>

          {/* Toggle Sign In / Sign Up */}
          <div className="flex p-1 bg-zinc-800/50 rounded-lg mb-6 border border-white/5">
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                isLogin ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-300"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                !isLogin ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-300"
              )}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 text-center">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("advisor")}
                  className={cn(
                    "p-3 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 relative overflow-hidden group/btn",
                    role === "advisor"
                      ? "bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                      : "bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-800 hover:border-white/10"
                  )}
                >
                  <span className="text-xl transform transition-transform group-hover/btn:scale-110 duration-300">📈</span>
                  <span className="font-semibold text-xs">Advisor</span>
                  {role === "advisor" && (
                    <div className="absolute inset-0 border-2 border-blue-500/50 rounded-xl animate-pulse"></div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setRole("support")}
                  className={cn(
                    "p-3 rounded-xl border transition-all duration-300 flex flex-col items-center gap-2 relative overflow-hidden group/btn",
                    role === "support"
                      ? "bg-purple-500/10 border-purple-500/50 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                      : "bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-800 hover:border-white/10"
                  )}
                >
                  <span className="text-xl transform transition-transform group-hover/btn:scale-110 duration-300">🛠️</span>
                  <span className="font-semibold text-xs">Support</span>
                  {role === "support" && (
                    <div className="absolute inset-0 border-2 border-purple-500/50 rounded-xl animate-pulse"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Input Fields */}
            <div className="space-y-4">
              {!isLogin && (
                <div className="relative group/input">
                  <div className="absolute left-3 top-3 text-zinc-500 group-focus-within/input:text-yellow-500 transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all placeholder:text-zinc-600"
                  />
                </div>
              )}

              <div className="relative group/input">
                <div className="absolute left-3 top-3 text-zinc-500 group-focus-within/input:text-yellow-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all placeholder:text-zinc-600"
                />
              </div>

              <div className="relative group/input">
                <div className="absolute left-3 top-3 text-zinc-500 group-focus-within/input:text-yellow-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg py-2.5 pl-10 pr-10 text-white text-sm focus:ring-1 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-xs text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white hover:bg-zinc-100 text-black font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                isLogin ? "Sign In" : "Create Account"
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-white/5 hover:border-white/10"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

        </div>

        <p className="text-zinc-600 text-xs text-center mt-8">
          Protected by Supabase Auth &bull; Restricted Domain Access
        </p>
      </div>
    </div>
  );
}
