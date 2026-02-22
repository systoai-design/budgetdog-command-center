"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

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
          <div className="animate-apple-entrance inline-flex items-center gap-2 border border-white/[0.1] bg-white/[0.03] backdrop-blur-md rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">System Online</span>
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(3.5rem,8vw,8rem)] font-bold leading-[1.05] tracking-tighter mb-8 flex flex-col items-center">
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50 block"
            >
              Pro Tools.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 block"
            >
              Pure Focus.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="text-lg sm:text-2xl text-zinc-400 max-w-2xl mx-auto font-medium tracking-tight mb-12 leading-relaxed"
          >
            One platform to command the entire tax operation. Capacity mapping, frictionless time tracking, and instant role switching.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <MagneticButton
              onClick={() => window.open("/login", "_blank")}
              className="group bg-white hover:bg-zinc-200 text-black font-semibold px-8 py-4 rounded-full text-sm transition-colors duration-300 w-full sm:w-auto shadow-xl hover:shadow-white/20"
            >
              <span>Launch Dashboard</span>
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SHOWCASE 1: TIME TRACKER
      ═══════════════════════════════════════════ */}
      <section className="relative py-32 z-10 px-6 lg:px-10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="flex-1 lg:max-w-xl">
              <FadeInView>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-8 backdrop-blur-md">
                  <span className="text-white text-xl">⌘</span>
                </div>
                <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-500 mb-6">
                  Frictionless logging.
                </h2>
                <p className="text-zinc-400 text-lg md:text-xl leading-relaxed font-medium">
                  Role-aware time entry interfaces. Advisors see kickoff calls and projections; Preparers see organizers and e-filing. Clean, direct, and zero clutter.
                </p>
              </FadeInView>
            </div>
            <div className="flex-1 w-full" style={{ perspective: "1000px" }}>
              <FadeInView delay={0.2}>
                <motion.div whileHover={{ scale: 1.02, rotateY: -5, rotateX: 5 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="p-1 min-h-[400px] bg-gradient-to-b from-white/[0.08] to-transparent rounded-3xl relative" style={{ transformStyle: "preserve-3d" }}>
                  <div className="absolute inset-0 bg-[#000000] rounded-3xl -z-10" />
                  <div className="h-full w-full bg-white/[0.02] backdrop-blur-3xl rounded-[23px] border border-white/[0.05] p-6 shadow-2xl overflow-hidden flex flex-col gap-3">
                    {/* Fake header */}
                    <div className="flex justify-between items-center mb-4 border-b border-white/[0.05] pb-4">
                      <div className="w-32 h-6 bg-white/[0.05] rounded-md" />
                      <div className="w-24 h-8 bg-yellow-500/20 border border-yellow-500/30 rounded-full" />
                    </div>
                    {/* Fake rows */}
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.02]">
                        <div className="flex flex-col gap-2">
                          <div className="w-48 h-4 bg-white/[0.1] rounded" />
                          <div className="w-24 h-3 bg-white/[0.05] rounded" />
                        </div>
                        <div className="flex gap-2">
                          <div className="w-12 h-8 bg-black/40 rounded-lg" />
                          <div className="w-12 h-8 bg-black/40 rounded-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </FadeInView>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SHOWCASE 2: CAPACITY PLANNER
      ═══════════════════════════════════════════ */}
      <section className="relative py-32 z-10 px-6 lg:px-10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24">
            <div className="flex-1 lg:max-w-xl">
              <FadeInView>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-8 backdrop-blur-md">
                  <span className="text-white text-xl">⚡</span>
                </div>
                <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-500 mb-6">
                  Know your limits.<br />Before they break.
                </h2>
                <p className="text-zinc-400 text-lg md:text-xl leading-relaxed font-medium">
                  Model team output limits instantly via real-time slider arrays. Set arbitrary assumptions and view immediate physical limits.
                </p>
              </FadeInView>
            </div>
            <div className="flex-1 w-full" style={{ perspective: "1000px" }}>
              <FadeInView delay={0.2}>
                <motion.div whileHover={{ scale: 1.02, rotateY: 5, rotateX: 5 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="p-1 min-h-[400px] bg-gradient-to-b from-red-500/[0.1] to-transparent rounded-3xl relative" style={{ transformStyle: "preserve-3d" }}>
                  <div className="absolute inset-0 bg-[#000000] rounded-3xl -z-10" />
                  <div className="h-full w-full bg-white/[0.02] backdrop-blur-3xl rounded-[23px] border border-red-500/[0.2] p-6 shadow-2xl flex flex-col gap-6">
                    {/* Red warning banner */}
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                      <div className="w-1.5 h-10 bg-red-500 rounded-full" />
                      <div>
                        <div className="text-red-500 font-bold text-sm">CRITICAL: OVER CAPACITY</div>
                        <div className="text-red-500/70 text-xs mt-1">Firm is over target capacity. The Advisors team is the bottleneck.</div>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      {/* Sliders fake */}
                      <div className="w-1/3 flex flex-col gap-4">
                        {[...Array(4)].map((_, i) => (
                          <div key={i}>
                            <div className="flex justify-between mb-2">
                              <div className="w-20 h-3 bg-white/[0.1] rounded" />
                              <div className="w-8 h-3 bg-yellow-500/50 rounded" />
                            </div>
                            <div className="h-2 w-full bg-white/[0.05] rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500" style={{ width: `${Math.random() * 60 + 20}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Data blocks */}
                      <div className="w-2/3 grid grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 flex flex-col items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white/[0.05] mb-3" />
                            <div className="w-16 h-6 bg-white/[0.1] rounded mb-1" />
                            <div className="w-24 h-3 bg-white/[0.05] rounded" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </FadeInView>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SHOWCASE 3: ACTUALS ANALYSIS
      ═══════════════════════════════════════════ */}
      <section className="relative py-32 z-10 px-6 lg:px-10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="flex-1 lg:max-w-xl">
              <FadeInView>
                <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-8 backdrop-blur-md">
                  <span className="text-white text-xl">◓</span>
                </div>
                <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-500 mb-6">
                  Metrics that matter.
                </h2>
                <p className="text-zinc-400 text-lg md:text-xl leading-relaxed font-medium">
                  Instantly toggle between departments. Automatically pivot charge codes, capacity models, and reporting structures.
                </p>
              </FadeInView>
            </div>
            <div className="flex-1 w-full" style={{ perspective: "1000px" }}>
              <FadeInView delay={0.2}>
                <motion.div whileHover={{ scale: 1.02, rotateY: -5, rotateX: -5 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className="p-1 min-h-[400px] bg-gradient-to-b from-blue-500/[0.1] to-transparent rounded-3xl relative" style={{ transformStyle: "preserve-3d" }}>
                  <div className="absolute inset-0 bg-[#000000] rounded-3xl -z-10" />
                  <div className="h-full w-full bg-white/[0.02] backdrop-blur-3xl rounded-[23px] border border-blue-500/[0.1] p-6 shadow-2xl flex flex-col gap-6">
                    <div className="flex gap-4 mb-2">
                      <div className="px-4 py-2 bg-white/[0.1] rounded-lg w-24 h-8" />
                      <div className="px-4 py-2 bg-white/[0.05] rounded-lg w-24 h-8" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 flex-1">
                      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex flex-col justify-end gap-2 relative overflow-hidden">
                        {/* Fake bar chart */}
                        <div className="absolute top-4 left-4 font-bold text-white/50 text-sm">Weekly Trend</div>
                        <div className="flex items-end justify-around h-32 mt-8 w-full">
                          <div className="w-8 bg-blue-500/80 rounded-t-sm h-[40%]" />
                          <div className="w-8 bg-blue-500/80 rounded-t-sm h-[60%]" />
                          <div className="w-8 bg-yellow-500/80 rounded-t-sm h-[90%]" />
                        </div>
                      </div>
                      <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex items-center justify-center relative">
                        {/* Fake pie chart (CSS conic gradient) */}
                        <div className="absolute top-4 left-4 font-bold text-white/50 text-sm">Role Dist.</div>
                        <div className="w-32 h-32 rounded-full mt-4" style={{ background: "conic-gradient(#eab308 0% 40%, #3b82f6 40% 85%, #a855f7 85% 100%)", maskImage: "radial-gradient(transparent 55%, black 56%)", WebkitMaskImage: "radial-gradient(transparent 55%, black 56%)" }} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </FadeInView>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA & FOOTER — Extreme Minimalism
      ═══════════════════════════════════════════ */}
      < section className="relative py-40 z-10 px-6 lg:px-10 border-t border-white/[0.05]" >
        <div className="max-w-4xl mx-auto text-center">

          <h2 className="animate-apple-entrance text-[clamp(3rem,8vw,7rem)] font-bold tracking-tighter leading-[1.05] mb-12 flex flex-col items-center">
            <div className="mb-4 sm:mb-6 w-48 sm:w-64 lg:w-80">
              <Image src="/logo2.png" alt="Budgetdog" width={400} height={150} className="w-full h-auto object-contain" />
            </div>
            <span className="text-white">Operating System.</span>
          </h2>

          <button
            onClick={() => window.open("/login", "_blank")}
            className="group relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 bg-white/[0.05] border border-white/[0.1] text-white font-medium hover:bg-white hover:text-black transition-all duration-500 backdrop-blur-xl"
          >
            Authenticate via Supabase
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>

        </div>
      </section >

      <footer className="relative z-10 py-8 text-center border-t border-white/[0.02]">
        <p className="text-xs font-semibold tracking-widest text-zinc-600 uppercase">
          Internal Operations Hub &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div >
  );
}
