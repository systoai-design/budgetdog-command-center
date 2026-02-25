"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ChevronDown, ArrowLeft, Clock, BarChart3, Shield, Layers } from "lucide-react";
import Image from "next/image";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CanvasBackground } from "@/components/3d/CanvasBackground";
import HapticScrollTracker from "@/components/HapticScrollTracker";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function LoginPage() {
    const router = useRouter();
    const { loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            if (isLogin) {
                await loginWithEmail(email, password);
            } else {
                await signupWithEmail(email, password, name);
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
            await loginWithGoogle();
        } catch (err: any) {
            console.error("Google Login failed:", err);
            setError(err.message || "Failed to initiate Google login");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex">
            <HapticScrollTracker />
            {/* ══════════════════════════════════════
          LEFT PANEL — Branding & Features
      ══════════════════════════════════════ */}
            <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-[#0d0d0d]">
                {/* 3D Glass Particles Background */}
                <div className="absolute inset-0 z-0">
                    <CanvasBackground />
                </div>

                {/* Background overlay with yellow accents to ensure text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent pointer-events-none z-0" />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/[0.08] rounded-full blur-[150px] pointer-events-none z-0" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-yellow-500/[0.04] rounded-full blur-[120px] pointer-events-none z-0" />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                        backgroundSize: "80px 80px",
                    }}
                />

                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Top — Logo + Back */}
                    <div>
                        <button
                            onClick={() => window.open("/", "_blank")}
                            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors group mb-16"
                        >
                            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
                            Back to Home
                        </button>

                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20 overflow-hidden shrink-0">
                                <Image src="/logo1.png" alt="Budgetdog Logo" width={48} height={48} className="object-cover w-full h-full" />
                            </div>
                            <div>
                                <div className="font-bold text-xl text-white tracking-tight">BudgetDog</div>
                                <div className="text-yellow-500 text-xs font-semibold">Command Center</div>
                            </div>
                        </div>

                        <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-black leading-[1.1] tracking-tight text-white mb-4">
                            Your team&apos;s
                            <br />
                            operations hub.
                        </h2>
                        <p className="text-zinc-400 text-base leading-relaxed max-w-md">
                            Track time, plan capacity, and manage workflows across both Tax Planning and Tax Preparation divisions.
                        </p>
                    </div>

                    {/* Middle — Feature highlights */}
                    <div className="space-y-3 my-10">
                        {[
                            { icon: Clock, label: "Time Tracking", desc: "Role-specific charge codes", color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/15" },
                            { icon: BarChart3, label: "Capacity Planner", desc: "Model staffing & capacity", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/15" },
                            { icon: Layers, label: "Division Toggle", desc: "Planning & Preparation", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/15" },
                            { icon: Shield, label: "Access Control", desc: "Domain-restricted login", color: "text-green-400", bg: "bg-green-500/10 border-green-500/15" },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className={`w-11 h-11 ${f.bg} border rounded-xl flex items-center justify-center shrink-0`}>
                                    <f.icon size={18} className={f.color} />
                                </div>
                                <div>
                                    <div className="text-base font-bold text-white">{f.label}</div>
                                    <div className="text-sm text-zinc-500">{f.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom — Stats */}
                    <div className="flex gap-8">
                        {[
                            { n: "8", label: "Roles" },
                            { n: "2", label: "Divisions" },
                            { n: "30+", label: "Charge Codes" },
                        ].map((s, i) => (
                            <div key={i}>
                                <div className="text-3xl font-black text-yellow-500">{s.n}</div>
                                <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════
          RIGHT PANEL — Login Form
      ══════════════════════════════════════ */}
            <div className="w-full lg:w-[45%] flex flex-col items-center justify-center px-6 py-12 relative">
                {/* Subtle top border glow on the dividing edge */}
                <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-yellow-500/20 to-transparent" />

                {/* Mobile-only back link */}
                <div className="lg:hidden w-full max-w-sm mb-8">
                    <button
                        onClick={() => window.open("/", "_blank")}
                        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
                        Home
                    </button>
                </div>

                <div className="w-full max-w-sm">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center font-black text-black text-lg mx-auto mb-3 shadow-lg shadow-yellow-500/20">
                            BD
                        </div>
                        <div className="font-bold text-xl text-white">BudgetDog</div>
                        <div className="text-yellow-500 text-xs font-semibold">Command Center</div>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-black text-white tracking-tight">
                            {isLogin ? "Welcome back" : "Create account"}
                        </h1>
                        <p className="text-zinc-400 text-sm mt-1.5">
                            {isLogin ? "Sign in to your workspace" : "Set up your team account"}
                        </p>
                    </div>

                    {/* Toggle */}
                    <div className="flex p-1 bg-zinc-900 rounded-xl mb-6 border border-white/[0.04]">
                        <button
                            type="button"
                            onClick={() => { setIsLogin(true); setError(null); }}
                            className={cn(
                                "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all",
                                isLogin ? "bg-yellow-500 text-black shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsLogin(false); setError(null); }}
                            className={cn(
                                "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all",
                                !isLogin ? "bg-yellow-500 text-black shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {/* Fields */}
                        <div className="space-y-3">
                            {!isLogin && (
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                                        <User size={15} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required={!isLogin}
                                        className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500/40 outline-none transition-all placeholder:text-zinc-600"
                                    />
                                </div>
                            )}

                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                                    <Mail size={15} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500/40 outline-none transition-all placeholder:text-zinc-600"
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600">
                                    <Lock size={15} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full bg-zinc-900 border border-white/[0.06] rounded-xl py-3 pl-10 pr-10 text-white text-sm focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500/40 outline-none transition-all placeholder:text-zinc-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-yellow-500/15"
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                isLogin ? "Sign In" : "Create Account"
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/[0.04]" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                            <span className="bg-[#0a0a0a] px-3 text-zinc-600 font-bold">Or</span>
                        </div>
                    </div>

                    {/* Google */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-white/[0.06] hover:border-white/[0.1]"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Back to landing page */}
                    <div className="hidden lg:flex justify-center mt-6">
                        <button
                            onClick={() => window.open("/", "_blank")}
                            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors group"
                        >
                            <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
                            Back to Home
                        </button>
                    </div>

                    {/* Footer */}
                    <p className="text-zinc-600 text-xs text-center mt-6 font-medium">
                        Protected by Supabase Auth &bull; Restricted Domain Access
                    </p>
                </div>
            </div>
        </div>
    );
}
