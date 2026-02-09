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

interface MetricCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    subtext?: string;
    color?: string;
}

const MetricCard = ({
    icon: Icon,
    label,
    value,
    subtext,
    color = "text-zinc-100",
}: MetricCardProps) => (
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

interface SliderControlProps {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
    unit: string;
}

const SliderControl = ({ label, value, min, max, onChange, unit }: SliderControlProps) => (
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
    const [numSupport, setNumSupport] = useState(2); // New Support Staff State
    const [hoursPerClient, setHoursPerClient] = useState(5.5); // Monthly hours needed per client
    const [advisorCapacity, setAdvisorCapacity] = useState(140); // Max billable hours per advisor/mo
    const [supportCapacity, setSupportCapacity] = useState(140); // Max hours per support staff/mo
    const [avgClientFee, setAvgClientFee] = useState(350);
    const [advisorMonthlyCost, setAdvisorMonthlyCost] = useState(6000);
    const [supportMonthlyCost, setSupportMonthlyCost] = useState(4000);
    const [actualHoursPerClient, setActualHoursPerClient] = useState(0);
    const [totalActualHours, setTotalActualHours] = useState(0);
    const [advisorActualHours, setAdvisorActualHours] = useState(0);
    const [supportActualHours, setSupportActualHours] = useState(0);

    // Load actual time entries and calculate monthly run rate
    React.useEffect(() => {
        const savedEntries = localStorage.getItem("budgetdog_time_entries");
        if (savedEntries) {
            interface TimeEntry {
                timestamp: string;
                duration: number;
                category?: "advisor" | "support";
            }
            const entries: TimeEntry[] = JSON.parse(savedEntries);
            const now = new Date();
            const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

            const recentEntries = entries.filter((e) => new Date(e.timestamp) > thirtyDaysAgo);

            const totalMin = recentEntries.reduce((acc, curr) => acc + curr.duration, 0);
            const advMin = recentEntries.filter(e => e.category === 'advisor' || !e.category).reduce((acc, curr) => acc + curr.duration, 0);
            const suppMin = recentEntries.filter(e => e.category === 'support').reduce((acc, curr) => acc + curr.duration, 0);

            const mHours = totalMin / 60;
            setTotalActualHours(mHours);
            setAdvisorActualHours(advMin / 60);
            setSupportActualHours(suppMin / 60);

            // Avoid division by zero
            setActualHoursPerClient(numClients > 0 ? mHours / numClients : 0);
        }
    }, [numClients]); // Re-calculate if numClients slider changes

    // Derived Metrics
    const totalHoursNeeded = numClients * hoursPerClient;
    const totalAdvisorCapacity = numAdvisors * advisorCapacity;
    const totalSupportCapacity = numSupport * supportCapacity;

    // Advisor Utilization
    const advisorUtilizationRate = (totalHoursNeeded / totalAdvisorCapacity) * 100;
    const advisorSurplusHours = totalAdvisorCapacity - totalHoursNeeded;
    const advisorCanTakeNewClients = Math.floor(advisorSurplusHours / hoursPerClient);

    // Support Utilization (Simplified: Assuming support needs scale 1:1 with client hours for now, can be adjusted)
    // In reality, support might need less hours per client, let's assume 0.5 ratio for now or keep it simple and say they support advisors.
    // Let's keep it simple: Support Staff also have capacity. Let's assume they need to cover the same hours for now? 
    // No, that doesn't make sense. Let's assume Support Staff capacity is distinct.
    // Let's assume a dummy ratio for Support work: 2 hours per client?
    const supportHoursPerClient = 2;
    const totalSupportHoursNeeded = numClients * supportHoursPerClient;
    const supportUtilizationRate = (totalSupportHoursNeeded / totalSupportCapacity) * 100;

    // Global Capacity (Bottleneck is the higher utilization)
    const utilizationRate = Math.max(advisorUtilizationRate, supportUtilizationRate);
    const isAdvisorBottleneck = advisorUtilizationRate > supportUtilizationRate;

    // This `canTakeNewClients` logic is a bit tricky with two constraints. Let's just use the Advisor one for the main metric for now as it's the primary revenue driver, 
    // but show Support status.
    const canTakeNewClients = advisorCanTakeNewClients;

    // Financials
    const monthlyRevenue = numClients * avgClientFee;
    const advisorCostValue = numAdvisors * advisorMonthlyCost;
    const supportCostValue = numSupport * supportMonthlyCost;
    const margin = monthlyRevenue - (advisorCostValue + supportCostValue);

    // Hiring Trigger Logic
    const isOverCapacity = utilizationRate > 100;
    const isHiringWarning = utilizationRate > 85;

    // Chart Data Projection (Next 6 Months if we grow 10% month over month)
    const projectionData = Array.from({ length: 6 }).map((_, i) => {
        const monthClients = Math.floor(numClients * Math.pow(1.05, i)); // 5% growth
        const monthHours = monthClients * hoursPerClient;

        return {
            month: `Month ${i + 1}`,
            Demand: monthHours,
            Capacity: totalAdvisorCapacity,
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
                        <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Estimated Capacity</p>
                        <p className="text-lg font-mono text-white">
                            <span className="text-yellow-400">{numClients}</span> Clients = <span className="text-yellow-400">{totalHoursNeeded.toFixed(0)}</span> Hrs Needed
                        </p>
                    </div>
                    <div className="h-10 w-0.5 bg-zinc-800"></div>
                    <div className="pl-2">
                        <p className="text-xs text-zinc-500">Reality Check (Last 30 Days)</p>
                        <div className="flex gap-4">
                            <div>
                                <p className="text-xs text-zinc-500">Total Logged</p>
                                <p className="text-sm font-bold text-white">{totalActualHours.toFixed(1)} Hrs</p>
                            </div>
                            <div>
                                <p className="text-xs text-zinc-500">Implied Ratio</p>
                                <p className="text-sm font-bold text-white">
                                    <span className={actualHoursPerClient > hoursPerClient ? "text-red-400" : "text-green-400"}>
                                        {actualHoursPerClient.toFixed(1)} Hrs/Client
                                    </span>
                                </p>
                            </div>
                        </div>
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

                        <div className="space-y-6">
                            <SliderControl
                                label="Active Clients"
                                value={numClients}
                                min={10}
                                max={500}
                                onChange={setNumClients}
                                unit="clients"
                            />

                            <hr className="border-zinc-800" />

                            <SliderControl
                                label="Advisor Count"
                                value={numAdvisors}
                                min={1}
                                max={20}
                                onChange={setNumAdvisors}
                                unit="advisors"
                            />
                            <SliderControl
                                label="Support/Admin Count"
                                value={numSupport}
                                min={0}
                                max={10}
                                onChange={setNumSupport}
                                unit="staff"
                            />

                            <hr className="border-zinc-800" />

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
                            <SliderControl
                                label="Max Support Capacity"
                                value={supportCapacity}
                                min={80}
                                max={180}
                                onChange={setSupportCapacity}
                                unit="hrs/mo"
                            />

                            <hr className="border-zinc-800" />

                            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Financial Assumptions</h3>

                            <SliderControl
                                label="Avg Monthly Fee / Client"
                                value={avgClientFee}
                                min={50}
                                max={2000}
                                onChange={setAvgClientFee}
                                unit="$"
                            />
                            <SliderControl
                                label="Advisor Monthly Cost"
                                value={advisorMonthlyCost}
                                min={2000}
                                max={15000}
                                onChange={setAdvisorMonthlyCost}
                                unit="$"
                            />
                            <SliderControl
                                label="Support Monthly Cost"
                                value={supportMonthlyCost}
                                min={2000}
                                max={10000}
                                onChange={setSupportMonthlyCost}
                                unit="$"
                            />
                        </div>
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
                                    ? `You are ${Math.round(utilizationRate)}% utilized (${isAdvisorBottleneck ? 'Advisors' : 'Support'}). Clients are underserved.`
                                    : isHiringWarning
                                        ? `Utilization is above 85% (${isAdvisorBottleneck ? 'Advisors' : 'Support'}). Start recruiting now.`
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
                            subtext="new clients fit (Adv)"
                            color={canTakeNewClients < 5 ? (canTakeNewClients < 0 ? "text-red-500" : "text-yellow-600") : "text-white"}
                        />
                        <MetricCard
                            icon={UserPlus}
                            label="Adv Utilization"
                            value={`${Math.round(advisorUtilizationRate)}%`}
                            subtext={`${totalHoursNeeded.toFixed(0)} of ${totalAdvisorCapacity} hours`}
                            color={advisorUtilizationRate > 85 ? "text-red-400" : "text-zinc-100"}
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
                            <h3 className="text-lg font-bold text-white">6-Month Capacity Projection (Advisor)</h3>
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

                        {/* Advisor Gauge */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-zinc-400">Advisors</span>
                                <div className="flex gap-2">
                                    <span className="text-zinc-500">Est: {Math.round(advisorUtilizationRate)}%</span>
                                    <span className="text-white font-bold">Actual: {Math.round((advisorActualHours / totalAdvisorCapacity) * 100)}%</span>
                                </div>
                            </div>
                            <div className="w-full bg-zinc-800 rounded-sm h-6 overflow-hidden relative border border-zinc-700">
                                <div
                                    className={cn("h-full transition-all duration-500",
                                        advisorUtilizationRate > 100 ? "bg-red-600" :
                                            advisorUtilizationRate > 85 ? "bg-yellow-500" : "bg-blue-500"
                                    )}
                                    style={{ width: `${Math.min(advisorUtilizationRate, 100)}%` }}
                                />
                                {/* Actual Marker */}
                                <div
                                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_white] z-20"
                                    style={{ left: `${Math.min((advisorActualHours / totalAdvisorCapacity) * 100, 100)}%`, display: advisorActualHours > 0 ? 'block' : 'none' }}
                                    title={`Actual: ${Math.round((advisorActualHours / totalAdvisorCapacity) * 100)}%`}
                                />
                                <div className="absolute top-0 bottom-0 w-0.5 bg-black/50 z-10" style={{ left: '85%' }} />
                            </div>
                        </div>

                        {/* Support Gauge */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-zinc-400">Support / Admin</span>
                                <div className="flex gap-2">
                                    <span className="text-zinc-500">Est: {Math.round(supportUtilizationRate)}%</span>
                                    <span className="text-white font-bold">Actual: {Math.round((supportActualHours / totalSupportCapacity) * 100)}%</span>
                                </div>
                            </div>
                            <div className="w-full bg-zinc-800 rounded-sm h-6 overflow-hidden relative border border-zinc-700">
                                <div
                                    className={cn("h-full transition-all duration-500",
                                        supportUtilizationRate > 100 ? "bg-red-600" :
                                            supportUtilizationRate > 85 ? "bg-yellow-500" : "bg-purple-500"
                                    )}
                                    style={{ width: `${Math.min(supportUtilizationRate, 100)}%` }}
                                />
                                {/* Actual Marker */}
                                <div
                                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_white] z-20"
                                    style={{ left: `${Math.min((supportActualHours / totalSupportCapacity) * 100, 100)}%`, display: supportActualHours > 0 ? 'block' : 'none' }}
                                    title={`Actual: ${Math.round((supportActualHours / totalSupportCapacity) * 100)}%`}
                                />
                                <div className="absolute top-0 bottom-0 w-0.5 bg-black/50 z-10" style={{ left: '85%' }} />
                            </div>
                        </div>

                    </Card>

                </div>
            </div>
        </div>
    );
}
