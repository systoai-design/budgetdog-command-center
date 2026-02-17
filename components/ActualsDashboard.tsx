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
    Legend,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Activity, PieChart as PieIcon, BarChart3, TrendingUp, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// COLORS moved to component scope for semantic clarity

const Card = ({ children, title, icon: Icon }: { children: React.ReactNode; title: string; icon: React.ElementType }) => (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm flex flex-col h-full">
        <div className="flex items-center gap-2 mb-6 text-primary">
            <Icon size={18} />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="flex-1 min-h-[250px] w-full relative">
            {children}
        </div>
    </div>
);

export default function ActualsDashboard() {
    interface DbEntry {
        id: string;
        charge_code: string;
        category: "advisor" | "support";
        duration: number;
        notes: string;
        timestamp: string;
    }
    const { viewMode } = useAuth();
    const [entries, setEntries] = useState<DbEntry[]>([]);

    // Filter State
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchEntries = async () => {
            const res = await fetch("/api/time-entries");
            const data = await res.json();
            setEntries(data);
        };
        fetchEntries();
    }, []);

    // Filter based on viewMode and Date Range
    const filteredEntries = entries.filter(e => {
        // 1. View Mode Filter
        const matchesCategory = viewMode === 'admin' || e.category === viewMode;

        // 2. Date Range Filter
        const entryDate = new Date(e.timestamp).toISOString().split('T')[0];
        const matchesDate = entryDate >= startDate && entryDate <= endDate;

        return matchesCategory && matchesDate;
    });

    // Semantic Colors
    const COLOR_ADVISOR = "#3b82f6"; // Blue-500
    const COLOR_SUPPORT = "#a855f7"; // Purple-500
    const COLORS = [COLOR_ADVISOR, COLOR_SUPPORT];

    // Process Data: Weekly Trend (Stacked)
    const last4Weeks = Array.from({ length: 4 }).map((_, i) => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() - 7);

        // Format Date Range Label (e.g. "Feb 10-17")
        const startLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(weekEnd);
        const endLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(weekStart);

        const weekEntries = filteredEntries.filter(e => new Date(e.timestamp) <= weekStart && new Date(e.timestamp) > weekEnd);

        const advisorHours = weekEntries.filter(e => e.category === 'advisor').reduce((acc, curr) => acc + (curr.duration / 60), 0);
        const supportHours = weekEntries.filter(e => e.category === 'support').reduce((acc, curr) => acc + (curr.duration / 60), 0);

        return {
            name: `${startLabel}`, // Simplified label
            fullLabel: `${startLabel} - ${endLabel}`,
            Advisor: Number(advisorHours.toFixed(1)),
            Support: Number(supportHours.toFixed(1)),
            total: Number((advisorHours + supportHours).toFixed(1))
        };
    }).reverse();

    // Process Data: Role Breakdown
    const roleData = [
        { name: "Advisor", value: filteredEntries.filter(e => e.category === 'advisor').reduce((acc, curr) => acc + curr.duration, 0), color: COLOR_ADVISOR },
        { name: "Support", value: filteredEntries.filter(e => e.category === 'support').reduce((acc, curr) => acc + curr.duration, 0), color: COLOR_SUPPORT },
    ].filter(d => d.value > 0);

    // Process Data: Top Charge Codes
    const codeMap: Record<string, number> = {};
    filteredEntries.forEach(e => {
        codeMap[e.charge_code] = (codeMap[e.charge_code] || 0) + (e.duration / 60);
    });
    const codeData = Object.entries(codeMap)
        .map(([name, hours]) => ({ name, hours: Number(hours.toFixed(1)) }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 5);

    const handleExport = () => {
        const headers = ["ID", "Timestamp", "Charge Code", "Category", "Duration (min)", "Notes"];
        const csvContent = [
            headers.join(","),
            ...filteredEntries.map(e => [
                e.id,
                e.timestamp,
                `"${e.charge_code}"`,
                e.category,
                e.duration,
                `"${e.notes || ''}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `actuals_export_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="text-primary" size={24} />
                    Actuals Analytics
                </h2>
                <div className="flex flex-wrap items-center gap-4">
                    {/* Date Range Filter */}
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-lg p-1 border border-border-light dark:border-border-dark shadow-sm">
                        <div className="flex items-center gap-1 px-2">
                            <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">From</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-transparent text-xs text-gray-900 dark:text-gray-200 outline-none w-24 cursor-pointer font-medium"
                            />
                        </div>
                        <div className="w-px h-4 bg-border-light dark:bg-border-dark"></div>
                        <div className="flex items-center gap-1 px-2">
                            <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">To</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-transparent text-xs text-gray-900 dark:text-gray-200 outline-none w-24 cursor-pointer font-medium"
                            />
                        </div>
                    </div>

                    <div className="h-6 w-px bg-gray-300 dark:bg-zinc-700 hidden sm:block"></div>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 py-1.5 bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <Download size={14} />
                        Export
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
                <Card title="Weekly Trend (Total Hours)" icon={TrendingUp}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={last4Weeks}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} stroke="#374151" />
                            <XAxis dataKey="name" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#171717",
                                    borderColor: "#262626",
                                    borderRadius: "0.5rem",
                                    color: "#fff"
                                }}
                                itemStyle={{ color: "#fff" }}
                                cursor={{ fill: 'transparent' }}
                            />
                            <Legend wrapperStyle={{ color: "#374151" }} />
                            <Bar dataKey="Advisor" stackId="a" fill={COLOR_ADVISOR} radius={[0, 0, 4, 4]} />
                            <Bar dataKey="Support" stackId="a" fill={COLOR_SUPPORT} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Role Distribution" icon={PieIcon}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={roleData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {roleData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#171717",
                                    borderColor: "#262626",
                                    borderRadius: "0.5rem",
                                    color: "#fff"
                                }}
                            />
                            <Legend wrapperStyle={{ color: "#374151" }} />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Hours by Activity (Top 5)" icon={BarChart3}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={codeData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} stroke="#374151" />
                            <XAxis type="number" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis dataKey="name" type="category" stroke="#4b5563" fontSize={10} width={150} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "#171717",
                                    borderColor: "#262626",
                                    borderRadius: "0.5rem",
                                    color: "#fff"
                                }}
                                itemStyle={{ color: "#fbbf24" }}
                                cursor={{ fill: 'transparent' }}
                            />
                            <Bar dataKey="hours" fill="#a855f7" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Recent Activity Log" icon={Activity}>
                    <div className="absolute inset-0 overflow-auto custom-scrollbar p-2">
                        <table className="w-full text-left">
                            <thead className="text-gray-600 dark:text-gray-400 text-xs uppercase border-b border-border-light dark:border-border-dark sticky top-0 bg-surface-light dark:bg-surface-dark">
                                <tr>
                                    <th className="pb-3 pl-2">Date</th>
                                    <th className="pb-3">Activity</th>
                                    <th className="pb-3 text-right pr-2">Hrs</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                {filteredEntries.slice(0, 10).map((e, i) => (
                                    <tr key={i} className="text-sm hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                                        <td className="py-3 pl-2 text-gray-600 dark:text-gray-400">{new Date(e.timestamp).toLocaleDateString()}</td>
                                        <td className="py-3 font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{e.charge_code}</td>
                                        <td className="py-3 pr-2 text-right text-primary font-bold">{(e.duration / 60).toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
