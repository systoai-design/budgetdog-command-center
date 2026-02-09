"use client";

import { useState, useEffect } from "react";
import TimeTracker from "@/components/TimeTracker";
import HiringSimulator from "@/components/HiringSimulator";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Tab, TabsList } from "@/components/Tabs";
import { Clock, TrendingUp } from "lucide-react";

export default function Dashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"time" | "capacity">("capacity");

    useEffect(() => {
        if (!user) {
            router.push("/");
        }
        // Everyone is admin now, so they can see both. Defaulting to Capacity Planner.
    }, [user, router]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-black text-zinc-100 p-8 pt-0">
            <div className="flex justify-between items-center mb-8 sticky top-16 bg-black z-40 py-4 border-b border-zinc-900">
                <h1 className="text-3xl font-bold text-white">
                    {user.name}&apos;s <span className="text-yellow-400">Dashboard</span>
                </h1>

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
                </TabsList>
            </div>

            <main>
                {activeTab === "time" && <TimeTracker />}
                {activeTab === "capacity" && <HiringSimulator />}
            </main>
        </div>
    );
}
