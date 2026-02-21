"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Clock, Save, RefreshCw, User, ChevronLeft, ChevronRight, FileText, Edit2, Trash2, CheckCircle, AlertCircle, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const ADVISOR_CODES = [
    "Call Prep - Kick Off Call",
    "Kick Off Live Call",
    "Kick Off Call Follow Up Questions",
    "Call Prep - Deep Dive Call",
    "Deep Dive Live Call",
    "Deep Dive Call Follow Up Questions",
    "Call Prep - Tax Projection Call",
    "Tax Projection Live Call",
    "Tax Projection Call Follow Up Questions",
    "Call Prep - Check In Call",
    "Check In Live Call",
    "Check In Call Follow Up Questions",
    "Weekly SKOOL Member Call",
    "Admin/Other",
];

const SUPPORT_CODES = [
    "Call Prep - Kick Off Call",
    "Kick Off Call Follow Up Questions",
    "Kick Off Call Recording/Summary/Notes Sent to Client",
    "Call Prep - Deep Dive Call",
    "Deep Dive Call Follow Up Questions",
    "Deep Dive Call Recording/Summary/Notes Sent to Client",
    "Call Prep - Tax Projection Call",
    "Tax Projection Call Follow Up Questions",
    "Tax Projection Call Recording/Summary/Notes Sent to Client",
    "Call Prep - Check In Call",
    "Check In Call Follow Up Questions",
    "Check In Call Recording/Summary/Notes Sent to Client",
    "Admin/Other",
];

// --- Tax Preparation Division Charge Codes ---
const TAX_PLANNING_ADMIN_CODES = [
    "New Client Onboarding",
    "Prep-Kickoff Call",
    "Prep-Deep Dive Call",
    "Prep-Tax Projection Call",
    "Client Follow-up Kickoff Call",
    "Client Follow-up Deep Dive Call",
    "Client Follow-up Tax Projection Call",
    "Client Follow-up Check In Call",
    "Admin (Responding to clients)",
    "Admin (Not responding to clients)",
];

const TAX_PREP_ADMIN_CODES = [
    "Government Forms Organizer Review",
    "Schedule C/Rental Organizer Review",
    "Business Tax Return Organizer Review",
    "Preparing 1040 Workbooks",
    "Preparing Business Return Workbooks",
    "Draft Return Approval",
    "E-signature",
    "E-filing",
    "Admin (Responding to clients)",
    "Admin (Not responding to clients)",
];

const PREPARER_L1_CODES = [
    "1040 Workbook Preparation",
    "Business Return Preparation",
    "Admin (Responding to clients)",
    "Admin (Not responding to clients)",
];

const PREPARER_L2_CODES = [
    "1040 Workbook Review",
    "Business Return Review",
    "Admin (Responding to clients)",
    "Admin (Not responding to clients)",
];

const REVIEWER_CODES = [
    "1040 Workbook Final Review",
    "Business Return Final Review",
    "Admin (Responding to clients)",
    "Admin (Not responding to clients)",
];

const PROJECT_MANAGER_CODES = [
    "Conducted Daily Meeting with Tax Team",
    "1-1 Touchpoints with Tax Team",
    "Assigning Individual Returns",
    "Assigning Business Returns",
];

// Map viewMode -> charge codes
const CODE_MAP: Record<string, string[]> = {
    advisor: ADVISOR_CODES,
    support: SUPPORT_CODES,
    admin: ADVISOR_CODES, // Admin sees advisor codes by default (Planning)
    tax_planning_admin: TAX_PLANNING_ADMIN_CODES,
    tax_prep_admin: TAX_PREP_ADMIN_CODES,
    preparer_l1: PREPARER_L1_CODES,
    preparer_l2: PREPARER_L2_CODES,
    reviewer: REVIEWER_CODES,
    project_manager: PROJECT_MANAGER_CODES,
};

interface TimeEntry {
    id: string;
    charge_code: string;
    category: string;
    duration: number; // in minutes
    notes: string;
    timestamp: string; // ISO string
    user_email?: string;
    status?: "approved" | "pending";
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

// Edit Modal Component
const EditModal = ({
    isOpen,
    onClose,
    entry,
    onSave
}: {
    isOpen: boolean;
    onClose: () => void;
    entry: TimeEntry | null;
    onSave: (id: string, updates: Partial<TimeEntry>) => Promise<void>;
}) => {
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (entry) {
            setHours(Math.floor(entry.duration / 60));
            setMinutes(entry.duration % 60);
            setNotes(entry.notes || "");
        }
    }, [entry]);

    if (!isOpen || !entry) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const totalMinutes = (hours * 60) + minutes;
        if (totalMinutes === 0) return alert("Duration cannot be zero");

        await onSave(entry.id, {
            duration: totalMinutes,
            notes
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md p-6 relative bg-white dark:bg-zinc-900">
                <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-900 dark:hover:text-white">
                    <X size={20} />
                </button>
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Entry</h2>
                <div className="mb-4">
                    <p className="text-sm font-bold text-gray-500 uppercase">Charge Code</p>
                    <p className="text-gray-900 dark:text-white font-medium">{entry.charge_code}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Hours</label>
                            <input
                                type="number" min="0"
                                value={hours} onChange={e => setHours(parseInt(e.target.value) || 0)}
                                className="w-full p-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Minutes</label>
                            <input
                                type="number" min="0" max="59"
                                value={minutes} onChange={e => setMinutes(parseInt(e.target.value) || 0)}
                                className="w-full p-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Notes</label>
                        <textarea
                            rows={3}
                            value={notes} onChange={e => setNotes(e.target.value)}
                            className="w-full p-2 rounded-lg border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white resize-none"
                        />
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-lg transition-colors">
                            Save Changes & Request Approval
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default function TimeTracker() {
    const { user, viewMode, division } = useAuth();

    // Config: Select charge codes based on current viewMode
    const currentCodes = CODE_MAP[viewMode] || ADVISOR_CODES;

    // State
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [entries, setEntries] = useState<TimeEntry[]>([]); // All entries for list

    // Toast State
    const [toast, setToast] = useState<{ message: string, type: "success" | "error" } | null>(null);

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Initialize Date based on user timezone
    useEffect(() => {
        if (user && !selectedDate) {
            const tz = user.timezone || "America/New_York";
            try {
                // "en-CA" formats as YYYY-MM-DD which is required for input type="date"
                const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
                setSelectedDate(todayStr);
            } catch (e) {
                // Fallback if timezone is invalid
                setSelectedDate(new Date().toISOString().split('T')[0]);
            }
        }
    }, [user, selectedDate]);

    // Grid State
    const [gridState, setGridState] = useState<Record<string, { hours: number, minutes: number, id?: string, notes?: string }>>({});

    // Modal State
    const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
    const [isLogExpanded, setIsLogExpanded] = useState(true);

    // Fetch entries
    // Fetch entries
    const fetchEntries = useCallback(async () => {
        if (!user || !selectedDate) return;
        setIsLoading(true);
        try {
            let url = "/api/time-entries";
            const params = new URLSearchParams();

            // View Mode Logic:
            // If Super Admin viewing "Admin" mode -> See ALL entries (for approval/review)
            // If Super Admin viewing "Advisor/Support" -> See THEIR OWN entries (simulating user)
            // If Regular User -> See THEIR OWN entries

            if (user.isSuperAdmin && viewMode === "admin") {
                params.append("admin", "true");
            } else {
                params.append("email", user.email);
            }

            const res = await fetch(`${url}?${params.toString()}`);
            const data = await res.json();
            setEntries(data); // Store all fetched entries for the list

            // Filter for Grid Population (Current Day Only, My Entries Only)
            // We only populate grid with user's own entries for the selected date
            const myEntries = data.filter((e: any) => e.user_email === user.email);
            const dayEntries = myEntries.filter((e: any) => {
                const entryDate = new Date(e.timestamp).toISOString().split('T')[0];
                return entryDate === selectedDate;
            });

            // Populate grid
            const newGrid: typeof gridState = {};
            currentCodes.forEach(code => {
                const entry = dayEntries.find((e: any) => e.charge_code === code);
                if (entry) {
                    newGrid[code] = {
                        hours: Math.floor(entry.duration / 60),
                        minutes: entry.duration % 60,
                        id: entry.id,
                        notes: entry.notes || ""
                    };
                } else {
                    newGrid[code] = { hours: 0, minutes: 0, notes: "" };
                }
            });
            setGridState(newGrid);

        } catch (error) {
            console.error("Failed to load entries", error);
        } finally {
            setIsLoading(false);
        }
    }, [user, selectedDate, currentCodes, viewMode]);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    // Handle Input Change (Grid)
    const handleInputChange = (code: string, field: "hours" | "minutes", value: string) => {
        const num = Math.max(0, parseInt(value) || 0);
        setGridState(prev => ({
            ...prev,
            [code]: { ...prev[code], [field]: num }
        }));
    };

    const handleNotesChange = (code: string, value: string) => {
        setGridState(prev => ({
            ...prev,
            [code]: { ...prev[code], notes: value }
        }));
    };

    // Save All (Grid)
    const handleSave = async () => {
        setIsSaving(true);
        try {
            for (const code of currentCodes) {
                const state = gridState[code];
                if (!state) continue;

                const totalMinutes = (state.hours * 60) + state.minutes;
                const category = viewMode;
                const entryDate = new Date(selectedDate);
                const now = new Date();
                entryDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

                if (state.id) {
                    // Updating from Grid -> Delete & Recreate (Legacy logic for Grid)
                    // Wait, if we use Grid to update, does it trigger approval?
                    // "Daily Log" usually implies "I'm entering my day".
                    // If I change it 5 mins later, is that an "edit"?
                    // Let's assume Grid Save = "New/Correction" that is Auto-Approved for now (since it's 'today'),
                    // unless we want strict strict.
                    // Let's keep Grid Save as 'approved' (standard flow).
                    // Only "Edit List" triggers pending.

                    if (totalMinutes === 0) {
                        await fetch(`/api/time-entries?id=${state.id}`, { method: "DELETE" });
                    } else {
                        // We can iterate the Grid Save to be smart:
                        // If ID exists, use PUT? No, Grid is bulk. simpler to Delete/Insert or just Insert.
                        // Let's stick to current logic: Delete then Create New (Approved).
                        await fetch(`/api/time-entries?id=${state.id}`, { method: "DELETE" });

                        await fetch("/api/time-entries", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                id: crypto.randomUUID(),
                                chargeCode: code,
                                category,
                                duration: totalMinutes,
                                notes: state.notes,
                                timestamp: entryDate.toISOString(),
                                userEmail: user?.email,
                                status: 'approved' // Grid logs are approved
                            }),
                        });
                    }
                } else if (totalMinutes > 0) {
                    // Create New
                    await fetch("/api/time-entries", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: crypto.randomUUID(),
                            chargeCode: code,
                            category,
                            duration: totalMinutes,
                            notes: state.notes,
                            timestamp: entryDate.toISOString(),
                            userEmail: user?.email,
                            status: 'approved'
                        }),
                    });
                }
            }
            await fetchEntries();
            showToast("Time saved successfully!", "success");
        } catch (error) {
            console.error("Failed to save", error);
            showToast("Failed to save. Please try again.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    // Edit Log Entry
    const handleEditSave = async (id: string, updates: Partial<TimeEntry>) => {
        try {
            await fetch("/api/time-entries", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    ...updates,
                    status: user?.isSuperAdmin ? 'approved' : 'pending' // Admins auto-approve, others pending
                }),
            });
            await fetchEntries();
            showToast("Entry updated successfully!", "success");
        } catch (error) {
            console.error("Failed to edit", error);
            showToast("Failed to update entry", "error");
        }
    };

    // Approve Entry
    const handleApprove = async (id: string) => {
        try {
            await fetch("/api/time-entries", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    status: 'approved'
                }),
            });
            await fetchEntries();
            showToast("Entry approved!", "success");
        } catch (error) {
            console.error("Failed to approve", error);
            showToast("Failed to approve", "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        await fetch(`/api/time-entries?id=${id}`, { method: "DELETE" });
        await fetchEntries();
    };

    // Render Logic
    const dailyTotalMinutes = Object.values(gridState).reduce((acc, curr) => acc + (curr?.hours || 0) * 60 + (curr?.minutes || 0), 0);
    const dailyTotalHours = (dailyTotalMinutes / 60).toFixed(1);

    const changeDate = (days: number) => {
        const date = new Date(selectedDate);
        date.setDate(date.getDate() + days);
        setSelectedDate(date.toISOString().split('T')[0]);
    };

    // Sort entries for List: Pending first, then recent
    const sortedEntries = [...entries].sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 sticky top-20 z-30 bg-background dark:bg-background py-4 border-b border-border-light dark:border-border-dark">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Time Tracker</h1>
                    <p className="text-gray-500 text-sm">
                        Logging as <span className="font-bold uppercase text-primary">{viewMode}</span>
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-surface-light dark:bg-surface-dark p-2 rounded-xl shadow-sm border border-border-light dark:border-border-dark">
                    {user?.isSuperAdmin ? (
                        <>
                            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500 transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <div className="flex items-center gap-2 px-2">
                                <Calendar size={18} className="text-primary" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-transparent font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
                                />
                            </div>
                            <button onClick={() => changeDate(1)} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-500 transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center gap-2 px-4 py-2 opacity-80 select-none">
                            <Calendar size={18} className="text-primary" />
                            <span className="font-bold text-gray-900 dark:text-white">
                                {selectedDate && new Date(selectedDate + "T12:00:00").toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-xs uppercase font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">Today ({user?.timezone?.split('/')[1]?.replace('_', ' ') || 'EST'})</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <div className="text-xs uppercase font-bold text-gray-500">Daily Total</div>
                        <div className="text-2xl font-bold font-mono text-gray-900 dark:text-white">
                            {dailyTotalHours} <span className="text-sm font-sans font-normal text-gray-500">hrs</span>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="bg-primary hover:bg-primary-hover text-black font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                        {isSaving ? "Saving..." : "Save Daily Log"}
                    </button>
                </div>
            </div>

            {/* Grid / Table Layout */}
            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm overflow-hidden mb-8">
                {/* Table Header (Hidden on mobile) */}
                <div className="hidden sm:grid grid-cols-12 gap-4 p-4 border-b border-border-light dark:border-border-dark bg-gray-50/50 dark:bg-zinc-800/30 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4">Charge Code</div>
                    <div className="col-span-5">Notes (Optional)</div>
                    <div className="col-span-3 text-right pr-2">Duration</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-border-light dark:divide-border-dark">
                    {currentCodes.map((code) => (
                        <div key={code} className="grid grid-cols-1 sm:grid-cols-12 gap-y-3 sm:gap-4 p-4 items-center hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                            {/* Code Column */}
                            <div className="col-span-1 sm:col-span-4">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{code}</h3>
                            </div>

                            {/* Notes Column */}
                            <div className="col-span-1 sm:col-span-5">
                                <input
                                    type="text"
                                    placeholder="Add notes..."
                                    value={gridState[code]?.notes || ""}
                                    onChange={(e) => handleNotesChange(code, e.target.value)}
                                    className="w-full bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-zinc-600 border-b border-transparent focus:border-primary outline-none transition-colors py-1.5"
                                />
                            </div>

                            {/* Time Column (Compact Inputs) */}
                            <div className="col-span-1 sm:col-span-3 flex items-center justify-start sm:justify-end">
                                <div className="flex items-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all shadow-sm group-hover:border-gray-300 dark:group-hover:border-zinc-600">
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0"
                                        value={gridState[code]?.hours || ""}
                                        onChange={(e) => handleInputChange(code, "hours", e.target.value)}
                                        className="w-12 h-9 text-center text-base font-bold bg-transparent outline-none text-gray-900 dark:text-white"
                                    />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase mr-1">hr</span>

                                    <div className="w-px h-5 bg-gray-200 dark:bg-zinc-700 mx-1"></div>

                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        placeholder="0"
                                        value={gridState[code]?.minutes || ""}
                                        onChange={(e) => handleInputChange(code, "minutes", e.target.value)}
                                        className="w-12 h-9 text-center text-base font-bold bg-transparent outline-none text-gray-900 dark:text-white"
                                    />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase pr-3 mr-1">m</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* List / Log */}
            <div className="pt-8 border-t border-border-light dark:border-border-dark">
                <button
                    onClick={() => setIsLogExpanded(!isLogExpanded)}
                    className="flex items-center justify-between w-full group mb-6"
                >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 group-hover:text-primary transition-colors">
                        <FileText size={24} className="text-primary" />
                        Entry Log
                    </h3>
                    <div className="text-gray-500 group-hover:text-primary transition-colors text-sm font-medium">
                        {isLogExpanded ? "Collapse" : "Expand"}
                    </div>
                </button>

                {isLogExpanded && (
                    <>
                        {sortedEntries.length === 0 ? (
                            <div className="text-center py-10 opacity-50 bg-gray-50 dark:bg-zinc-800/50 rounded-xl">
                                <p className="text-gray-500">No entries found.</p>
                            </div>
                        ) : (
                            <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm overflow-hidden overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 dark:bg-zinc-800/30 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-border-light dark:border-border-dark">
                                            <th className="p-4 w-12 text-center">#</th>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">User</th>
                                            <th className="p-4">Category</th>
                                            <th className="p-4">Charge Code</th>
                                            <th className="p-4">Notes</th>
                                            <th className="p-4 text-right">Duration</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-light dark:divide-border-dark">
                                        {sortedEntries.map((entry, index) => (
                                            <tr key={entry.id} className={cn("hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors group relative", entry.status === 'pending' && "bg-yellow-50/30 dark:bg-yellow-900/10")}>
                                                <td className="p-4 text-center text-gray-400 font-bold text-sm">
                                                    {index + 1}
                                                </td>
                                                <td className="p-4 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    {new Date(entry.timestamp).toLocaleDateString()}
                                                </td>
                                                <td className="p-4">
                                                    {entry.user_email ? (
                                                        <span className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs flex items-center gap-1 w-max">
                                                            <User size={12} /> {entry.user_email.split('@')[0]}
                                                        </span>
                                                    ) : <span className="text-gray-400">-</span>}
                                                </td>
                                                <td className="p-4 text-xs font-bold text-gray-500 uppercase">
                                                    {entry.category}
                                                </td>
                                                <td className="p-4 text-sm font-bold text-gray-900 dark:text-white">
                                                    {entry.charge_code}
                                                </td>
                                                <td className="p-4 text-sm text-gray-500 italic max-w-[200px] truncate">
                                                    {entry.notes || <span className="opacity-50">-</span>}
                                                </td>
                                                <td className="p-4 text-right font-mono font-bold whitespace-nowrap text-gray-900 dark:text-white">
                                                    {Math.floor(entry.duration / 60)}<span className="text-xs text-gray-400 mx-1">h</span>
                                                    {entry.duration % 60}<span className="text-xs text-gray-400">m</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {entry.status === 'pending' && (
                                                            <span className="bg-yellow-100 text-yellow-800 text-[10px] uppercase font-bold px-2 py-1 rounded mr-2 flex items-center gap-1 w-max">
                                                                <AlertCircle size={10} /> Pending
                                                            </span>
                                                        )}
                                                        {/* Admin Approval Button */}
                                                        {user?.isSuperAdmin && entry.status === 'pending' && (
                                                            <button onClick={() => handleApprove(entry.id)} className="p-2 bg-green-500/10 text-green-600 hover:bg-green-500/20 rounded-lg transition-colors" title="Approve">
                                                                <CheckCircle size={16} />
                                                            </button>
                                                        )}
                                                        {/* Edit Button */}
                                                        <button onClick={() => setEditingEntry(entry)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Edit">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        {/* Delete Button */}
                                                        <button onClick={() => handleDelete(entry.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>

            <EditModal
                isOpen={!!editingEntry}
                onClose={() => setEditingEntry(null)}
                entry={editingEntry}
                onSave={handleEditSave}
            />

            {/* Toast Notification */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md",
                        toast.type === "success"
                            ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
                            : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
                    )}>
                        {toast.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span className="font-bold text-sm tracking-wide">{toast.message}</span>
                        <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70 transition-opacity">
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
