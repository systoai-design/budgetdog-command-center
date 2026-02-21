"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ChevronDown, ArrowLeft } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// All available roles grouped by division
const ROLE_OPTIONS = [
    {
        group: "Tax Planning",
        roles: [
            { value: "advisor", label: "Advisor" },
            { value: "support", label: "Support Staff" },
        ],
    },
    {
        group: "Tax Preparation",
        roles: [
            { value: "tax_planning_admin", label: "Tax Planning Admin" },
            { value: "tax_prep_admin", label: "Tax Preparation Admin" },
            { value: "preparer_l1", label: "Tax Preparer Level 1" },
            { value: "preparer_l2", label: "Tax Preparer Level 2" },
            { value: "reviewer", label: "Tax Return Reviewer" },
            { value: "project_manager", label: "Project Manager" },
        ],
    },
];

export default function LoginPage() {
    const router = useRouter();
    const [role, setRole] = useState<string>("advisor");
    const { loginWithGoogle, loginWithEmail, signupWithEmail, setRole: saveRolePreference } = useAuth();

    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            if (role === "advisor" || role === "support") {
                saveRolePreference(role);
            } else {
                saveRolePreference("advisor");
            }

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
            if (role === "advisor" || role === "support") {
                saveRolePreference(role);
            } else {
                saveRolePreference("advisor");
            }
            await loginWithGoogle();
        } catch (err: any) {
            console.error("Google Login failed:", err);
            setError(err.message || "Failed to initiate Google login");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black flex flex-col items-center justify-center p-4 relative">

            {/* Back to home */}
            <button
                onClick={() => router.push("/")}
                className="absolute top-6 left-6 flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors group"
            >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
                Home
            </button>

            <div className="w-full max-w-md">
                {/* Card */}
                <div className="w-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center font-black text-black text-2xl mx-auto mb-4 shadow-lg shadow-yellow-500/20">
                            B
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">Sign in to your command center</p>
                    </div>

                    {/* Sign In / Sign Up Toggle */}
                    <div className="flex p-1 bg-zinc-800/60 rounded-xl mb-6 border border-white/5">
                        <button
                            type="button"
                            onClick={() => { setIsLogin(true); setError(null); }}
                            className={cn(
                                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all",
                                isLogin ? "bg-zinc-700/80 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsLogin(false); setError(null); }}
                            className={cn(
                                "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all",
                                !isLogin ? "bg-zinc-700/80 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            Sign Up
                        </button>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">

                        {/* Role Selection — Clean Grouped Dropdown */}
                        <div>
                            <label htmlFor="role-select" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                                Your Role
                            </label>
                            <div className="relative">
                                <select
                                    id="role-select"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full bg-zinc-950/60 border border-zinc-700/50 rounded-xl py-3 px-4 pr-10 text-white text-sm font-medium focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500/50 outline-none transition-all appearance-none cursor-pointer hover:border-zinc-600"
                                >
                                    {ROLE_OPTIONS.map((group) => (
                                        <optgroup key={group.group} label={`── ${group.group} ──`}>
                                            {group.roles.map((r) => (
                                                <option key={r.value} value={r.value}>
                                                    {r.label}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-3">
                            {!isLogin && (
                                <div className="relative group/input">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-yellow-500 transition-colors">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required={!isLogin}
                                        className="w-full bg-zinc-950/60 border border-zinc-700/50 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500/50 outline-none transition-all placeholder:text-zinc-600"
                                    />
                                </div>
                            )}

                            <div className="relative group/input">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-yellow-500 transition-colors">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-zinc-950/60 border border-zinc-700/50 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500/50 outline-none transition-all placeholder:text-zinc-600"
                                />
                            </div>

                            <div className="relative group/input">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-yellow-500 transition-colors">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className="w-full bg-zinc-950/60 border border-zinc-700/50 rounded-xl py-3 pl-10 pr-10 text-white text-sm focus:ring-2 focus:ring-yellow-500/40 focus:border-yellow-500/50 outline-none transition-all placeholder:text-zinc-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-yellow-500/20"
                        >
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                isLogin ? "Sign In" : "Create Account"
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-zinc-900 px-3 text-zinc-600 font-medium">Or</span>
                        </div>
                    </div>

                    {/* Google */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full bg-zinc-800/60 hover:bg-zinc-700/60 text-white font-medium py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-white/5 hover:border-white/10"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                {/* Footer */}
                <p className="text-zinc-600 text-xs text-center mt-6">
                    Protected by Supabase Auth &bull; Restricted Domain Access
                </p>
            </div>
        </div>
    );
}
