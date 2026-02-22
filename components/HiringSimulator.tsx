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
    ComposedChart,
    Line,
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
    HelpCircle,
    LucideIcon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// ... (existing imports)


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
            "bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 p-6 md:p-8",
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
    valueColorClass = "text-white",
    tooltip,
}: {
    icon: LucideIcon;
    label: string;
    value: string | number;
    subtext?: string;
    iconColorClass: string;
    valueColorClass?: string;
    tooltip?: string;
}) => (
    <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-3xl p-6 shadow-2xl flex items-center gap-5 relative group transition-all hover:bg-white/[0.04]">
        <div className={cn("p-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] shadow-inner", iconColorClass)}>
            <Icon size={26} className="text-current drop-shadow-md" />
        </div>
        <div>
            <div className="flex items-center gap-2 mb-1">
                <div className="text-sm font-medium text-zinc-400 tracking-tight">{label}</div>
                {tooltip && (
                    <div className="group/tooltip relative">
                        <HelpCircle size={14} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none text-center shadow-lg">
                            {tooltip}
                            <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-900"></div>
                        </div>
                    </div>
                )}
            </div>
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
    strict?: boolean;
}

const SliderControl = ({ label, value, min, max, onChange, unit, step = 1, strict = false }: SliderControlProps) => (
    <div>
        <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-300 font-medium">{label}</span>
            <div className="flex items-center gap-1 bg-surface-light dark:bg-zinc-800 border border-border-light dark:border-border-dark rounded px-2 py-0.5">
                <input
                    type="number"
                    min={0} // Allow going below slider min if needed, but keeping positive usually safe
                    max={strict ? max : max * 2} // Strict mode enforces max
                    step={step}
                    value={value}
                    onChange={(e) => {
                        let val = Number(e.target.value);
                        if (strict && val > max) val = max;
                        onChange(val);
                    }}
                    className="w-16 bg-transparent text-right font-bold text-primary focus:outline-none text-sm"
                />
                <span className="text-xs text-gray-500 font-medium">{unit}</span>
            </div>
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
    const { division } = useAuth();
    const isPreparation = division === "preparation";

    // Simulator State
    const [numClients, setNumClients] = useLocalStorage("hs_numClients", 120);
    const [numAdvisors, setNumAdvisors] = useLocalStorage("hs_numAdvisors", 4);
    const [numSupport, setNumSupport] = useLocalStorage("hs_numSupport", 2);
    const [hoursPerClient, setHoursPerClient] = useLocalStorage("hs_hoursPerClient", 5.5);
    const [advisorCapacity, setAdvisorCapacity] = useLocalStorage("hs_advisorCapacity", 140);
    const [supportCapacity, setSupportCapacity] = useLocalStorage("hs_supportCapacity", 140);
    const [growthRate, setGrowthRate] = useLocalStorage("hs_growthRate", 5);

    // New Target Utilization settings
    const [advisorTargetUtilization, setAdvisorTargetUtilization] = useLocalStorage("hs_advisorTargetUtilization", 85);
    const [supportTargetUtilization, setSupportTargetUtilization] = useLocalStorage("hs_supportTargetUtilization", 85);

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

    // Derived Metrics - Capacity strictly based on Time/People
    const totalAdvisorCapacity = numAdvisors * advisorCapacity;
    const totalSupportCapacity = numSupport * supportCapacity;

    const advisorMaxClients = hoursPerClient > 0 ? Math.floor((totalAdvisorCapacity * (advisorTargetUtilization / 100)) / hoursPerClient) : 0;
    const supportMaxClients = supportHoursPerClient > 0 ? Math.floor((totalSupportCapacity * (supportTargetUtilization / 100)) / supportHoursPerClient) : 0;

    // Firm physical limit is the lowest of the bottlenecked teams
    const firmMaxClients = Math.min(advisorMaxClients, supportMaxClients);
    const bottleneck = advisorMaxClients < supportMaxClients ? "Advisors" : supportMaxClients < advisorMaxClients ? "Support" : "Both";

    const safeToOnboard = Math.max(0, firmMaxClients - numClients);

    // Utilization Rates against absolute physical max (for gauges)
    const totalHoursNeeded = numClients * hoursPerClient;
    const advisorUtilizationRate = totalAdvisorCapacity > 0 ? (totalHoursNeeded / totalAdvisorCapacity) * 100 : 0;

    const totalSupportHoursNeeded = numClients * supportHoursPerClient;
    const supportUtilizationRate = totalSupportCapacity > 0 ? (totalSupportHoursNeeded / totalSupportCapacity) * 100 : 0;

    // Warning Logic
    const isOverCapacity = numClients > firmMaxClients;
    const isAdvisorWarning = advisorUtilizationRate > (advisorTargetUtilization - 5);
    const isSupportWarning = supportUtilizationRate > (supportTargetUtilization - 5);
    const isHiringWarning = !isOverCapacity && (isAdvisorWarning || isSupportWarning);

    // Chart Data
    const projectionData = Array.from({ length: 6 }).map((_, i) => {
        const monthDetails = new Date();
        monthDetails.setMonth(monthDetails.getMonth() + i + 1);
        const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(monthDetails);

        // Calculate compounded clients based on monthly growth rate
        const monthClients = Math.floor(numClients * Math.pow(1 + (growthRate / 100), i + 1));

        return {
            month: monthName,
            Clients: monthClients,
            MaxCapacity: firmMaxClients,
        };
    });

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-3 rounded-lg shadow-xl text-xs">
                    <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
                    <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                            <span className="text-gray-500">Proj. Clients:</span>
                            <span className="font-mono font-bold text-gray-900 dark:text-white">{payload[0].payload.Clients.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-gray-500">Firm Max Clients:</span>
                            <span className="font-mono font-bold text-gray-500">{payload[0].payload.MaxCapacity.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

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
                            max={5000}
                            onChange={setNumClients}
                            unit="clients"
                        />
                        <SliderControl
                            label="Advisor Count"
                            value={numAdvisors}
                            min={1}
                            max={100}
                            onChange={setNumAdvisors}
                            unit="advisors" // Fixed unit
                        />
                        <SliderControl
                            label="Support/Admin Count"
                            value={numSupport}
                            min={0}
                            max={100}
                            onChange={setNumSupport}
                            unit="staff"
                        />
                        <SliderControl
                            label="Advisor Hours / Client"
                            value={hoursPerClient}
                            min={1}
                            max={140}
                            step={0.5}
                            onChange={setHoursPerClient}
                            unit="hrs/mo"
                        />
                        <SliderControl
                            label="Support Hours / Client"
                            value={supportHoursPerClient}
                            min={0.5}
                            max={140}
                            step={0.5}
                            onChange={setSupportHoursPerClient}
                            unit="hrs/mo"
                        />
                        <SliderControl
                            label="Max Advisor Capacity"
                            value={advisorCapacity}
                            min={80}
                            max={160}
                            onChange={setAdvisorCapacity}
                            unit="hrs/mo"
                            strict={true}
                        />
                        <SliderControl
                            label="Max Support Capacity"
                            value={supportCapacity}
                            min={80}
                            max={160}
                            onChange={setSupportCapacity}
                            unit="hrs/mo"
                            strict={true}
                        />
                        <SliderControl
                            label="Target Adv. Util %"
                            value={advisorTargetUtilization}
                            min={10}
                            max={100}
                            onChange={setAdvisorTargetUtilization}
                            unit="%"
                        />
                        <SliderControl
                            label="Target Sup. Util %"
                            value={supportTargetUtilization}
                            min={10}
                            max={100}
                            onChange={setSupportTargetUtilization}
                            unit="%"
                        />
                        <SliderControl
                            label="Projected Growth Rate"
                            value={growthRate}
                            min={0}
                            max={100}
                            onChange={setGrowthRate}
                            unit="%/mo"
                        />

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
                                ? `Firm is over target capacity. The ${bottleneck} team is the bottleneck.`
                                : isHiringWarning
                                    ? `Utilization is approaching target limits for ${bottleneck}. Start recruiting.`
                                    : "Team has room to grow."}
                        </p>
                    </div>
                </div>

                {/* Core Capacity Metrics */}
                <h4 className="text-gray-500 uppercase tracking-wider text-xs font-bold mb-2">Core People Capacity</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <MetricCard
                        icon={Users}
                        label="Active Clients"
                        value={numClients}
                        iconColorClass="text-primary"
                    />
                    <MetricCard
                        icon={Briefcase}
                        label="Safe To Onboard"
                        value={safeToOnboard}
                        subtext={`Bottleneck: ${bottleneck}`}
                        iconColorClass="text-red-500"
                        valueColorClass={safeToOnboard <= 0 ? "text-red-500" : "text-gray-900 dark:text-white"}
                        tooltip="Calculated dynamically across both Adv and Support using Target Utilization %"
                    />
                    <MetricCard
                        icon={UserPlus}
                        label="Adv Utilization"
                        value={`${Math.round(advisorUtilizationRate)}%`}
                        subtext={`${totalHoursNeeded.toFixed(0)} of ${totalAdvisorCapacity} max hrs`}
                        iconColorClass="text-blue-500"
                        valueColorClass={advisorUtilizationRate > advisorTargetUtilization ? "text-red-500" : "text-gray-900 dark:text-white"}
                        tooltip={`Current utilization vs absolute maximum capacity. Target is ${advisorTargetUtilization}%`}
                    />
                    <MetricCard
                        icon={UserPlus}
                        label="Sup Utilization"
                        value={`${Math.round(supportUtilizationRate)}%`}
                        subtext={`${totalSupportHoursNeeded.toFixed(0)} of ${totalSupportCapacity} max hrs`}
                        iconColorClass="text-purple-500"
                        valueColorClass={supportUtilizationRate > supportTargetUtilization ? "text-red-500" : "text-gray-900 dark:text-white"}
                        tooltip={`Current utilization vs absolute maximum capacity. Target is ${supportTargetUtilization}%`}
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
                            <div className="font-bold text-gray-900 dark:text-white">{totalAdvisorCapacity} Hrs Max</div>
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
                                        {actualHoursPerClient < 0.1 && actualHoursPerClient > 0 ? "< 0.1" : actualHoursPerClient.toFixed(1)} Hrs/Client
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projection Chart */}
                <Card className="p-6">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">6-Month Target Capacity Funnel</h3>
                        <div className="text-xs text-gray-500 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">Growth Rate: {growthRate}% / mo</div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={projectionData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                <XAxis
                                    dataKey="month"
                                    stroke="#888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    yAxisId="left"
                                    stroke="#888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                <Bar yAxisId="left" dataKey="Clients" name="Proj. Clients" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                                <Line
                                    yAxisId="left"
                                    type="stepAfter"
                                    dataKey="MaxCapacity"
                                    name="Firm Max Capacity"
                                    stroke="#ef4444"
                                    strokeWidth={3}
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </ComposedChart>
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
        </div >
    );
}
