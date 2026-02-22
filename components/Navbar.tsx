"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import ProfileModal from "@/components/ProfileModal";
import type { Division, ViewMode } from "@/context/AuthContext";

// --- View Mode Options per Division ---
const PLANNING_VIEWS: { value: ViewMode; label: string }[] = [
    { value: "admin", label: "Super Admin (All)" },
    { value: "advisor", label: "Advisor View" },
    { value: "support", label: "Support View" },
];

const PREPARATION_VIEWS: { value: ViewMode; label: string }[] = [
    { value: "tax_planning_admin", label: "Tax Planning Admin" },
    { value: "tax_prep_admin", label: "Tax Preparation Admin" },
    { value: "preparer_l1", label: "Preparer Level 1" },
    { value: "preparer_l2", label: "Preparer Level 2" },
    { value: "reviewer", label: "Tax Return Reviewer" },
    { value: "project_manager", label: "Project Manager" },
];

export default function Navbar() {
    const { user, logout, viewMode, setViewMode, division, setDivision } = useAuth();
    const pathname = usePathname();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    if (!user) return null;

    const isActive = (path: string) => pathname === path;
    const currentViews = division === "planning" ? PLANNING_VIEWS : PREPARATION_VIEWS;

    return (
        <>
            <nav className="border-b border-border-light dark:border-border-dark bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">

                        <div className="flex items-center gap-8">
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                                    BudgetDog<span className="text-primary hidden lg:inline ml-1">Tax Command Center</span>
                                </span>
                            </div>

                            <div className="hidden md:flex space-x-4">
                                <Link
                                    href="/dashboard"
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive("/dashboard")
                                        ? "bg-primary/10 text-primary border border-primary/20"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
                                        }`}
                                >
                                    <LayoutDashboard size={18} />
                                    Dashboard
                                </Link>

                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Division Toggle (always visible for super admins) */}
                            {user.isSuperAdmin && (
                                <div className="hidden md:flex items-center bg-gray-100 dark:bg-zinc-800 rounded-lg p-0.5 border border-border-light dark:border-border-dark">
                                    <button
                                        onClick={() => setDivision("planning")}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${division === "planning"
                                            ? "bg-primary text-black shadow-sm"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                            }`}
                                    >
                                        Planning
                                    </button>
                                    <button
                                        onClick={() => setDivision("preparation")}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${division === "preparation"
                                            ? "bg-primary text-black shadow-sm"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                            }`}
                                    >
                                        Preparation
                                    </button>
                                </div>
                            )}

                            {/* View Mode Dropdown (role-aware based on division) */}
                            {user.isSuperAdmin && (
                                <div className="hidden md:flex items-center gap-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">View:</span>
                                    <select
                                        value={viewMode}
                                        onChange={(e) => setViewMode(e.target.value as ViewMode)}
                                        className="bg-surface-light dark:bg-zinc-800 border border-border-light dark:border-border-dark text-gray-900 dark:text-white text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        {currentViews.map((v) => (
                                            <option key={v.value} value={v.value}>
                                                {v.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <button
                                onClick={() => setIsProfileOpen(true)}
                                className="flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1.5 rounded-lg transition-colors text-left"
                            >
                                <div className="text-sm hidden sm:block text-right">
                                    <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                                    {user.position ? (
                                        <p className="text-[10px] text-gray-500">{user.position}</p>
                                    ) : (
                                        user.isSuperAdmin && <p className="text-[10px] text-primary font-bold">SUPER ADMIN</p>
                                    )}
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 overflow-hidden flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-300 border border-gray-300 dark:border-zinc-600">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </button>

                            <ThemeToggle />
                            <button
                                onClick={logout}
                                className="p-2 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </>
    );
}
