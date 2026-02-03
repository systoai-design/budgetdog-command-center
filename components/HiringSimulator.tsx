"use client";

import React, { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import {
    Users,
    Briefcase,
    TrendingUp,
    AlertTriangle,
    DollarSign,
    UserPlus,
    Zap,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for class merging
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Components ---

const Card = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <div
        className={cn(
            "bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm",
            className
        )}
    >
        {children}
    </div>
);

const MetricCard = ({
    icon: Icon,
    label,
    value,
    subtext,
    color = "text-zinc-100",
}: any) => (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-start space-x-4">
        <div className={cn("p-3 rounded-lg bg-zinc-800", color)}>
            <Icon size={24} />
        </div>
        <div>
            <p className="text-sm font-medium text-zinc-400">{label}</p>
            <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
            {subtext && <p className="text-xs text-zinc-500 mt-1">{subtext}</p>}
        </div>
    </div>
);

const SliderControl = ({ label, value, min, max, onChange, unit }: any) => (
    <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-zinc-300">{label}</label>
            <span className="text-sm font-bold text-yellow-400">
                {value} {unit}
            </span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
        />
    </div>
);

// --- Simulator Logic ---

export default function HiringSimulator() {
    // Simulator State
    const [numClients, setNumClients] = useState(120);
    const [numAdvisors, setNumAdvisors] = useState(4);
    const [hoursPerClient, setHoursPerClient] = useState(5.5); // Monthly hours needed per client
    const [advisorCapacity, setAdvisorCapacity] = useState(140); // Max billable hours per advisor/mo
    const [avgClientFee, setAvgClientFee] = useState(350);

    // Derived Metrics
    const totalHoursNeeded = numClients * hoursPerClient;
    const totalCapacity = numAdvisors * advisorCapacity;
    const utilizationRate = (totalHoursNeeded / totalCapacity) * 100;
    const surplusHours = totalCapacity - totalHoursNeeded;
    const canTakeNewClients = Math.floor(surplusHours / hoursPerClient);

    // Financials
    const monthlyRevenue = numClients * avgClientFee;
    const advisorCost = numAdvisors * 6000;
    const margin = monthlyRevenue - advisorCost;

    // Hiring Trigger Logic
    const isOverCapacity = utilizationRate > 100;
    const isHiringWarning = utilizationRate > 85;

    // Chart Data Projection (Next 6 Months if we grow 10% month over month)
    const projectionData = Array.from({ length: 6 }).map((_, i) => {
        const monthClients = Math.floor(numClients * Math.pow(1.05, i)); // 5% growth
        const monthHours = monthClients * hoursPerClient;
        const monthUtilization = (monthHours / totalCapacity) * 100;

        return {
            month: `Month ${i + 1}`,
            Demand: monthHours,
            Capacity: totalCapacity,
        };
    });

    return (
        <div className="min-h-screen bg-black text-zinc-100 p-8 font-sans">
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                        BudgetDog <span className="text-yellow-400">Command Center</span>
                    </h1>
                    <p className="text-zinc-500 mt-1">Capacity Planning & Hiring Simulator</p>
                </div>

                {/* Scalability Formula Display */}
                <div className="mt-4 md:mt-0 px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Scalability Formula</p>
                        <p className="text-lg font-mono text-white">
                            <span className="text-yellow-400">{numClients}</span> Clients = <span className="text-yellow-400">{totalHoursNeeded.toFixed(0)}</span> Advisor Hours
                        </p>
                    </div>
                    <div className="h-10 w-0.5 bg-zinc-800"></div>
                    <div className="pl-2">
                        <p className="text-xs text-zinc-500">Ratio</p>
                        <p className="text-sm font-bold text-white">1 Client : {hoursPerClient} Hrs</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 bg-zinc-900 border-l-4 border-l-yellow-500">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                            <TrendingUp size={20} className="text-yellow-400" />
                            Scenario Controls
                        </h2>

                        <SliderControl
                            label="Active Clients"
                            value={numClients}
                            min={10}
                            max={500}
                            onChange={setNumClients}
                            unit="students"
                        />
                        <SliderControl
                            label="Advisor Count"
                            value={numAdvisors}
                            min={1}
                            max={20}
                            onChange={setNumAdvisors}
                            unit="advisors"
                        />

                        <hr className="border-zinc-800 my-6" />

                        <SliderControl
                            label="Hours Needed / Client"
                            value={hoursPerClient}
                            min={1}
                            max={20}
                            onChange={setHoursPerClient}
                            unit="hrs/mo"
                        />
                        <SliderControl
                            label="Max Advisor Capacity"
                            value={advisorCapacity}
                            min={80}
                            max={180}
                            onChange={setAdvisorCapacity}
                            unit="hrs/mo"
                        />
                    </Card>

                    {/* Alert Box */}
                    <div className={cn(
                        "p-4 rounded-xl border flex items-start gap-3",
                        isOverCapacity
                            ? "bg-red-950 border-red-900 text-red-200"
                            : isHiringWarning
                                ? "bg-yellow-950 border-yellow-900 text-yellow-200"
                                : "bg-zinc-900 border-zinc-800 text-zinc-300"
                    )}>
                        <AlertTriangle size={20} className={cn("shrink-0 mt-1", isOverCapacity ? "text-red-500" : isHiringWarning ? "text-yellow-500" : "text-green-500")} />
                        <div>
                            <h4 className="font-bold text-white">
                                {isOverCapacity ? "CRITICAL: OVER CAPACITY" : isHiringWarning ? "WARNING: HIRE SOON" : "Capacity Healthy"}
                            </h4>
                            <p className="text-sm mt-1 opacity-90">
                                {isOverCapacity
                                    ? `You are ${Math.round(utilizationRate)}% utilized. Clients are underserved.`
                                    : isHiringWarning
                                        ? "Utilization is above 85%. Start recruiting now."
                                        : "Team has room to grow."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Dashboard */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Top Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard
                            icon={Users}
                            label="Active Clients"
                            value={numClients}
                            color="text-yellow-400"
                        />
                        <MetricCard
                            icon={Briefcase}
                            label="Open Capacity"
                            value={canTakeNewClients > 0 ? `+${canTakeNewClients}` : "0"}
                            subtext="new clients fit"
                            color={canTakeNewClients < 5 ? (canTakeNewClients < 0 ? "text-red-500" : "text-yellow-600") : "text-white"}
                        />
                        <MetricCard
                            icon={UserPlus}
                            label="Utilization Rate"
                            value={`${Math.round(utilizationRate)}%`}
                            subtext={`${totalHoursNeeded.toFixed(0)} of ${totalCapacity} hours`}
                            color={utilizationRate > 85 ? "text-red-400" : "text-zinc-100"}
                        />
                        <MetricCard
                            icon={DollarSign}
                            label="Est. Margin"
                            value={`$${margin.toLocaleString()}`}
                            color="text-green-400"
                        />
                    </div>

                    {/* Charts */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">6-Month Capacity Projection</h3>
                            <div className="text-xs text-zinc-500 font-mono">Growth Rate: 5% / mo</div>
                        </div>

                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={projectionData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                    <XAxis dataKey="month" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }}
                                        itemStyle={{ color: "#fbbf24" }}
                                    />
                                    <Legend />
                                    <Bar dataKey="Demand" name="Hours Needed" fill="#eab308" radius={[2, 2, 0, 0]} />
                                    <Bar dataKey="Capacity" name="Total Capacity" fill="#27272a" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="text-lg font-bold text-white">Utilization Gauge</h3>
                            <span className="text-xs text-zinc-500">Real-time simulation</span>
                        </div>
                        {/* Visual Bar for Capacity */}
                        <div className="w-full bg-zinc-800 rounded-sm h-8 overflow-hidden relative border border-zinc-700">
                            <div
                                className={cn("h-full transition-all duration-500",
                                    utilizationRate > 100 ? "bg-red-600" :
                                        utilizationRate > 85 ? "bg-yellow-500" : "bg-zinc-100"
                                )}
                                style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                            />
                            {/* Tick for 85% */}
                            <div className="absolute top-0 bottom-0 w-0.5 bg-black/50 z-10" style={{ left: '85%' }} />
                            <span className="absolute top-1 right-24 text-xs font-bold text-white z-20 shadow-black drop-shadow-md">Warning (85%)</span>
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-zinc-500">
                            <span>0%</span>
                            <span>100% Fully Booked</span>
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}
