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
} from "recharts";
import {
    Users,
    Briefcase, // work_off
    UserPlus, // person_add
    DollarSign, // attach_money
    TrendingUp,
    Settings, // tune
    AlertTriangle,
    RefreshCw,
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
            "bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm",
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
    iconColorClass,
    valueColorClass = "text-gray-900 dark:text-white",
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    subtext?: string;
    iconColorClass: string;
    valueColorClass?: string;
}) => (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-5 shadow-sm flex items-center gap-4">
        <div className={cn("p-3 rounded-lg bg-gray-100 dark:bg-zinc-800", iconColorClass)}>
            <Icon size={24} />
        </div>
        <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
            <div className={cn("text-2xl font-bold", valueColorClass)}>{value}</div>
            {subtext && <div className="text-xs text-gray-500">{subtext}</div>}
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
    step?: number;
}

const SliderControl = ({ label, value, min, max, onChange, unit, step = 1 }: SliderControlProps) => (
    <div>
        <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-300 font-medium">{label}</span>
            <span className="text-primary font-bold">
                {value} {unit}
            </span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
        />
    </div>
);

// --- Simulator Logic ---

export default function HiringSimulator() {
    // Simulator State
    const [numClients, setNumClients] = useState(120);
    const [numAdvisors, setNumAdvisors] = useState(4);
    const [numSupport, setNumSupport] = useState(2);
    const [hoursPerClient, setHoursPerClient] = useState(5.5);
    const [advisorCapacity, setAdvisorCapacity] = useState(140);
    const [supportCapacity, setSupportCapacity] = useState(140);
    const [avgClientFee, setAvgClientFee] = useState(350);
    const [advisorMonthlyCost, setAdvisorMonthlyCost] = useState(6000);
    const [supportMonthlyCost, setSupportMonthlyCost] = useState(4000);
    const [growthRate, setGrowthRate] = useState(5);

    // Actuals State
    const [totalActualHours, setTotalActualHours] = useState(0);
    const [advisorActualHours, setAdvisorActualHours] = useState(0);
    const [supportActualHours, setSupportActualHours] = useState(0);
    const [actualHoursPerClient, setActualHoursPerClient] = useState(0);

    // Load actual time entries
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Load actual time entries
    const fetchData = React.useCallback(async () => {
        setIsRefreshing(true);
        try {
            const res = await fetch("/api/time-entries");
            const data = await res.json();

            interface TimeEntry {
                timestamp: string;
                duration: number;
                category?: "advisor" | "support";
            }

            // Map snake_case to camelCase
            const entries: TimeEntry[] = data.map((entry: any) => ({
                id: entry.id,
                chargeCode: entry.charge_code,
                category: entry.category,
                duration: entry.duration,
                notes: entry.notes,
                timestamp: entry.timestamp,
            }));

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
            setActualHoursPerClient(numClients > 0 ? mHours / numClients : 0);
        } catch (error) {
            console.error("Failed to fetch actuals for simulator:", error);
        } finally {
            setIsRefreshing(false);
        }
    }, [numClients]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const [supportHoursPerClient, setSupportHoursPerClient] = useState(2.0);

    // Derived Metrics
    const totalHoursNeeded = numClients * hoursPerClient;
    const totalAdvisorCapacity = numAdvisors * advisorCapacity;
    const totalSupportCapacity = numSupport * supportCapacity;

    const advisorUtilizationRate = (totalHoursNeeded / totalAdvisorCapacity) * 100;
    const advisorSurplusHours = totalAdvisorCapacity - totalHoursNeeded;
    const advisorCanTakeNewClients = Math.floor(advisorSurplusHours / hoursPerClient);

    const totalSupportHoursNeeded = numClients * supportHoursPerClient;
    const supportUtilizationRate = (totalSupportHoursNeeded / totalSupportCapacity) * 100;

    const utilizationRate = Math.max(advisorUtilizationRate, supportUtilizationRate);

    // Warning Logic
    const isAdvisorOver = advisorUtilizationRate > 100;
    const isSupportOver = supportUtilizationRate > 100;
    const isAdvisorWarning = advisorUtilizationRate > 85;
    const isSupportWarning = supportUtilizationRate > 85;

    const isOverCapacity = isAdvisorOver || isSupportOver;
    const isHiringWarning = isAdvisorWarning || isSupportWarning;

    // Financials
    const monthlyRevenue = numClients * avgClientFee;
    const advisorCostValue = numAdvisors * advisorMonthlyCost;
    const supportCostValue = numSupport * supportMonthlyCost;
    const margin = monthlyRevenue - (advisorCostValue + supportCostValue);

    // Chart Data
    const projectionData = Array.from({ length: 6 }).map((_, i) => {
        const monthDetails = new Date();
        monthDetails.setMonth(monthDetails.getMonth() + i + 1);
        const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(monthDetails);

        // Calculate compounded clients based on monthly growth rate
        const monthClients = Math.floor(numClients * Math.pow(1 + (growthRate / 100), i + 1));
        const monthHours = monthClients * hoursPerClient;

        return {
            month: monthName,
            Demand: monthHours,
            Capacity: totalAdvisorCapacity,
            // For custom tooltip
            clients: monthClients,
        };
    });

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 bg-background-light dark:bg-background-dark p-6 rounded-xl">
            {/* Left Control Panel */}
            <div className="xl:col-span-3">
                <Card className="p-5 h-fit sticky top-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-primary">
                            <Settings size={20} />
                            <h3 className="font-bold text-gray-900 dark:text-white">Scenario Controls</h3>
                        </div>
                        <button
                            onClick={fetchData}
                            disabled={isRefreshing}
                            className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh Actuals Data"
                        >
                            <RefreshCw size={16} className={cn(isRefreshing && "animate-spin")} />
                        </button>
                    </div>
                    <div className="space-y-6">
                        <SliderControl
                            label="Active Clients"
                            value={numClients}
                            min={10}
                            max={500}
                            onChange={setNumClients}
                            unit="clients"
                        />
                        <SliderControl
                            label="Advisor Count"
                            value={numAdvisors}
                            min={1}
                            max={20}
                            onChange={setNumAdvisors}
                            unit="advisors" // Fixed unit
                        />
                        <SliderControl
                            label="Support/Admin Count"
                            value={numSupport}
                            min={0}
                            max={10}
                            onChange={setNumSupport}
                            unit="staff"
                        />
                        <SliderControl
                            label="Advisor Hours / Client"
                            value={hoursPerClient}
                            min={1}
                            max={20}
                            step={0.5}
                            onChange={setHoursPerClient}
                            unit="hrs/mo"
                        />
                        <SliderControl
                            label="Support Hours / Client"
                            value={supportHoursPerClient}
                            min={0.5}
                            max={10}
                            step={0.5}
                            onChange={setSupportHoursPerClient}
                            unit="hrs/mo"
                        />
                        <SliderControl
                            label="Max Advisor Capacity"
                            value={advisorCapacity}
                            min={80}
                            max={200}
                            onChange={setAdvisorCapacity}
                            unit="hrs/mo"
                        />
                        <SliderControl
                            label="Max Support Capacity"
                            value={supportCapacity}
                            min={80}
                            max={200}
                            onChange={setSupportCapacity}
                            unit="hrs/mo"
                        />
                        <SliderControl
                            label="Projected Growth Rate"
                            value={growthRate}
                            min={0}
                            max={20}
                            onChange={setGrowthRate}
                            unit="%/mo"
                        />

                        <div className="pt-6 border-t border-border-light dark:border-border-dark">
                            <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-500 font-bold mb-4">Financial Assumptions</h4>
                            <div className="space-y-4">
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
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="xl:col-span-9 space-y-6">
                {/* Alert Box - Moved to Top */}
                <div className={cn(
                    "rounded-lg p-4 flex items-start gap-4 border shadow-sm transition-all duration-300",
                    isOverCapacity
                        ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                        : isHiringWarning
                            ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                            : "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                )}>
                    <AlertTriangle size={24} className={cn("mt-0.5 shrink-0", isOverCapacity ? "text-red-600 dark:text-red-500" : isHiringWarning ? "text-yellow-600 dark:text-yellow-500" : "text-emerald-600 dark:text-emerald-500")} />
                    <div className="flex-1">
                        <h4 className={cn("font-bold text-base uppercase mb-1", isOverCapacity ? "text-red-800 dark:text-red-400" : isHiringWarning ? "text-yellow-800 dark:text-yellow-400" : "text-emerald-800 dark:text-emerald-400")}>
                            {isOverCapacity ? "Critical: Over Capacity" : isHiringWarning ? "Warning: Approaching Capacity" : "Status: Healthy"}
                        </h4>
                        <p className={cn("text-sm", isOverCapacity ? "text-red-700 dark:text-red-300" : isHiringWarning ? "text-yellow-700 dark:text-yellow-300" : "text-emerald-700 dark:text-emerald-300")}>
                            {isOverCapacity
                                ? `You are ${Math.round(utilizationRate)}% utilized. ${isAdvisorOver ? "Advisors" : "Support team"} are underserved.`
                                : isHiringWarning
                                    ? `Utilization is above 85% for ${isAdvisorWarning && isSupportWarning ? "both teams" : isAdvisorWarning ? "Advisors" : "Support team"}. Start recruiting.`
                                    : "Team has room to grow."}
                        </p>
                    </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        icon={Users}
                        label="Active Clients"
                        value={numClients}
                        iconColorClass="text-primary"
                    />
                    <MetricCard
                        icon={Briefcase}
                        label="Open Capacity"
                        value={advisorCanTakeNewClients > 0 ? advisorCanTakeNewClients : 0}
                        subtext="new clients fit (Adv)"
                        iconColorClass="text-red-500"
                        valueColorClass={advisorCanTakeNewClients < 0 ? "text-red-500" : "text-gray-900 dark:text-white"}
                    />
                    <MetricCard
                        icon={UserPlus}
                        label="Adv Utilization"
                        value={`${Math.round(advisorUtilizationRate)}%`}
                        subtext={`${totalHoursNeeded.toFixed(0)} of ${totalAdvisorCapacity} hours`}
                        iconColorClass="text-red-500"
                        valueColorClass={isOverCapacity ? "text-red-500" : "text-gray-900 dark:text-white"}
                    />
                    <MetricCard
                        icon={DollarSign}
                        label="Est. Margin"
                        value={`$${margin.toLocaleString()}`}
                        iconColorClass="text-green-500"
                    />
                </div>

                {/* Reality Check Banner */}
                <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-primary text-xl font-bold">{numClients} Clients</span>
                        <span className="text-gray-400">=</span>
                        <span className="text-primary text-xl font-bold">{totalHoursNeeded.toFixed(0)} Hrs Needed</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                            <div className="text-gray-500 dark:text-gray-400 text-xs uppercase">Estimated Capacity</div>
                            <div className="font-bold text-gray-900 dark:text-white">{totalAdvisorCapacity} Hrs Available</div>
                        </div>
                        <div className="text-right border-l border-gray-200 dark:border-gray-700 pl-6">
                            <div className="text-gray-500 dark:text-gray-400 text-xs uppercase">Reality Check (Last 30 Days)</div>
                            <div className="flex gap-4">
                                <div>
                                    <span className="block text-xs text-gray-500">Total Logged</span>
                                    <span className="font-bold text-gray-900 dark:text-white">{totalActualHours.toFixed(1)} Hrs</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500">Implied Ratio</span>
                                    <span className={cn("font-bold", actualHoursPerClient > hoursPerClient ? "text-red-500" : "text-green-500")}>
                                        {actualHoursPerClient.toFixed(1)} Hrs/Client
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projection Chart */}
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">6-Month Capacity Projection (Advisor)</h3>
                        <div className="text-xs text-gray-500 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">Growth Rate: {growthRate}% / mo</div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={projectionData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                <XAxis
                                    dataKey="month"
                                    stroke="#888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        backgroundColor: "#171717",
                                        borderColor: "#262626",
                                        borderRadius: "0.5rem",
                                        color: "#fff"
                                    }}
                                    itemStyle={{ color: "#FBBF24" }}
                                />
                                <Bar dataKey="Demand" name="Hours Needed" fill="#FBBF24" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Capacity" name="Total Capacity" fill="#3f3f46" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Utilization Gauge */}
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Utilization Gauge</h3>
                        <div className="text-xs text-gray-500">Real-time simulation</div>
                    </div>
                    <div className="space-y-6">
                        {/* Advisor Gauge */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Advisors</span>
                                <div className="flex gap-2">
                                    <span className="text-gray-500">Est: {Math.round(advisorUtilizationRate)}%</span>
                                    <span className="text-gray-900 dark:text-white font-bold">Actual: {Math.round((advisorActualHours / totalAdvisorCapacity) * 100)}%</span>
                                </div>
                            </div>
                            <div className="h-6 w-full bg-gray-200 dark:bg-zinc-800 rounded-sm overflow-hidden relative">
                                <div
                                    className={cn("absolute top-0 left-0 h-full transition-all duration-500",
                                        advisorUtilizationRate > 100 ? "bg-red-600" : "bg-primary"
                                    )}
                                    style={{ width: `${Math.min(advisorUtilizationRate, 100)}%` }}
                                ></div>
                                {/* Actual Marker */}
                                {advisorActualHours > 0 && (
                                    <div
                                        className="absolute top-0 h-full w-[2px] bg-white z-10 shadow-[0_0_5px_rgba(0,0,0,0.5)]"
                                        style={{ left: `${Math.min((advisorActualHours / totalAdvisorCapacity) * 100, 100)}%` }}
                                    ></div>
                                )}
                                <div className="absolute top-0 left-[85%] h-full w-[1px] bg-black/20 dark:bg-white/20 z-10 border-l border-dashed border-gray-400"></div>
                            </div>
                        </div>

                        {/* Support Gauge */}
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Support / Admin</span>
                                <div className="flex gap-2">
                                    <span className="text-gray-500">Est: {Math.round(supportUtilizationRate)}%</span>
                                    <span className="text-gray-900 dark:text-white font-bold">Actual: {Math.round((supportActualHours / totalSupportCapacity) * 100)}%</span>
                                </div>
                            </div>
                            <div className="h-6 w-full bg-gray-200 dark:bg-zinc-800 rounded-sm overflow-hidden relative">
                                <div
                                    className={cn("absolute top-0 left-0 h-full transition-all duration-500",
                                        supportUtilizationRate > 100 ? "bg-red-600" : "bg-purple-500"
                                    )}
                                    style={{ width: `${Math.min(supportUtilizationRate, 100)}%` }}
                                ></div>
                                {/* Actual Marker */}
                                {supportActualHours > 0 && (
                                    <div
                                        className="absolute top-0 h-full w-[2px] bg-white z-10 shadow-[0_0_5px_rgba(0,0,0,0.5)]"
                                        style={{ left: `${Math.min((supportActualHours / totalSupportCapacity) * 100, 100)}%` }}
                                    ></div>
                                )}
                                <div className="absolute top-0 left-[85%] h-full w-[1px] bg-black/20 dark:bg-white/20 z-10 border-l border-dashed border-gray-400"></div>
                            </div>
                        </div>
                    </div>
                </Card>


            </div>
        </div>
    );
}
