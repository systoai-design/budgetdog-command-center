"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { LucideIcon } from "lucide-react";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TabProps {
    label: string;
    value: string;
    isActive: boolean;
    onClick: () => void;
    icon?: LucideIcon;
}

export const Tab = ({ label, isActive, onClick, icon: Icon }: TabProps) => (
    <button
        onClick={onClick}
        className={cn(
            "px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm",
            isActive
                ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                : "text-zinc-400 hover:text-white hover:bg-white/[0.05]"
        )}
    >
        {Icon && <Icon size={16} />}
        {label}
    </button>
);

interface TabsProps {
    children: React.ReactNode;
    className?: string;
}

export const TabsList = ({ children, className }: TabsProps) => (
    <div className={cn("flex space-x-1 bg-white/[0.03] backdrop-blur-md p-1.5 rounded-2xl border border-white/[0.05]", className)}>
        {children}
    </div>
);
