"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, LogOut } from "lucide-react";

export default function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-md text-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    <div className="flex items-center gap-8">
                        <div className="flex-shrink-0 flex items-center gap-2">
                            <span className="text-xl font-bold">BudgetDog <span className="text-yellow-400">Command Center</span></span>
                        </div>

                        <div className="hidden md:flex space-x-4">
                            <Link
                                href="/dashboard"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive("/dashboard")
                                    ? "bg-zinc-800 text-yellow-400"
                                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                                    }`}
                            >
                                <LayoutDashboard size={18} />
                                Dashboard
                            </Link>

                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-right hidden sm:block">
                            <p className="font-medium text-white">{user.name}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 rounded-md text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
