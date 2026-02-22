"use client";

import React, { useState, useEffect } from "react";
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
    Briefcase,
    UserPlus,
    DollarSign,
    RefreshCw,
    HelpCircle,
    Activity,
    AlertTriangle,
    PlugZap,
    LucideIcon
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Components ---
const Card = ({ children, className }: { children: React.ReactNode; className?: string; }) => (
    <div className={cn("bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 p-6 md:p-8", className)}>
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

const NumberControl = ({ label, value, onChange, unit, strict = false, isExternalSource = false }: any) => (
    <div className="mb-4">
        <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1">
                {label}
                {isExternalSource && <span title="Will be mapped to external API"><PlugZap size={12} className="text-blue-500" /></span>}
            </span>
        </div>
        <div className="flex items-center gap-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
            <input
                type="number"
                min={0}
                value={value}
                onChange={(e) => {
                    let val = Number(e.target.value);
                    onChange(val);
                }}
                className="w-full bg-transparent text-left font-bold text-gray-900 dark:text-white focus:outline-none"
            />
            <span className="text-xs text-gray-500 font-medium shrink-0">{unit}</span>
        </div>
    </div>
);


export default function LiveCapacityDashboard() {
    const { division } = useAuth();
    const isPreparation = division === "preparation";

    // --- FUTURE API STUBS ---
    // These states represent data that currently needs to be manually inputted,
    // but in the future will be populated via external API calls (e.g. active clients from TaxDome/CRM, active staff from HRIS).
    const [liveClients, setLiveClients] = useLocalStorage("live_clients", 120);
    const [liveAdvisors, setLiveAdvisors] = useLocalStorage("live_advisors", 4);
    const [liveSupport, setLiveSupport] = useLocalStorage("live_support", 2);

    const advisorCapacity = 160; // Locked to 160 internally
    const [supportCapacity, setSupportCapacity] = useLocalStorage("live_supportCapacity", 140);
    const [hoursPerClient, setHoursPerClient] = useLocalStorage("live_hoursPerClient", 5.5);
    const [supportHoursPerClient, setSupportHoursPerClient] = useLocalStorage("live_supportHoursPerClient", 2);
    const [advisorTargetUtilization, setAdvisorTargetUtilization] = useLocalStorage("live_advisorTargetUtil", 85);
    const [supportTargetUtilization, setSupportTargetUtilization] = useLocalStorage("live_supportTargetUtil", 85);

    // --- ACTUALS DATA ---
    const [actualTotalHours, setActualTotalHours] = useState(0);
    const [actualAdvisorHours, setActualAdvisorHours] = useState(0);
    const [actualSupportHours, setActualSupportHours] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchLiveActuals = React.useCallback(async () => {
        setIsRefreshing(true);
        try {
            // Future: Also fetch external APIs here
            // const clients = await fetchFutureClientAPI();
            // setLiveClients(clients.count);

            // Cache busting param to ensure it fetches fresh data when swapping tabs
            const res = await fetch(`/api/time-entries?t=${Date.now()}`);
            const data = await res.json();

            // Filter for only the last 30 days to calculate a true "Run Rate"
            const now = new Date();
            const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

            // Note: In a fully scaled app, you might only fetch division-specific entries. 
            // For now we map everything locally the same way ActualsDashboard does, 
            // or just take the global pulse since it's an internal tool.
            const recentEntries = data.filter((e: any) => new Date(e.timestamp) > thirtyDaysAgo);

            const totalMin = recentEntries.reduce((acc: number, curr: any) => acc + curr.duration, 0);
            const advMin = recentEntries.filter((e: any) => e.category === 'advisor' || !e.category).reduce((acc: number, curr: any) => acc + curr.duration, 0);
            const suppMin = recentEntries.filter((e: any) => e.category === 'support').reduce((acc: number, curr: any) => acc + curr.duration, 0);

            setActualTotalHours(totalMin / 60);
            setActualAdvisorHours(advMin / 60);
            setActualSupportHours(suppMin / 60);

        } catch (error) {
            console.error("Failed to fetch live actuals:", error);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchLiveActuals();
    }, [fetchLiveActuals]);


    // --- REALITY METRIC CALCULATIONS ---
    // The exact run-rate of the last 30 days (for FYI / visual comparison only)
    const actualHoursPerClient = liveClients > 0 ? (actualTotalHours / liveClients) : 0;
    const actualAdvisorHoursPerClient = liveClients > 0 ? (actualAdvisorHours / liveClients) : 0;
    const actualSupportHoursPerClient = liveClients > 0 ? (actualSupportHours / liveClients) : 0;

    // Total physical capacity of the team 
    const totalAdvisorCapacity = liveAdvisors * advisorCapacity;
    const totalSupportCapacity = liveSupport * supportCapacity;

    // Calculate maximum capacity based on the stable ASSUMED hours per client, 
    // rather than the volatile active tracking rate.
    const advisorMaxClients = hoursPerClient > 0 ? Math.floor((totalAdvisorCapacity * (advisorTargetUtilization / 100)) / hoursPerClient) : 0;
    const supportMaxClients = supportHoursPerClient > 0 ? Math.floor((totalSupportCapacity * (supportTargetUtilization / 100)) / supportHoursPerClient) : 0;

    // Firm physical limit is the lowest of the bottlenecked teams
    const firmMaxClients = Math.min(advisorMaxClients, supportMaxClients);
    const bottleneck = advisorMaxClients < supportMaxClients ? "Advisors" : supportMaxClients < advisorMaxClients ? "Support" : "Both";

    const safeNewClientsCapacity = Math.max(0, firmMaxClients - liveClients);

    // Current Utilization (Actual Hours Logged / Total Physical Capacity)
    const currentAdvisorUtilization = totalAdvisorCapacity > 0 ? (actualAdvisorHours / totalAdvisorCapacity) * 100 : 0;
    const currentSupportUtilization = totalSupportCapacity > 0 ? (actualSupportHours / totalSupportCapacity) * 100 : 0;

    const utilizationRate = Math.max(currentAdvisorUtilization, currentSupportUtilization);

    // Warnings
    const isOverCapacity = liveClients > firmMaxClients;
    const isAdvisorWarning = currentAdvisorUtilization > (advisorTargetUtilization - 5);
    const isSupportWarning = currentSupportUtilization > (supportTargetUtilization - 5);
    const isHiringWarning = !isOverCapacity && (isAdvisorWarning || isSupportWarning);

    // Growth Projections (assuming a static 5% growth to demonstrate the API capability)
    const projectedGrowthRate = 5;

    const projectionData = Array.from({ length: 6 }).map((_, i) => {
        const monthDetails = new Date();
        monthDetails.setMonth(monthDetails.getMonth() + i + 1);
        const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(monthDetails);

        // Compounded clients based on steady growth
        const monthClients = Math.floor(liveClients * Math.pow(1 + (projectedGrowthRate / 100), i + 1));

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
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-blue-500">
                            <Activity size={20} />
                            <h3 className="font-bold text-gray-900 dark:text-white">Live Interfaces</h3>
                        </div>
                        <button
                            onClick={fetchLiveActuals}
                            disabled={isRefreshing}
                            className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Refresh Actuals Data"
                        >
                            <RefreshCw size={16} className={cn(isRefreshing && "animate-spin")} />
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                        These fields currently require manual update. In the future, they will automatically sync with your firm&apos;s active client roster and HR system.
                    </p>

                    <div className="space-y-4">
                        <NumberControl
                            label="Actual Active Clients"
                            value={liveClients}
                            onChange={setLiveClients}
                            unit="clients"
                            isExternalSource
                        />
                        <NumberControl
                            label="Actual Advisor Count"
                            value={liveAdvisors}
                            onChange={setLiveAdvisors}
                            unit="staff"
                            isExternalSource
                        />
                        <NumberControl
                            label="Actual Support Count"
                            value={liveSupport}
                            onChange={setLiveSupport}
                            unit="staff"
                            isExternalSource
                        />

                        <div className="pt-6 mt-6 border-t border-border-light dark:border-border-dark">
                            <h4 className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-500 font-bold mb-4">Static Assumptions</h4>
                            <div className="mb-4">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="text-gray-600 dark:text-gray-300 font-medium flex items-center gap-1">
                                        Max Advisor Capacity
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg px-3 py-2 opacity-70 cursor-not-allowed">
                                    <input
                                        type="number"
                                        value={advisorCapacity}
                                        readOnly
                                        className="w-full bg-transparent text-left font-bold text-gray-900 dark:text-white focus:outline-none cursor-not-allowed"
                                    />
                                    <span className="text-xs text-gray-500 font-medium shrink-0">hrs/mo</span>
                                </div>
                            </div>
                            <NumberControl
                                label="Target Adv. Util %"
                                value={advisorTargetUtilization}
                                onChange={setAdvisorTargetUtilization}
                                unit="%"
                            />
                            <NumberControl
                                label="Target Sup. Util %"
                                value={supportTargetUtilization}
                                onChange={setSupportTargetUtilization}
                                unit="%"
                            />
                            <NumberControl
                                label="Advisor Hrs / Client"
                                value={hoursPerClient}
                                onChange={setHoursPerClient}
                                unit="hrs/mo"
                            />
                            <NumberControl
                                label="Support Hrs / Client"
                                value={supportHoursPerClient}
                                onChange={setSupportHoursPerClient}
                                unit="hrs/mo"
                            />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Content Area */}
            <div className="xl:col-span-9 space-y-6">
                {/* Live Status Banner */}
                <div className={cn(
                    "rounded-lg p-4 flex items-start gap-4 border shadow-sm transition-all duration-300 relative overflow-hidden",
                    isOverCapacity
                        ? "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
                        : isHiringWarning
                            ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
                            : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                )}>
                    {/* Pulsing indicator */}
                    <div className={cn(
                        "absolute right-4 top-4 w-2 h-2 rounded-full animate-ping",
                        isOverCapacity ? "bg-red-500" : isHiringWarning ? "bg-yellow-500" : "bg-blue-500"
                    )} />

                    <AlertTriangle size={24} className={cn("mt-0.5 shrink-0", isOverCapacity ? "text-red-600 dark:text-red-500" : isHiringWarning ? "text-yellow-600 dark:text-yellow-500" : "text-blue-600 dark:text-blue-500")} />
                    <div className="flex-1">
                        <h4 className={cn("font-bold text-base uppercase mb-1", isOverCapacity ? "text-red-800 dark:text-red-400" : isHiringWarning ? "text-yellow-800 dark:text-yellow-400" : "text-blue-800 dark:text-blue-400")}>
                            {isOverCapacity ? "Live Alert: Teams Over Capacity" : isHiringWarning ? "Live Alert: Approaching Capacity Limit" : "Live Pulse: Teams Healthy"}
                        </h4>
                        <p className={cn("text-sm", isOverCapacity ? "text-red-700 dark:text-red-300" : isHiringWarning ? "text-yellow-700 dark:text-yellow-300" : "text-blue-700 dark:text-blue-300")}>
                            Based on real logged hours over the last 30 days, your firm is {isOverCapacity ? "over target capacity" : isHiringWarning ? "approaching target limits" : "healthy"}.
                            <br />
                            <span className="font-bold opacity-80 mt-1 block">Current Bottleneck: {bottleneck}</span>
                        </p>
                    </div>
                </div>

                {/* Core Capacity Metrics - Real Data */}
                <h4 className="text-gray-500 uppercase tracking-wider text-xs font-bold mb-2">Live Core Capacity</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <MetricCard
                        icon={Users}
                        label="Live Clients"
                        value={liveClients}
                        iconColorClass="text-blue-500"
                    />
                    <MetricCard
                        icon={Briefcase}
                        label="Safe To Onboard"
                        value={safeNewClientsCapacity}
                        subtext={`Bottleneck: ${bottleneck}`}
                        iconColorClass="text-blue-500"
                        valueColorClass={safeNewClientsCapacity <= 0 ? "text-red-500" : "text-gray-900 dark:text-white"}
                        tooltip={`Calculated dynamically against Target Utilization and Real Run-Rate.`}
                    />
                    <MetricCard
                        icon={Activity}
                        label="Live Run-Rate"
                        value={`${actualAdvisorHoursPerClient.toFixed(1)} hr/c`}
                        subtext="actual burn over last 30 days (Adv)"
                        iconColorClass="text-yellow-500"
                        tooltip="Total actual hours logged divided by active roster count."
                    />
                </div>

                {/* Real Data Charting */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Live Utilization Gauge (Visualized as a ring/progress or bars) */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Activity size={18} className="text-blue-500" /> True Utilization %
                            </h3>
                            <div className="text-xs text-gray-500">Last 30 Days Logging</div>
                        </div>

                        <div className="space-y-8 mt-8">
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-900 dark:text-white font-bold">Advisors</span>
                                    <span className={cn("font-bold font-mono", currentAdvisorUtilization > 100 ? "text-red-500" : "text-blue-500")}>
                                        {Math.round(currentAdvisorUtilization)}%
                                    </span>
                                </div>
                                <div className="h-4 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                                    <div
                                        className={cn("absolute top-0 left-0 h-full transition-all duration-1000",
                                            currentAdvisorUtilization > 100 ? "bg-red-500" : "bg-blue-500"
                                        )}
                                        style={{ width: `${Math.min(currentAdvisorUtilization, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-400 mt-2 text-right">
                                    {actualAdvisorHours.toFixed(0)} Hrs Logged / {totalAdvisorCapacity} Hrs Max
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-900 dark:text-white font-bold">Support / Admin</span>
                                    <span className={cn("font-bold font-mono", currentSupportUtilization > 100 ? "text-red-500" : "text-blue-500")}>
                                        {Math.round(currentSupportUtilization)}%
                                    </span>
                                </div>
                                <div className="h-4 w-full bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden relative">
                                    <div
                                        className={cn("absolute top-0 left-0 h-full transition-all duration-1000",
                                            currentSupportUtilization > 100 ? "bg-red-500" : "bg-blue-500"
                                        )}
                                        style={{ width: `${Math.min(currentSupportUtilization, 100)}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-400 mt-2 text-right">
                                    {actualSupportHours.toFixed(0)} Hrs Logged / {totalSupportCapacity} Hrs Max
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Funnel/Projection built purely on run-rate */}
                    <Card className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Run-Rate Capacity Projection</h3>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">5% Growth Model</div>
                        </div>
                        <div className="h-48 w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={projectionData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                    <XAxis dataKey="month" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="left" stroke="#888" fontSize={11} tickLine={false} axisLine={false} />
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
                        <p className="text-xs text-gray-400 italic text-center mt-4">This chart uses the actual 30-day trailing ratio of {actualAdvisorHoursPerClient.toFixed(1)} hrs/client to project future stress.</p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
