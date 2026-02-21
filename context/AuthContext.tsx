"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

// --- Division & Role Types ---
export type Division = "planning" | "preparation";

export type ViewMode =
    // Tax Planning division roles
    | "advisor"
    | "support"
    | "admin"
    // Tax Preparation division roles
    | "tax_planning_admin"
    | "tax_prep_admin"
    | "preparer_l1"
    | "preparer_l2"
    | "reviewer"
    | "project_manager";

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
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    division: Division;
    setDivision: (division: Division) => void;
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
    const [viewMode, setViewMode] = useState<ViewMode>("advisor");
    const [division, setDivisionState] = useState<Division>("planning");
    const router = useRouter();

    const [config, setConfig] = useState<{ admins: string[], domains: string[] }>({ admins: [], domains: [] });

    // When division changes, reset viewMode to appropriate default
    const setDivision = (newDivision: Division) => {
        setDivisionState(newDivision);
        if (user?.isSuperAdmin) {
            setViewMode(newDivision === "planning" ? "admin" : "tax_planning_admin");
        } else {
            setViewMode(newDivision === "planning" ? "advisor" : "tax_planning_admin");
        }
    };

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
            // Wait for config to load
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
    }, [config]);

    const handleSession = (session: Session | null) => {
        setSession(session);
        if (session?.user?.email) {
            const email = session.user.email;

            // Domain Restriction
            const isHardcodedAllowed = email === "systo.ai@gmail.com" || email.endsWith("@budgetdog.com");
            const isDynamicAllowed = config.domains.some(d => email.endsWith(d));

            const isAllowed = isHardcodedAllowed || isDynamicAllowed;

            if (!isAllowed && config.domains.length > 0) {
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

            // Set initial view mode based on division
            if (isSuperAdmin) {
                setViewMode(division === "planning" ? "admin" : "tax_planning_admin");
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
        <AuthContext.Provider value={{ user, session, viewMode, setViewMode, division, setDivision, loginWithGoogle, loginWithEmail, signupWithEmail, logout, setRole, updateProfile }}>
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
