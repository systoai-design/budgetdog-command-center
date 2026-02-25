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
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [name, setName] = useState(user?.name || "");
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [position, setPosition] = useState(user?.position || "");
    const [timezone, setTimezone] = useState(user?.timezone || "America/New_York");

    const fileInputRef = useRef<HTMLInputElement>(null);

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
                position,
                timezone
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
                        <User className="text-primary" size={20} />
                        Edit Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 custom-scrollbar">
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

                            {/* Timezone */}
                            <div>
                                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 block">
                                    Timezone
                                </label>
                                <div className="relative">
                                    <select
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-200 dark:border-zinc-700 rounded-lg py-2.5 px-4 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="America/New_York">Eastern Time (EST/EDT)</option>
                                        <option value="America/Chicago">Central Time (CST/CDT)</option>
                                        <option value="America/Denver">Mountain Time (MST/MDT)</option>
                                        <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                                        <option value="America/Anchorage">Alaska Time (AKST/AKDT)</option>
                                        <option value="Pacific/Honolulu">Hawaii-Aleutian Time (HST)</option>
                                        <option value="Etc/UTC">Coordinated Universal Time (UTC)</option>
                                    </select>
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
                </div>
            </div>
        </div>
    );
}
