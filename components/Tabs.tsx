"use client";

import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TabProps {
    label: string;
    value: string;
    isActive: boolean;
    onClick: () => void;
    icon?: React.ElementType;
}

export const Tab = ({ label, isActive, onClick, icon: Icon }: TabProps) => (
    <button
        onClick={onClick}
        className={cn(
            "px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2",
            isActive
                ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
        )}
    >
        {Icon && <Icon size={18} />}
        {label}
    </button>
);

interface TabsProps {
    children: React.ReactNode;
    className?: string;
}

export const TabsList = ({ children, className }: TabsProps) => (
    <div className={cn("flex space-x-2 bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800 backdrop-blur-sm", className)}>
        {children}
    </div>
);
