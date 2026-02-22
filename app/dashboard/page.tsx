"use client";

import { useState, useEffect } from "react";
import TimeTracker from "@/components/TimeTracker";
import HiringSimulator from "@/components/HiringSimulator";
import LiveCapacityDashboard from "@/components/LiveCapacityDashboard";
import ActualsDashboard from "@/components/ActualsDashboard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Tab, TabsList } from "@/components/Tabs";
import { Clock, TrendingUp, BarChart3, LayoutDashboard, Activity } from "lucide-react";

export default function Dashboard() {
    const { user, viewMode, division } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"time" | "capacity" | "live" | "actuals">("live");

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

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#000000] text-white p-4 sm:p-8 pt-0 transition-colors duration-300 selection:bg-white/20">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 sticky top-6 bg-[#000000]/60 backdrop-blur-[40px] z-40 py-4 sm:py-6 border-b border-white/[0.08] gap-6 rounded-b-3xl sm:rounded-none px-4 sm:px-0">
                <div className="w-full md:w-auto text-center md:text-left">
                    <h1 className="text-3xl sm:text-4xl font-bold flex items-center justify-center md:justify-start gap-3 tracking-tighter">
                        <div className="p-2 sm:p-2.5 bg-white/[0.05] border border-white/[0.1] rounded-xl text-yellow-500 shadow-inner">
                            <LayoutDashboard size={24} className="sm:w-7 sm:h-7" />
                        </div>
                        <span className="text-yellow-500">{user.name}&apos;s</span> <span className="text-white">Command Center</span>
                    </h1>
                    <p className="text-sm text-zinc-400 mt-2 md:ml-[3.25rem] font-medium tracking-tight">
                        Manage your time, capacity, and analytics.
                    </p>
                </div>

                <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <TabsList>
                        {isAdminView && (
                            <>
                                <Tab
                                    label="Live Capacity"
                                    value="live"
                                    isActive={activeTab === "live"}
                                    onClick={() => setActiveTab("live")}
                                    icon={Activity}
                                />
                                <Tab
                                    label="Capacity Planner"
                                    value="capacity"
                                    isActive={activeTab === "capacity"}
                                    onClick={() => setActiveTab("capacity")}
                                    icon={TrendingUp}
                                />
                            </>
                        )}
                        <Tab
                            label="Time Tracker"
                            value="time"
                            isActive={activeTab === "time"}
                            onClick={() => setActiveTab("time")}
                            icon={Clock}
                        />
                        <Tab
                            label="Actuals Data"
                            value="actuals"
                            isActive={activeTab === "actuals"}
                            onClick={() => setActiveTab("actuals")}
                            icon={BarChart3}
                        />
                    </TabsList>
                </div>
            </div>

            <main className="max-w-7xl mx-auto pb-20">
                {activeTab === "time" && <TimeTracker />}
                {activeTab === "live" && isAdminView && <LiveCapacityDashboard />}
                {activeTab === "capacity" && isAdminView && <HiringSimulator />}
                {activeTab === "actuals" && <ActualsDashboard />}
            </main>
        </div>
    );
}
