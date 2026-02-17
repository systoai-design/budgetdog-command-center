"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

interface User {
    email: string;
    name: string;
    role: "advisor" | "support" | "admin";
    isSuperAdmin: boolean;
    avatarUrl?: string;
    phone?: string;
    position?: string;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    viewMode: "advisor" | "support" | "admin";
    setViewMode: (mode: "advisor" | "support" | "admin") => void;
    loginWithGoogle: () => Promise<void>;
    loginWithEmail: (email: string, password: string) => Promise<void>;
    signupWithEmail: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    setRole: (role: "advisor" | "support") => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [viewMode, setViewMode] = useState<"advisor" | "support" | "admin">("advisor");
    const router = useRouter();

    const [config, setConfig] = useState<{ admins: string[], domains: string[] }>({ admins: [], domains: [] });

    useEffect(() => {
        // Fetch Admin Config
        fetch("/api/admin/config").then(res => res.json()).then(data => {
            if (data.admins && data.domains) {
                setConfig({
                    admins: data.admins.map((a: any) => a.email),
                    domains: data.domains.map((d: any) => d.domain)
                });
            }
        }).catch(err => console.error("Failed to load admin config", err));

        // 1. Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            // We need to wait for config to be loaded? 
            // Actually, we can pass config to handleSession, but it might be empty initially.
            // Let's rely on the useEffect dependency or check inside handleSession if config is ready?
            // Simpler: Just refresh session logic when config changes.
        });
    }, []);

    // Re-run session check when config changes to ensure permissions are updated
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        });
    }, [config]);

    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session);
        });

        return () => subscription.unsubscribe();
    }, [config]); // Add config dependency

    const handleSession = (session: Session | null) => {
        setSession(session);
        if (session?.user?.email) {
            const email = session.user.email;

            // Domain Restriction
            // Fallback: Always allow systo.ai and budgetdog.com
            const isHardcodedAllowed = email === "systo.ai@gmail.com" || email.endsWith("@budgetdog.com");
            const isDynamicAllowed = config.domains.some(d => email.endsWith(d));

            // If config hasn't loaded yet, strict check might be premature. 
            // However, hardcoded allowed will always pass.
            // For new dynamic domains, they might be blocked until config loads.
            // This is a trade-off. We could add a "loading" state.

            const isAllowed = isHardcodedAllowed || isDynamicAllowed;

            if (!isAllowed && config.domains.length > 0) {
                // Only enforce if we have loaded at least some config, or if we are sure.
                // But wait, if config is empty (network error), we default to hardcoded.
                // That's safe.

                alert("Access Denied: Domain not authorized.");
                supabase.auth.signOut();
                setUser(null);
                router.push("/");
                return;
            }

            // Load persisted role or default
            const storedRole = localStorage.getItem(`budgetdog_role_${email}`);
            const role: "advisor" | "support" | "admin" = (storedRole as any) || "advisor";

            const isHardcodedAdmin = email === "systo.ai@gmail.com";
            const isDynamicAdmin = config.admins.includes(email);
            const isSuperAdmin = isHardcodedAdmin || isDynamicAdmin;

            setUser({
                email,
                name: session.user.user_metadata.full_name || email.split("@")[0],
                role,
                isSuperAdmin,
                avatarUrl: session.user.user_metadata.avatar_url,
                phone: session.user.user_metadata.phone,
                position: session.user.user_metadata.position,
            });

            // Set initial view mode
            if (isSuperAdmin) {
                // If they were already in a specific mode, maybe keep it?
                // For now, default to admin view on fresh load is fine.
                // But if we re-run this on config change, we shouldn't force change viewMode if already set.
                // valid check:
                // setViewMode("admin");
            } else {
                setViewMode(role);
            }

            // Redirect if on login page
            if (window.location.pathname === "/") {
                router.push("/dashboard");
            }
        } else {
            setUser(null);
        }
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return;

        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: data.name,
                    avatar_url: data.avatarUrl,
                    phone: data.phone,
                    position: data.position,
                }
            });

            if (error) throw error;

            setUser(prev => prev ? { ...prev, ...data } : null);
        } catch (error) {
            console.error("Error updating profile:", error);
            throw error;
        }
    };

    const loginWithGoogle = async () => {
        console.log("Initiating Google Login...");
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (error) {
            console.error("Supabase OAuth Error:", error);
            throw error;
        }
    };

    const loginWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
    };

    const signupWithEmail = async (email: string, password: string, name: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        });
        if (error) throw error;
    };

    const logout = async () => {
        // Optimistic UI update
        setUser(null);
        setSession(null);
        router.push("/");

        // Sign out in background
        await supabase.auth.signOut();
    };

    const setRole = (role: "advisor" | "support") => {
        if (user) {
            const updatedUser = { ...user, role };
            setUser(updatedUser);
            localStorage.setItem(`budgetdog_role_${user.email}`, role);

            // Also update view mode if not super admin
            if (!user.isSuperAdmin) {
                setViewMode(role);
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, viewMode, setViewMode, loginWithGoogle, loginWithEmail, signupWithEmail, logout, setRole, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
