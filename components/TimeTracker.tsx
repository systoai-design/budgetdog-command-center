"use client";

import React, { useState, useEffect } from "react";
import { Plus, Clock, FileText, Trash2 } from "lucide-react";
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

export default function TimeTracker() {
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [chargeCode, setChargeCode] = useState(CHARGE_CODES[0]);
    const [category, setCategory] = useState<"advisor" | "support">("advisor");
    const [duration, setDuration] = useState("");
    const [notes, setNotes] = useState("");

    const [isLoaded, setIsLoaded] = useState(false);

    // Load entries from localStorage
    useEffect(() => {
        const savedEntries = localStorage.getItem("budgetdog_time_entries");
        setTimeout(() => {
            if (savedEntries) {
                setEntries(JSON.parse(savedEntries));
            }
            setIsLoaded(true);
        }, 0);
    }, []);

    // Save entries to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("budgetdog_time_entries", JSON.stringify(entries));
        }
    }, [entries, isLoaded]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!duration) return;

        const newEntry: TimeEntry = {
            id: Math.random().toString(36).substr(2, 9),
            chargeCode,
            category,
            duration: Number(duration),
            notes,
            timestamp: new Date(),
        };

        setEntries([newEntry, ...entries]);
        setDuration("");
        setNotes("");
    };

    const handleDelete = (id: string) => {
        setEntries(entries.filter((e) => e.id !== id));
    };

    const totalMinutes = entries.reduce((acc, curr) => acc + curr.duration, 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                <Clock size={20} className="text-yellow-400" />
                Time Tracker
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Entry Form */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">
                                    Work Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as "advisor" | "support")}
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                                >
                                    <option value="advisor">Advisor</option>
                                    <option value="support">Support/Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-1">
                                    Duration (min)
                                </label>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    placeholder="60"
                                    min="1"
                                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">
                                Charge Code
                            </label>
                            <select
                                value={chargeCode}
                                onChange={(e) => setChargeCode(e.target.value)}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                            >
                                {CHARGE_CODES.map((code) => (
                                    <option key={code} value={code}>
                                        {code}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-1">
                                Notes
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Client name, details..."
                                rows={3}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus size={18} />
                            Add Entry
                        </button>
                    </form>
                </div>

                {/* Log & Summary */}
                <div className="lg:col-span-2 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Recent Entries</h3>
                        <div className="text-sm bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700 text-yellow-400 font-mono">
                            Total: {totalHours} hrs
                        </div>
                    </div>

                    <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 flex-1 overflow-hidden">
                        {entries.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-500 p-8">
                                <FileText size={48} className="mb-4 opacity-20" />
                                <p>No time entries yet.</p>
                            </div>
                        ) : (
                            <div className="overflow-y-auto max-h-[400px]">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-zinc-800 text-zinc-400 sticky top-0">
                                        <tr>
                                            <th className="p-3 font-medium">Code</th>
                                            <th className="p-3 font-medium">Role</th>
                                            <th className="p-3 font-medium">Duration</th>
                                            <th className="p-3 font-medium">Notes</th>
                                            <th className="p-3 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800">
                                        {entries.map((entry) => (
                                            <tr key={entry.id} className="hover:bg-zinc-900/50 transition-colors">
                                                <td className="p-3 text-white font-medium">
                                                    {entry.chargeCode}
                                                </td>
                                                <td className="p-3">
                                                    <span className={cn("px-2 py-0.5 rounded text-[10px] uppercase font-bold",
                                                        entry.category === 'advisor' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20")}>
                                                        {entry.category}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-zinc-300">
                                                    {entry.duration} min
                                                </td>
                                                <td className="p-3 text-zinc-400 truncate max-w-[200px]">
                                                    {entry.notes || "-"}
                                                </td>
                                                <td className="p-3 text-right">
                                                    <button
                                                        onClick={() => handleDelete(entry.id)}
                                                        className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
