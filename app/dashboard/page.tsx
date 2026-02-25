"use client";

import { useState, useEffect } from "react";
import TimeTracker from "@/components/TimeTracker";
import HiringSimulator from "@/components/HiringSimulator";
import LiveCapacityDashboard from "@/components/LiveCapacityDashboard";
import ActualsDashboard from "@/components/ActualsDashboard";
import UserManagement from "@/components/UserManagement";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Menu, X } from "lucide-react";
import { triggerHaptic } from "@/lib/utils";
import HapticScrollTracker from "@/components/HapticScrollTracker";

export default function Dashboard() {
    const { user, viewMode, division } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"time" | "capacity" | "live" | "actuals" | "users">("live");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push("/");
        }
    }, [user, router]);

    // Show capacity planner for Super Admin and Divisional Admins
    const isAdminView = viewMode === "admin" || viewMode === "tax_planning_admin" || viewMode === "tax_prep_admin";

    // Redirect if on capacity tab but not in admin view
    useEffect(() => {
        if (!isAdminView && (activeTab === "capacity" || activeTab === "live")) {
            setActiveTab("time");
        }
        if (viewMode !== "admin" && activeTab === "users") {
            setActiveTab("time");
        }
    }, [isAdminView, viewMode, activeTab]);

    if (!user) return null;

    return (
        <div className="flex h-screen bg-[#000000] text-white overflow-hidden selection:bg-white/20 relative">
            <HapticScrollTracker />
            {/* Mobile Hamburger Menu */}
            <div className="md:hidden fixed top-6 right-6 z-[60]">
                <button
                    onClick={() => {
                        triggerHaptic();
                        setIsSidebarOpen(!isSidebarOpen);
                    }}
                    className="p-3 bg-white/[0.05] backdrop-blur-3xl border border-white/[0.1] rounded-2xl text-yellow-500 shadow-2xl active:scale-90 transition-transform"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Navigation */}
            <div className={`
                fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <Sidebar
                    activeTab={activeTab}
                    setActiveTab={(tab) => {
                        setActiveTab(tab);
                        setIsSidebarOpen(false); // Close sidebar after clicking on mobile
                    }}
                />
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative p-4 sm:p-8 pt-24 sm:pt-8 transition-all">
                {/* Mobile Header */}
                <div className="md:hidden flex flex-col items-start mb-6 pb-6 border-b border-white/[0.08] gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/[0.05] border border-white/[0.1] rounded-xl text-yellow-500 shadow-inner shrink-0">
                            <LayoutDashboard size={20} />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tighter leading-tight">
                            <span className="text-yellow-500 block">{user.name}&apos;s</span>
                            <span className="text-white block">Command Center</span>
                        </h1>
                    </div>
                </div>

                {/* Dynamic Content */}
                <div className="w-full pb-20 max-w-[1400px] mx-auto">
                    {activeTab === "time" && <TimeTracker />}
                    {activeTab === "live" && isAdminView && <LiveCapacityDashboard />}
                    {activeTab === "capacity" && isAdminView && <HiringSimulator />}
                    {activeTab === "actuals" && <ActualsDashboard />}
                    {activeTab === "users" && viewMode === "admin" && <UserManagement />}
                </div>
            </main>
        </div>
    );
}
