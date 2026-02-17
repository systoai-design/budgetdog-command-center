"use client";

import React, { useState, useEffect } from "react";
import { Plus, Clock, FileText, Trash2, Calendar, Tag, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const CHARGE_CODES = [
    "Call Prep - Kick Off Call",
    "Kick Off Live Call",
    "Call Prep - Deep Dive Call",
    "Deep Dive Live Call",
    "Call Prep - Tax Projection Call",
    "Tax Projection Live Call",
    "Admin/Other",
];

interface TimeEntry {
    id: string;
    chargeCode: string;
    category: "advisor" | "support";
    duration: number; // in minutes
    notes: string;
    timestamp: Date;
}

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

export default function TimeTracker() {
    const { user, viewMode } = useAuth();
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [chargeCode, setChargeCode] = useState(CHARGE_CODES[0]);

    // Auto-select category based on viewMode (for Super Admins) or role
    const category = viewMode === "support" ? "support" : "advisor";

    // Date Input State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Filter State
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    // Duration split
    const [hours, setHours] = useState("");
    const [minutes, setMinutes] = useState("");
    const [seconds, setSeconds] = useState("");

    const [notes, setNotes] = useState("");

    // Load entries from API
    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const res = await fetch("/api/time-entries");
                const data = await res.json();
                // Map snake_case to camelCase
                const mappedData = data.map((entry: any) => ({
                    id: entry.id,
                    chargeCode: entry.charge_code,
                    category: entry.category,
                    duration: entry.duration,
                    notes: entry.notes,
                    timestamp: new Date(entry.timestamp),
                }));
                setEntries(mappedData);
            } catch (error) {
                console.error("Failed to load entries:", error);
            }
        };
        fetchEntries();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Calculate total minutes
        const h = Number(hours) || 0;
        const m = Number(minutes) || 0;
        const s = Number(seconds) || 0;
        const totalDurationMinutes = (h * 60) + m + (s / 60);

        if (totalDurationMinutes <= 0) return;

        // Combine selected date with current time for more precision if needed, 
        // or just set to noon to avoid timezone issues for simple date logging
        const entryDate = new Date(date);
        const now = new Date();
        entryDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

        const newEntry: TimeEntry = {
            id: Math.random().toString(36).substr(2, 9),
            chargeCode,
            category,
            duration: Number(totalDurationMinutes.toFixed(2)),
            notes,
            timestamp: entryDate,
        };

        try {
            await fetch("/api/time-entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newEntry),
            });
            setEntries([newEntry, ...entries]);
            // Reset fields but keep date
            setHours("");
            setMinutes("");
            setSeconds("");
            setNotes("");
        } catch (error) {
            console.error("Failed to save entry:", error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await fetch(`/api/time-entries/${id}`, { method: "DELETE" });
            setEntries(entries.filter((e) => e.id !== id));
        } catch (error) {
            console.error("Failed to delete entry:", error);
        }
    };

    // Filter entries for display based on viewMode and Date Range
    const visibleEntries = entries.filter(entry => {
        // 1. Filter by View Mode
        const matchesCategory = viewMode === 'admin' || entry.category === viewMode;

        // 2. Filter by Date Range
        const entryDate = new Date(entry.timestamp).toISOString().split('T')[0];
        const matchesDate = entryDate >= startDate && entryDate <= endDate;

        return matchesCategory && matchesDate;
    });

    const handleExport = () => {
        const headers = ["ID", "Timestamp", "Charge Code", "Category", "Duration (min)", "Notes"];
        const csvContent = [
            headers.join(","),
            ...visibleEntries.map(e => [
                e.id,
                e.timestamp.toISOString(),
                `"${e.chargeCode}"`,
                e.category,
                e.duration,
                `"${e.notes || ''}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `time_entries_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalMinutes = entries.reduce((acc, curr) => acc + curr.duration, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    return (
        <Card className="p-0 overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Time Tracker</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Log your active client work</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background-light dark:bg-background-dark rounded-full border border-border-light dark:border-border-dark">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{totalHours} hrs</span>
                    <span className="text-xs text-gray-400">total</span>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left: Input Form */}
                <div className="xl:col-span-1 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Role Badge */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                <User size={12} /> Work Category
                            </label>
                            <div className={cn(
                                "flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium",
                                category === "advisor"
                                    ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800/30 text-blue-700 dark:text-blue-300"
                                    : "bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800/30 text-purple-700 dark:text-purple-300"
                            )}>
                                <span className={cn("w-2 h-2 rounded-full", category === "advisor" ? "bg-blue-500" : "bg-purple-500")}></span>
                                {category === "advisor" ? "Advisor" : "Support / Admin"} (Auto-Selected)
                            </div>
                        </div>

                        {/* Date Input */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                <Calendar size={12} /> Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                                required
                            />
                        </div>

                        {/* Duration Inputs */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                <Clock size={12} /> Duration
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-600 dark:text-gray-400 mb-1 block">Hours</label>
                                    <input
                                        type="number"
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-3 text-center text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-mono text-lg"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-600 dark:text-gray-400 mb-1 block">Minutes</label>
                                    <input
                                        type="number"
                                        value={minutes}
                                        onChange={(e) => setMinutes(e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-3 text-center text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-mono text-lg"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-600 dark:text-gray-400 mb-1 block">Seconds</label>
                                    <input
                                        type="number"
                                        value={seconds}
                                        onChange={(e) => setSeconds(e.target.value)}
                                        placeholder="0"
                                        min="0"
                                        className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-3 text-center text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 font-mono text-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Charge Code */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                <Tag size={12} /> Charge Code
                            </label>
                            <select
                                value={chargeCode}
                                onChange={(e) => setChargeCode(e.target.value)}
                                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all cursor-pointer"
                            >
                                {CHARGE_CODES.map((code) => (
                                    <option key={code} value={code}>
                                        {code}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Notes */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                <FileText size={12} /> Notes
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Details about this task..."
                                rows={3}
                                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-lg p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-zinc-600 resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3.5 rounded-lg transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
                        >
                            <Plus size={18} strokeWidth={3} />
                            Log Entry
                        </button>
                    </form>
                </div>

                {/* Right: History Log */}
                <div className="xl:col-span-2 flex flex-col h-full bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden">
                    <div className="px-4 py-3 border-b border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-zinc-900/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                            <Calendar size={14} />
                            Recent Activity
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Date Range Filter */}
                            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-lg p-1 border border-border-light dark:border-border-dark shadow-sm">
                                <div className="flex items-center gap-1 px-2">
                                    <span className="text-[10px] uppercase font-bold text-gray-400">From</span>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="bg-transparent text-xs text-gray-700 dark:text-gray-200 outline-none w-24 cursor-pointer"
                                    />
                                </div>
                                <div className="w-px h-4 bg-border-light dark:bg-border-dark"></div>
                                <div className="flex items-center gap-1 px-2">
                                    <span className="text-[10px] uppercase font-bold text-gray-400">To</span>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="bg-transparent text-xs text-gray-700 dark:text-gray-200 outline-none w-24 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleExport}
                                className="text-xs text-primary hover:text-primary-hover font-medium flex items-center gap-1 ml-2"
                            >
                                Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[500px] p-0 custom-scrollbar">
                        {visibleEntries.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-400 dark:text-zinc-600 gap-4">
                                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <FileText size={24} className="opacity-50" />
                                </div>
                                <p className="text-sm">No recent time entries found.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-gray-50 dark:bg-zinc-900/50 text-gray-600 dark:text-gray-400 sticky top-0 z-10 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="p-4 font-semibold border-b border-border-light dark:border-border-dark">Date/Time</th>
                                        <th className="p-4 font-semibold border-b border-border-light dark:border-border-dark">Client / Task</th>
                                        <th className="p-4 font-semibold border-b border-border-light dark:border-border-dark">Notes</th>
                                        <th className="p-4 font-semibold border-b border-border-light dark:border-border-dark">Role</th>
                                        <th className="p-4 font-semibold border-b border-border-light dark:border-border-dark">Duration</th>
                                        <th className="p-4 font-semibold text-right border-b border-border-light dark:border-border-dark"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                    {visibleEntries.map((entry) => (
                                        <tr key={entry.id} className="group hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                                            <td className="p-4 whitespace-nowrap text-gray-600 dark:text-gray-400 text-xs">
                                                <div className="font-medium text-gray-700 dark:text-gray-300">{entry.timestamp.toLocaleDateString()}</div>
                                                <div>{entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-900 dark:text-white mb-0.5">{entry.chargeCode}</div>
                                            </td>
                                            <td className="p-4 text-gray-600 dark:text-gray-400 max-w-[150px] truncate" title={entry.notes}>
                                                {entry.notes || "-"}
                                            </td>
                                            <td className="p-4">
                                                <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold border",
                                                    entry.category === 'advisor'
                                                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/30"
                                                        : "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/30"
                                                )}>
                                                    {entry.category}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono text-gray-700 dark:text-gray-300">
                                                {formatDuration(entry.duration)}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDelete(entry.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Delete Entry"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

function formatDuration(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    // Optional: if we want seconds, we need to store them more precisely or calculate remainder
    // For now, let's show Hh Mm
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}
