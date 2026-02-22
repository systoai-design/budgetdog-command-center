"use client";

import { useEffect, useRef } from "react";
import { triggerHaptic } from "@/lib/utils";

export default function HapticScrollTracker() {
    const lastScrollY = useRef(0);
    const lastScrollX = useRef(0);
    const scrollThreshold = 40; // Pixels to scroll before triggering haptic

    useEffect(() => {
        // Universal scroll listener for window and capturing events
        const handleScroll = (e: any) => {
            const target = e.target === document ? document.documentElement : e.target;
            const currentY = target.scrollTop || window.scrollY;
            const currentX = target.scrollLeft || window.scrollX;

            const diffY = Math.abs(currentY - lastScrollY.current);
            const diffX = Math.abs(currentX - lastScrollX.current);

            if (diffY > scrollThreshold || diffX > scrollThreshold) {
                // Light vibration for feedback
                triggerHaptic(10);
                lastScrollY.current = currentY;
                lastScrollX.current = currentX;
            }
        };

        // Listen for scroll events in capture phase to catch everything
        window.addEventListener("scroll", handleScroll, { passive: true, capture: true });

        return () => {
            window.removeEventListener("scroll", handleScroll, { capture: true });
        };
    }, []);

    return null;
}
