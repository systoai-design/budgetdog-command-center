"use client";

import { useState, useEffect, useRef } from "react";
import TimeTracker from "@/components/TimeTracker";
import HiringSimulator from "@/components/HiringSimulator";
import LiveCapacityDashboard from "@/components/LiveCapacityDashboard";
import ActualsDashboard from "@/components/ActualsDashboard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Tab, TabsList } from "@/components/Tabs";
import { Clock, TrendingUp, BarChart3, LayoutDashboard, Activity, Settings, UserCircle, LogOut, ChevronDown } from "lucide-react";
import Lenis from 'lenis';
import ProfileModal from "@/components/ProfileModal";

export default function Dashboard() {
    const { user, viewMode, division, setDivision, setViewMode, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"time" | "capacity" | "live" | "actuals">("time");
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const wrapperRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Lenis Smooth Scroll Setup
    useEffect(() => {
        if (!wrapperRef.current || !contentRef.current) return;

        const lenis = new Lenis({
            wrapper: wrapperRef.current,
            content: contentRef.current,
            lerp: 0.08,
            wheelMultiplier: 1.2,
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
        });

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    useEffect(() => {
        if (!user) {
            router.push("/");
        }
    }, [user, router]);

    // Show capacity planner only for Super Admin
    const isAdminView = viewMode === "admin";

    // Redirect if on capacity tab but not in admin view
    useEffect(() => {
        if (!isAdminView && (activeTab === "capacity" || activeTab === "live")) {
            setActiveTab("time");
        }
    }, [isAdminView, activeTab]);

    // View Options per Division
    const PLANNING_VIEWS = [
        { value: "admin", label: "Super Admin (All)" },
        { value: "advisor", label: "Advisor View" },
        { value: "support", label: "Support View" },
    ];

    const PREPARATION_VIEWS = [
        { value: "tax_planning_admin", label: "Tax Planning Admin" },
        { value: "tax_prep_admin", label: "Tax Preparation Admin" },
        { value: "preparer_l1", label: "Preparer Level 1" },
        { value: "preparer_l2", label: "Preparer Level 2" },
        { value: "reviewer", label: "Tax Return Reviewer" },
        { value: "project_manager", label: "Project Manager" },
    ];

    const currentViews = division === "planning" ? PLANNING_VIEWS : PREPARATION_VIEWS;

    if (!user) return null;

    return (
        <div className="flex h-screen w-screen bg-[#0A0A0A] text-white overflow-hidden selection:bg-yellow-500/30 font-sans">

            {/* ═══════════════════════════════════════════
                LEFT SIDEBAR
            ═══════════════════════════════════════════ */}
            <aside className="w-64 flex flex-col border-r border-white/5 bg-[#050505] shrink-0 z-50">
                {/* Brand & Workspace Hub */}
                <div className="p-4 border-b border-white/5">
                    <div className="flex items-center gap-2 mb-6 px-2">
                        <div className="w-6 h-6 rounded bg-yellow-500 flex items-center justify-center shrink-0">
                            <span className="text-black font-bold text-xs">BD</span>
                        </div>
                        <span className="font-semibold tracking-tight text-sm">BudgetDog Command</span>
                    </div>

                    <button
                        onClick={() => setIsProfileOpen(true)}
                        className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 shrink-0">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <UserCircle size={16} className="text-zinc-400" />
                                )}
                            </div>
                            <div className="flex flex-col items-start overflow-hidden">
                                <span className="text-xs text-zinc-500 font-medium">Workspace</span>
                                <span className="text-sm font-semibold truncate w-[120px] text-left group-hover:text-yellow-500 transition-colors">{user.name}</span>
                            </div>
                        </div>
                        <ChevronDown size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </button>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
                    <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2 mt-2">Core Tools</p>

                    <button
                        onClick={() => setActiveTab("time")}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${activeTab === "time" ? "bg-white/10 text-white font-medium shadow-sm" : "text-zinc-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <Clock size={16} className={activeTab === "time" ? "text-yellow-500" : "text-zinc-500"} />
                        Time Tracker
                    </button>

                    <button
                        onClick={() => setActiveTab("actuals")}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${activeTab === "actuals" ? "bg-white/10 text-white font-medium shadow-sm" : "text-zinc-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <BarChart3 size={16} className={activeTab === "actuals" ? "text-yellow-500" : "text-zinc-500"} />
                        Actuals Analytics
                    </button>

                    {isAdminView && (
                        <>
                            <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-2 mt-6">Administration</p>

                            <button
                                onClick={() => setActiveTab("live")}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${activeTab === "live" ? "bg-white/10 text-white font-medium shadow-sm" : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <Activity size={16} className={activeTab === "live" ? "text-yellow-500" : "text-zinc-500"} />
                                Live Capacity
                            </button>

                            <button
                                onClick={() => setActiveTab("capacity")}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${activeTab === "capacity" ? "bg-white/10 text-white font-medium shadow-sm" : "text-zinc-400 hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <TrendingUp size={16} className={activeTab === "capacity" ? "text-yellow-500" : "text-zinc-500"} />
                                Capacity Simulator
                            </button>

                            {user.isSuperAdmin && (
                                <div className="mt-8 px-3">
                                    <div className="p-3 bg-zinc-900/50 border border-white/5 rounded-xl">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Global Overrides</p>

                                        {/* Division Toggle */}
                                        <div className="flex items-center bg-black rounded-lg p-1 border border-white/5 mb-3">
                                            <button
                                                onClick={() => setDivision("planning")}
                                                className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${division === "planning" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-white"
                                                    }`}
                                            >
                                                Planning
                                            </button>
                                            <button
                                                onClick={() => setDivision("preparation")}
                                                className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${division === "preparation" ? "bg-white/10 text-white shadow-sm" : "text-zinc-500 hover:text-white"
                                                    }`}
                                            >
                                                Prep
                                            </button>
                                        </div>

                                        {/* View Selector */}
                                        <select
                                            value={viewMode}
                                            onChange={(e) => setViewMode(e.target.value as any)}
                                            className="w-full bg-black border border-white/5 text-zinc-300 text-xs rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 appearance-none cursor-pointer"
                                        >
                                            {currentViews.map(v => (
                                                <option key={v.value} value={v.value}>{v.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </nav>

                {/* Footer Controls */}
                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                        <LogOut size={16} />
                        Log Out
                    </button>
                </div>
            </aside>

            {/* ═══════════════════════════════════════════
                MAIN CONTENT (LENIS SCROLL ZONE)
            ═══════════════════════════════════════════ */}
            <main ref={wrapperRef} className="flex-1 overflow-y-auto relative bg-[#0A0A0A]">
                <div ref={contentRef} className="min-h-full pb-24">

                    {/* Sticky Main Header */}
                    <div className="sticky top-0 z-40 bg-[#0A0A0A]/80 backdrop-blur-2xl border-b border-white/5 pt-8 pb-6 px-8 sm:px-12">
                        <h1 className="text-3xl font-bold tracking-tight text-white m-0 leading-none">
                            Hello {user.name.split(' ')[0]}!
                        </h1>
                        <p className="text-sm text-zinc-400 mt-2 font-medium tracking-tight">
                            Here's what's going on within your command center.
                        </p>
                    </div>

                    {/* Dashboard Rendering Zone */}
                    <div className="p-8 sm:p-12 max-w-[1600px] mx-auto">
                        {activeTab === "time" && <TimeTracker />}
                        {activeTab === "live" && isAdminView && <LiveCapacityDashboard />}
                        {activeTab === "capacity" && isAdminView && <HiringSimulator />}
                        {activeTab === "actuals" && <ActualsDashboard />}
                    </div>

                </div>
            </main>

            {/* Profile Modal */}
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </div>
    );
}
