"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Users, Mail, Trash2, ShieldAlert, Loader2, UserPlus, CheckCircle2, X, Globe } from "lucide-react";
import { triggerHaptic } from "@/lib/utils";

interface SupabaseUser {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at?: string;
    user_metadata: {
        full_name?: string;
    };
}

export default function UserManagement() {
    const { user } = useAuth();
    const [users, setUsers] = useState<SupabaseUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);
    const [inviteStatus, setInviteStatus] = useState<"idle" | "success" | "error">("idle");
    const [inviteMessage, setInviteMessage] = useState("");
    const [roles, setRoles] = useState<Record<string, string>>({});
    const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);

    const [adminConfig, setAdminConfig] = useState<{ admins: any[], domains: any[] }>({ admins: [], domains: [] });
    const [newAdmin, setNewAdmin] = useState("");
    const [newDomain, setNewDomain] = useState("");

    useEffect(() => {
        fetchUsers();
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const res = await fetch("/api/admin/config");
            const data = await res.json();
            if (data.admins && data.domains) {
                setAdminConfig(data);
            }
        } catch (error) {
            console.error("Failed to fetch admin config", error);
        }
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                fetch("/api/admin/users"),
                fetch("/api/admin/roles")
            ]);
            const usersData = await usersRes.json();
            const rolesData = await rolesRes.json();

            if (rolesData.roles) {
                setRoles(rolesData.roles);
            }

            if (usersData.users) {
                // Ensure the signed-in user is at the top or just sort by creation
                const sortedUsers = usersData.users.sort((a: SupabaseUser, b: SupabaseUser) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );
                setUsers(sortedUsers);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;

        triggerHaptic();
        setIsInviting(true);
        setInviteStatus("idle");

        try {
            const res = await fetch("/api/admin/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to send invite");
            }

            setInviteStatus("success");
            setInviteMessage(`Invitation sent to ${inviteEmail}. Link expires in 24 hours.`);
            setInviteEmail("");
            fetchUsers(); // Refresh list to show invited status if possible
        } catch (error: any) {
            setInviteStatus("error");
            setInviteMessage(error.message);
        } finally {
            setIsInviting(false);
            // Clear message after 5 seconds
            setTimeout(() => {
                setInviteStatus("idle");
                setInviteMessage("");
            }, 5000);
        }
    };

    const handleRoleChange = async (targetEmail: string, newRole: string) => {
        setIsUpdatingRole(targetEmail);
        try {
            const res = await fetch("/api/admin/roles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: targetEmail, role: newRole, updatedBy: user?.email })
            });
            if (!res.ok) throw new Error("Failed to update role");

            // Update local state
            setRoles(prev => ({ ...prev, [targetEmail]: newRole }));
            setInviteStatus("success");
            setInviteMessage(`Role updated to ${newRole} for ${targetEmail}`);
        } catch (error: any) {
            setInviteStatus("error");
            setInviteMessage("Failed to update role");
            console.error(error);
        } finally {
            setIsUpdatingRole(null);
            setTimeout(() => {
                setInviteStatus("idle");
                setInviteMessage("");
            }, 3000);
        }
    };

    const handleAddConfig = async (type: "admin" | "domain", value: string) => {
        if (!value) return;
        try {
            const res = await fetch("/api/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, value, userEmail: user?.email })
            });
            if (!res.ok) throw new Error("Failed to add");

            fetchConfig(); // Re-fetch
            if (type === "admin") setNewAdmin("");
            else setNewDomain("");
        } catch (error) {
            console.error("Failed to add", error);
            alert("Failed to save changes. Please try again.");
        }
    };

    const handleDeleteConfig = async (type: "admin" | "domain", value: string) => {
        if (!confirm(`Are you sure you want to remove ${value}?`)) return;
        try {
            const res = await fetch(`/api/admin/config?type=${type}&value=${value}`, {
                method: "DELETE"
            });
            if (!res.ok) throw new Error("Failed to delete");

            fetchConfig(); // Re-fetch
        } catch (error) {
            console.error("Failed to delete", error);
            alert("Failed to delete. Please try again.");
        }
    };

    const handleRemoveUser = async (userId: string, email: string) => {
        if (email === user?.email) {
            alert("You cannot remove yourself.");
            return;
        }

        if (!confirm(`Are you sure you want to permanently remove ${email}? They will lose all access immediately.`)) {
            return;
        }

        triggerHaptic();
        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete user");
            }

            // Remove from local state
            setUsers(users.filter(u => u.id !== userId));
        } catch (error: any) {
            alert(error.message);
        }
    };

    if (!user?.isSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white/[0.02] border border-white/[0.05] rounded-3xl backdrop-blur-3xl min-h-[500px]">
                <ShieldAlert size={48} className="text-red-500 mb-4 opacity-80" />
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Access Restricted</h2>
                <p className="text-zinc-400">You must be a Super Admin to view the Team Management console.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header section */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl p-6 sm:p-8 backdrop-blur-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

                <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2 mb-2">
                            <Users className="text-yellow-500" size={24} />
                            Team Management
                        </h2>
                        <p className="text-sm text-zinc-400">
                            Onboard new team members or revoke access. Invitations expire after 24 hours.
                        </p>
                    </div>

                    <form onSubmit={handleInvite} className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="name@budgetdog.com"
                                className="w-full sm:w-64 bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm tracking-wide text-white focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-zinc-600"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isInviting || !inviteEmail}
                            className="bg-yellow-500 text-black px-6 py-2.5 rounded-xl text-sm font-bold tracking-tight hover:bg-yellow-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            {isInviting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                            {isInviting ? "Sending..." : "Send Invite"}
                        </button>
                    </form>
                </div>

                {/* Status Messages */}
                {inviteStatus !== "idle" && (
                    <div className={`mt-4 p-3 rounded-xl border flex items-center gap-2 text-sm text-center sm:text-left ${inviteStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                        {inviteStatus === 'success' ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                        {inviteMessage}
                    </div>
                )}
            </div>

            {/* Roster Table */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden backdrop-blur-3xl">
                <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white tracking-tight">Active Roster</h3>
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full border border-white/[0.05]">
                        {users.length} Total Users
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/40">
                                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest w-[30%]">User</th>
                                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest w-[20%]">Role</th>
                                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest hidden sm:table-cell w-[20%]">Joined</th>
                                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest hidden md:table-cell w-[20%]">Last Active</th>
                                <th className="p-4 text-xs font-semibold text-zinc-500 uppercase tracking-widest text-right w-[10%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.05]">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-zinc-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <Loader2 size={24} className="animate-spin text-yellow-500" />
                                            <span>Loading firm roster...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-zinc-500">No users found.</td>
                                </tr>
                            ) : (
                                users.map((u) => {
                                    const isMe = u.email === user?.email;
                                    return (
                                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-4 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-yellow-500 font-bold shrink-0">
                                                    {u.user_metadata?.full_name ? u.user_metadata.full_name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-white font-medium tracking-tight truncate">
                                                        {u.user_metadata?.full_name || "Pending Invite"}
                                                        {isMe && <span className="ml-2 text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full border border-yellow-500/30 uppercase tracking-widest">You</span>}
                                                    </span>
                                                    <span className="text-zinc-500 text-sm truncate">{u.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={roles[u.email] || "advisor"}
                                                    onChange={(e) => handleRoleChange(u.email, e.target.value)}
                                                    disabled={isUpdatingRole === u.email}
                                                    className="bg-black/50 border border-white/10 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 disabled:opacity-50 appearance-none w-full max-w-[150px] cursor-pointer"
                                                >
                                                    <option value="advisor">Advisor</option>
                                                    <option value="support">Support</option>
                                                    <optgroup label="Tax Prep">
                                                        <option value="preparer_l1">Preparer Level 1</option>
                                                        <option value="preparer_l2">Preparer Level 2</option>
                                                        <option value="reviewer">Reviewer</option>
                                                        <option value="project_manager">Project Manager</option>
                                                    </optgroup>
                                                    <optgroup label="Admin Roles">
                                                        <option value="tax_prep_admin">Tax Prep Admin</option>
                                                        <option value="tax_planning_admin">Tax Plan Admin</option>
                                                        <option value="admin">Super Admin</option>
                                                    </optgroup>
                                                </select>
                                            </td>
                                            <td className="p-4 text-sm text-zinc-400 hidden sm:table-cell">
                                                {new Date(u.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-sm text-zinc-400 hidden md:table-cell">
                                                {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "Never"}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleRemoveUser(u.id, u.email)}
                                                    disabled={isMe}
                                                    title={isMe ? "You cannot remove yourself" : "Revoke Access"}
                                                    className={`p-2 rounded-lg transition-colors flex items-center justify-center ml-auto ${isMe
                                                        ? 'text-zinc-700 cursor-not-allowed'
                                                        : 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10'
                                                        }`}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Admin Config Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Super Admins */}
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden backdrop-blur-3xl p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                            <ShieldAlert className="text-yellow-500" size={20} />
                            Super Admins
                        </h3>
                        <p className="text-sm text-zinc-400">Users with full access to this platform.</p>
                    </div>

                    <div className="space-y-2 mb-4">
                        {adminConfig.admins.map((admin: any) => (
                            <div key={admin.email} className="flex justify-between items-center p-3 bg-black/40 border border-white/5 rounded-xl text-sm group">
                                <span className="text-gray-200">{admin.email}</span>
                                {admin.email !== "systo.ai@gmail.com" && (
                                    <button
                                        onClick={() => handleDeleteConfig('admin', admin.email)}
                                        className="text-zinc-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {/* Default Failsafe display */}
                        {!adminConfig.admins.some((a: any) => a.email === "systo.ai@gmail.com") && (
                            <div className="flex justify-between items-center p-3 bg-black/40 border border-yellow-500/20 rounded-xl text-sm group">
                                <span className="text-gray-200">systo.ai@gmail.com</span>
                                <span className="text-[10px] bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Failsafe</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="email"
                            value={newAdmin}
                            onChange={(e) => setNewAdmin(e.target.value)}
                            placeholder="New admin email..."
                            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-zinc-600"
                        />
                        <button
                            onClick={() => handleAddConfig('admin', newAdmin)}
                            disabled={!newAdmin}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* Allowed Domains */}
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden backdrop-blur-3xl p-6">
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                            <Globe className="text-yellow-500" size={20} />
                            Allowed Domains
                        </h3>
                        <p className="text-sm text-zinc-400">Domains authorized to access the system.</p>
                    </div>

                    <div className="space-y-2 mb-4">
                        {adminConfig.domains.map((d: any) => (
                            <div key={d.domain} className="flex justify-between items-center p-3 bg-black/40 border border-white/5 rounded-xl text-sm group">
                                <span className="text-gray-200">{d.domain}</span>
                                <button
                                    onClick={() => handleDeleteConfig('domain', d.domain)}
                                    className="text-zinc-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                        {/* Default Failsafe display */}
                        {!adminConfig.domains.some((d: any) => d.domain === "@budgetdog.com") && (
                            <div className="flex justify-between items-center p-3 bg-black/40 border border-yellow-500/20 rounded-xl text-sm group">
                                <span className="text-gray-200">@budgetdog.com</span>
                                <span className="text-[10px] bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Default</span>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                            placeholder="@example.com"
                            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-zinc-600"
                        />
                        <button
                            onClick={() => handleAddConfig('domain', newDomain)}
                            disabled={!newDomain}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
