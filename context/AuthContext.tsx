"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    name: string;
    role: "admin" | "staff";
}

interface AuthContextType {
    user: User | null;
    login: (name: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check localStorage for persisted user
        const storedUser = localStorage.getItem("budgetdog_user");
        if (storedUser) {
            setTimeout(() => {
                setUser(JSON.parse(storedUser));
            }, 0);
        }
    }, []);

    const login = (name: string) => {
        const newUser: User = { name, role: "admin" };
        setUser(newUser);
        localStorage.setItem("budgetdog_user", JSON.stringify(newUser));
        router.push("/dashboard");
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("budgetdog_user");
        router.push("/");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
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
