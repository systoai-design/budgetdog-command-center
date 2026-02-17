import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { X, User, Phone, Briefcase, Save, Camera, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { user, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<"profile" | "admin">("profile");
    const [adminConfig, setAdminConfig] = useState<{ admins: any[], domains: any[] }>({ admins: [], domains: [] });
    const [newAdmin, setNewAdmin] = useState("");
    const [newDomain, setNewDomain] = useState("");
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [name, setName] = useState(user?.name || "");
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [position, setPosition] = useState(user?.position || "");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch admin config when tab connects
    React.useEffect(() => {
        if (activeTab === "admin" && user?.isSuperAdmin) {
            fetch("/api/admin/config")
                .then(res => res.json())
                .then(data => {
                    if (data.admins && data.domains) {
                        setAdminConfig(data);
                    }
                });
        }
    }, [activeTab, user?.isSuperAdmin, refreshTrigger]);

    const handleAdd = async (type: "admin" | "domain", value: string) => {
        if (!value) return;
        try {
            await fetch("/api/admin/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, value, userEmail: user?.email })
            });
            setRefreshTrigger(p => p + 1);
            if (type === "admin") setNewAdmin("");
            else setNewDomain("");
        } catch (error) {
            console.error("Failed to add", error);
        }
    };

    const handleDelete = async (type: "admin" | "domain", value: string) => {
        if (!confirm(`Are you sure you want to remove ${value}?`)) return;
        try {
            await fetch(`/api/admin/config?type=${type}&value=${value}`, {
                method: "DELETE"
            });
            setRefreshTrigger(p => p + 1);
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    if (!isOpen || !user) return null;

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!event.target.files || event.target.files.length === 0) {
                return;
            }
            setIsUploading(true);
            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${user.email}/${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
            setAvatarUrl(data.publicUrl);
        } catch (error: any) {
            console.error("Error uploading avatar:", error);
            if (error.message?.includes("bucket not found")) {
                alert("Error: The 'avatars' storage bucket does not exist. Please create a public bucket named 'avatars' in your Supabase project.");
            } else {
                alert("Error uploading image: " + error.message);
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateProfile({
                name,
                avatarUrl,
                phone,
                position
            });
            onClose();
        } catch (error) {
            console.error("Failed to update profile", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50 shrink-0">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <SettingsIcon className="text-primary" size={20} />
                        {user.isSuperAdmin ? "Settings" : "Edit Profile"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tab Switcher for Super Admins */}
                {user.isSuperAdmin && (
                    <div className="flex border-b border-gray-100 dark:border-zinc-800">
                        <button
                            onClick={() => setActiveTab("profile")}
                            className={cn(
                                "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
                                activeTab === "profile"
                                    ? "border-primary text-gray-900 dark:text-white bg-gray-50/50 dark:bg-zinc-800/30"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            )}
                        >
                            My Profile
                        </button>
                        <button
                            onClick={() => setActiveTab("admin")}
                            className={cn(
                                "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
                                activeTab === "admin"
                                    ? "border-primary text-gray-900 dark:text-white bg-gray-50/50 dark:bg-zinc-800/30"
                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            )}
                        >
                            Admin Config
                        </button>
                    </div>
                )}

                <div className="overflow-y-auto p-6 custom-scrollbar">
                    {activeTab === "profile" ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Avatar Preview & Upload */}
                            <div className="flex flex-col items-center mb-6 gap-3">
                                <div
                                    className="relative group cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-3xl font-bold text-gray-400 dark:text-gray-600 relative">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            name.charAt(0).toUpperCase()
                                        )}
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Loader2 className="animate-spin text-white" size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24} />
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs text-primary font-medium hover:underline"
                                >
                                    Change Photo
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 block">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                            placeholder="Your Full Name"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Position */}
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 block">
                                        Position / Title
                                    </label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            value={position}
                                            onChange={(e) => setPosition(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                            placeholder="e.g. Senior Advisor"
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 block">
                                        Phone Number
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isLoading || isUploading}
                                    className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-3 rounded-lg transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Save Profile
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-8">
                            {/* Super Admins Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-zinc-800 pb-2">
                                    Super Admins
                                </h3>
                                <div className="space-y-2">
                                    {adminConfig.admins.map((admin: any) => (
                                        <div key={admin.email} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg text-sm group">
                                            <span className="text-gray-900 dark:text-gray-200">{admin.email}</span>
                                            {admin.email !== "systo.ai@gmail.com" && (
                                                <button
                                                    onClick={() => handleDelete('admin', admin.email)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {/* Default Failsafe display */}
                                    {!adminConfig.admins.some((a: any) => a.email === "systo.ai@gmail.com") && (
                                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg text-sm border border-yellow-200 dark:border-yellow-900/30">
                                            <span className="text-gray-900 dark:text-gray-200">systo.ai@gmail.com</span>
                                            <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-bold">FAILSAFE</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={newAdmin}
                                        onChange={(e) => setNewAdmin(e.target.value)}
                                        placeholder="New admin email..."
                                        className="flex-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    />
                                    <button
                                        onClick={() => handleAdd('admin', newAdmin)}
                                        disabled={!newAdmin}
                                        className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Allowed Domains Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-zinc-800 pb-2">
                                    Allowed Domains
                                </h3>
                                <div className="space-y-2">
                                    {adminConfig.domains.map((d: any) => (
                                        <div key={d.domain} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg text-sm group">
                                            <span className="text-gray-900 dark:text-gray-200">{d.domain}</span>
                                            <button
                                                onClick={() => handleDelete('domain', d.domain)}
                                                className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    {/* Default Failsafe display */}
                                    {!adminConfig.domains.some((d: any) => d.domain === "@budgetdog.com") && (
                                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-lg text-sm border border-yellow-200 dark:border-yellow-900/30">
                                            <span className="text-gray-900 dark:text-gray-200">@budgetdog.com</span>
                                            <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-bold">DEFAULT</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newDomain}
                                        onChange={(e) => setNewDomain(e.target.value)}
                                        placeholder="@example.com"
                                        className="flex-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    />
                                    <button
                                        onClick={() => handleAdd('domain', newDomain)}
                                        disabled={!newDomain}
                                        className="bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SettingsIcon({ className, size }: { className?: string; size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}
