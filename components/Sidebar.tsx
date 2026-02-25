"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, Clock, TrendingUp, BarChart3, Activity, LogOut, ChevronLeft, ChevronRight, Settings, Users } from "lucide-react";
import type { ViewMode } from "@/context/AuthContext";
import Image from "next/image";
import ProfileModal from "@/components/ProfileModal";
import { triggerHaptic } from "@/lib/utils";

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

interface SidebarProps {
    activeTab: "time" | "capacity" | "live" | "actuals" | "users";
    setActiveTab: (tab: "time" | "capacity" | "live" | "actuals" | "users") => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
    const { user, logout, viewMode, setViewMode, division, setDivision } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    if (!user) return null;

    const isAdminView = viewMode === "admin" || viewMode === "tax_planning_admin" || viewMode === "tax_prep_admin";
    const currentViews = division === "planning" ? PLANNING_VIEWS : PREPARATION_VIEWS;

    const navItems = [
        ...(isAdminView ? [
            { id: "live", label: "Live Capacity", icon: Activity },
            { id: "capacity", label: "Capacity Planner", icon: TrendingUp }
        ] : []),
        { id: "time", label: "Time Tracker", icon: Clock },
        { id: "actuals", label: "Actuals Data", icon: BarChart3 },
        ...(viewMode === "admin" ? [
            { id: "users", label: "Team Management", icon: Users }
        ] : []),
    ];

    return (
        <aside
            className={`
                flex flex-col h-screen sticky top-0 bg-[#000000]/80 backdrop-blur-3xl border-r border-white/[0.08] 
                transition-all duration-300 ease-in-out z-50
                ${isCollapsed ? 'w-20' : 'w-72'}
            `}
        >
            {/* Header / Logo Area */}
            <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-white/[0.08]`}>
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 relative rounded-full overflow-hidden bg-white/5 flex items-center justify-center border border-white/10">
                            <Image
                                src="/logo1.png"
                                alt="Budgetdog Logo"
                                fill
                                className="object-cover p-1"
                            />
                        </div>
                        <span className="text-lg font-bold text-white whitespace-nowrap tracking-tight">Command Center</span>
                    </div>
                )}
                {isCollapsed && (
                    <div className="flex-shrink-0 w-8 h-8 relative rounded-full overflow-hidden bg-white/5 flex items-center justify-center border border-white/10 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
                        <Image
                            src="/logo1.png"
                            alt="Budgetdog Logo"
                            fill
                            className="object-cover p-1"
                        />
                    </div>
                )}

                <button
                    onClick={() => {
                        triggerHaptic();
                        setIsCollapsed(!isCollapsed);
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={18} className="hidden" /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Division & View Controls */}
            {user.isSuperAdmin && !isCollapsed && (
                <div className="p-4 border-b border-white/[0.08] space-y-4">
                    <div className="flex items-center bg-white/[0.03] rounded-lg p-1 border border-white/[0.05]">
                        <button
                            onClick={() => {
                                triggerHaptic();
                                setDivision("planning");
                            }}
                            className={`flex-1 px-2 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${division === "planning"
                                ? "bg-yellow-500 text-black shadow-sm"
                                : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            Planning
                        </button>
                        <button
                            onClick={() => {
                                triggerHaptic();
                                setDivision("preparation");
                            }}
                            className={`flex-1 px-2 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${division === "preparation"
                                ? "bg-yellow-500 text-black shadow-sm"
                                : "text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            Preparation
                        </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest px-1">Active View</span>
                        <select
                            value={viewMode}
                            onChange={(e) => {
                                triggerHaptic();
                                setViewMode(e.target.value as ViewMode);
                            }}
                            className="bg-zinc-900 border border-white/[0.1] text-white text-sm rounded-md px-3 py-2 w-full focus:outline-none focus:ring-1 focus:ring-yellow-500/50 appearance-none"
                        >
                            {currentViews.map((v) => (
                                <option key={v.value} value={v.value}>{v.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
                {!isCollapsed && <div className="px-3 mb-2 text-xs font-semibold text-zinc-600 uppercase tracking-widest">Main Menu</div>}

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                                triggerHaptic();
                                setActiveTab(item.id as any);
                            }}
                            className={`
                                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                                ${isActive
                                    ? 'bg-yellow-500/10 text-yellow-500 font-semibold'
                                    : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200'
                                }
                                ${isCollapsed ? 'justify-center px-0' : 'justify-start'}
                            `}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <Icon size={isCollapsed ? 22 : 18} className={isActive ? 'text-yellow-500' : 'text-zinc-400 group-hover:text-zinc-300'} />
                            {!isCollapsed && <span className="tracking-tight">{item.label}</span>}
                            {!isCollapsed && isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-yellow-500" />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Footer / Profile */}
            <div className={`p-4 border-t border-white/[0.08] transition-all ${isCollapsed ? 'flex justify-center' : ''}`}>
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'justify-between'} w-full bg-white/[0.02] p-2 rounded-xl border border-white/[0.05]`}>
                    {!isCollapsed && (
                        <button
                            onClick={() => setIsProfileOpen(true)}
                            className="flex items-center gap-3 flex-1 min-w-0 text-left hover:bg-white/[0.05] p-1 -ml-1 rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold flex-shrink-0 text-sm border border-yellow-500/30">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex flex-col truncate">
                                <span className="text-sm font-semibold text-white truncate">{user.name}</span>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wider truncate">{user.role}</span>
                            </div>
                        </button>
                    )}

                    {isCollapsed ? (
                        <div className="flex flex-col gap-2">
                            <button onClick={() => setIsProfileOpen(true)} className="w-8 h-8 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors" title="Settings">
                                <Settings size={16} />
                            </button>
                            <button onClick={logout} className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition-colors" title="Log out">
                                <LogOut size={16} />
                            </button>
                        </div>
                    ) : (
                        <button onClick={logout} className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0">
                            <LogOut size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Settings Modal */}
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </aside>
    );
}
