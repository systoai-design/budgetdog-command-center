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
                ? "bg-primary text-surface-dark shadow-lg shadow-primary/20"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
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
    <div className={cn("flex space-x-1 bg-surface-light dark:bg-surface-dark p-1 rounded-xl border border-border-light dark:border-border-dark", className)}>
        {children}
    </div>
);
