"use client";

import { useState, useEffect } from "react";
import TimeTracker from "@/components/TimeTracker";
import HiringSimulator from "@/components/HiringSimulator";
import ActualsDashboard from "@/components/ActualsDashboard";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Tab, TabsList } from "@/components/Tabs";
import { Clock, TrendingUp, BarChart3, LayoutDashboard } from "lucide-react";

export default function Dashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"time" | "capacity" | "actuals">("capacity");

    useEffect(() => {
        if (!user) {
            router.push("/");
        }
        // Everyone is admin now, so they can see both. Defaulting to Capacity Planner.
    }, [user, router]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-white p-8 pt-0 transition-colors duration-300">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 sticky top-16 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl z-40 py-6 border-b border-border-light dark:border-border-dark gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <LayoutDashboard size={28} />
                        </div>
                        {user.name}&apos;s <span className="text-primary">Dashboard</span>
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-14">
                        Manage your time, capacity, and analytics.
                    </p>
                </div>

                <TabsList>
                    <Tab
                        label="Capacity Planner"
                        value="capacity"
                        isActive={activeTab === "capacity"}
                        onClick={() => setActiveTab("capacity")}
                        icon={TrendingUp}
                    />
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

            <main className="max-w-7xl mx-auto pb-12">
                {activeTab === "time" && <TimeTracker />}
                {activeTab === "capacity" && <HiringSimulator />}
                {activeTab === "actuals" && <ActualsDashboard />}
            </main>
        </div>
    );
}
