"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Activity, Shield, Users, Database, Zap, HardDrive, Cpu, Cloud, Network } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import Lenis from 'lenis';

import { CanvasBackground } from "@/components/3d/CanvasBackground";
import { useSceneStore } from "@/store/useSceneStore";

/* ───────────────────────────────────────────────
   FADE IN VIEW WRAPPER
   ─────────────────────────────────────────────── */
function FadeInView({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────────────────────────────────
   MAGNETIC BUTTON COMPONENT
   ─────────────────────────────────────────────── */
function MagneticButton({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current!.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    setPosition({ x: middleX * 0.25, y: middleY * 0.25 });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
  };

  const { x, y } = position;

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onClick={onClick}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}
    >
      <motion.div animate={{ x: x * 0.4, y: y * 0.4 }} transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }} className="flex items-center justify-center gap-2.5 w-full h-full">
        {children}
      </motion.div>
    </motion.button>
  );
}


/* ═══════════════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════════════ */
export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { setPointer, setScrollY } = useSceneStore();
  const [randomWidths, setRandomWidths] = useState<number[]>([]);

  // Hydration-safe random widths
  useEffect(() => {
    setRandomWidths([...Array(4)].map(() => Math.random() * 60 + 20));
  }, []);

  // Lenis Smooth Scroll Setup
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 1.2,
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setScrollY]);

  // Track mouse for 3D camera panning (Decoupled via Zustand)
  const handlePointerMove = (e: React.PointerEvent) => {
    // Normalize coordinates to -1 to 1
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    setPointer(x, y);
  };

  return (
    <div
      className="bg-[#000000] text-white selection:bg-white/20 overflow-x-hidden relative"
      onPointerMove={handlePointerMove}
    >
      {/* ── Background 3D Layer ── */}
      <CanvasBackground />

      {/* ── Keyframe animations ── */}
      <style jsx global>{`
        @keyframes fadeInUpFloat {
          0% { opacity: 0; transform: translateY(60px) scale(0.95); filter: blur(20px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
        }
        .animate-apple-entrance {
          animation: fadeInUpFloat 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        
        @keyframes shine {
            0% { left: -100%; top: -100%; }
            20% { left: 100%; top: 100%; }
            100% { left: 100%; top: 100%; }
        }
        
        @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
        }
        .animate-marquee {
            animation: marquee 30s linear infinite;
        }
      `}</style>

      {/* ═══════════════════════════════════════════
          ISLAND NAV — Apple Frosted Pill
      ═══════════════════════════════════════════ */}
      <nav className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-[90%] max-w-5xl animate-apple-entrance">
        <div className="bg-[#1c1c1e]/40 backdrop-blur-[40px] border border-white/[0.08] rounded-full px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-inner overflow-hidden shrink-0">
              <Image src="/logo1.png" alt="Budgetdog Logo" width={32} height={32} className="object-cover w-full h-full" />
            </div>
            <span className="font-semibold text-yellow-500 text-sm tracking-tight">budgetdog</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => window.open("/login", "_blank")}
              className="text-xs text-zinc-400 hover:text-white transition-colors font-medium hidden sm:block"
            >
              Sign In
            </button>
            <button
              onClick={() => window.open("/login", "_blank")}
              className="group relative overflow-hidden bg-white text-black font-semibold text-xs sm:text-sm px-5 sm:px-7 py-2.5 sm:py-3 rounded-full transition-all duration-500 ease-out hover:scale-[1.02] hover:bg-yellow-500 hover:text-black active:scale-[0.98] shadow-lg shadow-white/10 hover:shadow-yellow-500/20"
            >
              <span className="relative z-10 transition-colors">Command Center</span>
              <div className="absolute inset-0 h-full w-[200%] rotate-45 bg-white/40 group-hover:animate-[shine_3s_infinite_cubic-bezier(0.4,0,0.2,1)]" style={{ left: '-100%', top: '-100%' }} />
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          HERO — Massive typography, stark contrast
      ═══════════════════════════════════════════ */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 lg:px-10 z-10 pointer-events-none">

        <div className="max-w-5xl mx-auto w-full text-center relative pointer-events-auto mt-20">
          {/* Minimalist Badge */}
          <div className="animate-apple-entrance inline-flex items-center gap-2 border border-white/[0.1] bg-white/[0.05] backdrop-blur-md rounded-full px-4 py-1.5 mb-8 shadow-lg shadow-white/5 hover:bg-white/[0.1] transition-colors cursor-default">
            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
              </span>
              New: Capacity Planner 2.0
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(3.5rem,8vw,6rem)] font-bold leading-[1.1] tracking-tighter mb-6 flex flex-col items-center max-w-4xl mx-auto">
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="text-white block drop-shadow-2xl"
            >
              Supercharge Your Firm
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 block drop-shadow-[0_0_40px_rgba(234,179,8,0.3)] pb-2"
            >
              Tax Command Center
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto font-medium tracking-tight mb-10 leading-relaxed"
          >
            One platform to command the entire tax operation. Capacity mapping, frictionless time tracking, and instant role switching.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton
              onClick={() => window.open("/login", "_blank")}
              className="group bg-white hover:bg-zinc-200 text-black font-semibold px-8 py-4 rounded-full text-sm transition-all duration-300 w-full sm:w-auto shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2"
            >
              <span>Launch Dashboard</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </MagneticButton>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════
            DASHBOARD SHOWCASE MAC (GLOWING WRAPPER)
        ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          className="relative mt-20 sm:mt-24 w-full max-w-6xl mx-auto perspective-[2000px] pointer-events-auto"
        >
          <div className="relative rounded-xl sm:rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-[0_0_100px_rgba(234,179,8,0.15)] p-2 sm:p-4 overflow-hidden group hover:shadow-[0_0_120px_rgba(234,179,8,0.2)] transition-shadow duration-700">
            {/* Mac OS Window Dots */}
            <div className="flex gap-2 mb-3 sm:mb-4 px-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
            </div>

            {/* Actual App Screenshot */}
            <div className="relative aspect-[16/9] w-full rounded-lg sm:rounded-2xl overflow-hidden border border-white/5 bg-[#0a0a0a]">
              <Image
                src="/dashboard-mockup.png"
                alt="Budgetdog Command Center Dashboard"
                fill
                priority
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
              />

              {/* Embedded Glass Reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none"></div>
            </div>
          </div>
        </motion.div>

        {/* Subtle Bottom Gradient Fade for the hero container */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none"></div>
      </section>

      {/* ═══════════════════════════════════════════
          BENTO GRID O.S. MODULES
      ═══════════════════════════════════════════ */}
      <section className="relative py-24 z-10 px-6 lg:px-10 overflow-hidden border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto flex flex-col items-center">

          <div className="text-center mb-16 animate-apple-entrance flex flex-col items-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-6 drop-shadow-lg">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">Command Center</span>
              <br />Modules.
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Live application interfaces. Secure internal access only.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

            {/* Bento 1: Actuals Analytics */}
            <FadeInView delay={0.1}>
              <div className="group rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-8 hover:bg-white/[0.02] transition-colors h-full flex flex-col overflow-hidden relative">
                <div className="relative z-10 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                    <Activity className="text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white mb-2">Live Reporting</h3>
                  <p className="text-zinc-400 font-medium">Instantly pivot between internal divisions with real-time analytics.</p>
                </div>

                <div className="mt-auto relative w-full pt-[50%] rounded-t-xl border-x border-t border-white/[0.05] bg-white/[0.01] overflow-hidden translate-y-4 group-hover:translate-y-2 transition-transform duration-500">
                  <Image src="/bento-actuals.png" alt="Actuals Analytics" fill className="object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                </div>
              </div>
            </FadeInView>

            {/* Bento 2: Capacity Planner */}
            <FadeInView delay={0.2}>
              <div className="group rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-8 hover:bg-white/[0.02] transition-colors h-full flex flex-col overflow-hidden relative">
                <div className="relative z-10 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                    <Zap className="text-red-500" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white mb-2">Capacity Simulator</h3>
                  <p className="text-zinc-400 font-medium">Internal playground for modeling theoretical hires and constraints.</p>
                </div>

                <div className="mt-auto relative w-full pt-[50%] rounded-t-xl border-x border-t border-white/[0.05] bg-white/[0.01] overflow-hidden translate-y-4 group-hover:translate-y-2 transition-transform duration-500">
                  <Image src="/bento-capacity.png" alt="Capacity Planner Simulator" fill className="object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                </div>
              </div>
            </FadeInView>

            {/* Bento 3: Time Tracking */}
            <FadeInView delay={0.3}>
              <div className="group rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-8 hover:bg-white/[0.02] transition-colors h-full flex flex-col overflow-hidden relative">
                <div className="relative z-10 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6">
                    <HardDrive className="text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white mb-2">Time Tracking</h3>
                  <p className="text-zinc-400 font-medium">Role-aware entry logs strictly mapped by operating division.</p>
                </div>

                <div className="mt-auto relative w-full pt-[50%] rounded-xl border border-white/[0.05] bg-white/[0.01] overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                  <Image src="/bento-time.png" alt="Time Tracking Log" fill className="object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </FadeInView>

            {/* Bento 4: Live Capacity */}
            <FadeInView delay={0.4}>
              <div className="group rounded-3xl border border-white/[0.08] bg-black/40 backdrop-blur-xl p-8 hover:bg-white/[0.02] transition-colors h-full flex flex-col overflow-hidden relative">
                <div className="relative z-10 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                    <Shield className="text-purple-500" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white mb-2">Live Capacity</h3>
                  <p className="text-zinc-400 font-medium">True limit modeling calculated via verified 30-day trailing averages.</p>
                </div>

                <div className="mt-auto relative w-full pt-[50%] rounded-xl border border-white/[0.05] bg-white/[0.01] overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                  <Image src="/bento-live.png" alt="Live Team Capacity" fill className="object-cover object-top opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              </div>
            </FadeInView>

          </div>
        </div>
      </section>

      <footer className="relative z-10 py-12 text-center border-t border-white/[0.05]">
        <div className="flex flex-col items-center justify-center gap-4">
          <Image src="/logo2.png" alt="Budgetdog" width={120} height={40} className="object-contain opacity-50 hover:opacity-100 transition-opacity" />
          <p className="text-xs font-semibold tracking-widest text-zinc-600 uppercase">
            Internal Operations Hub &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div >
  );
}
