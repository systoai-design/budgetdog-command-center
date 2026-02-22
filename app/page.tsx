"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { CanvasBackground } from "@/components/3d/CanvasBackground";
import { useSceneStore } from "@/store/useSceneStore";

/* ───────────────────────────────────────────────
   GLASS CARD COMPONENT (Ultra-Premium Apple Style)
   ─────────────────────────────────────────────── */
function GlassCard({
  children,
  className = "",
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`
        bg-white/[0.01] backdrop-blur-3xl border border-white/[0.04]
        rounded-[2rem] shadow-2xl shadow-black/40 overflow-hidden
        ${hover ? "hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-700 ease-out" : ""}
        ${className}
      `}
    >
      {/* Subtle top inner highlight for glass depth */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      {children}
    </div>
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
      className="min-h-[200vh] bg-[#000000] text-white selection:bg-white/20 overflow-x-hidden relative"
      onPointerMove={handlePointerMove}
    >
      {/* ── Background 3D Layer ── */}
      <CanvasBackground />

      {/* ── Keyframe animations ── */}
      <style jsx global>{`
        @keyframes fadeInUpFloat {
          0% { opacity: 0; transform: translateY(40px) scale(0.98); filter: blur(10px); }
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
      `}</style>

      {/* ═══════════════════════════════════════════
          ISLAND NAV — Apple Frosted Pill
      ═══════════════════════════════════════════ */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-3xl animate-apple-entrance">
        <div className="bg-[#1c1c1e]/40 backdrop-blur-[40px] border border-white/[0.08] rounded-full px-6 py-3 flex items-center justify-between shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-600 flex items-center justify-center shadow-inner">
              <span className="font-extrabold text-white text-[10px] tracking-tight">BD</span>
            </div>
            <span className="font-semibold text-white/90 text-sm tracking-tight">budgetdog</span>
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
              className="bg-white text-black font-semibold text-xs px-5 py-2 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-white/10"
            >
              Command Center
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
          <h1 className="animate-apple-entrance delay-100 text-[clamp(3.5rem,8vw,8rem)] font-bold leading-[0.9] tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/40">
            Pro Tools.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600">Pure Focus.</span>
          </h1>

          <p className="animate-apple-entrance delay-200 text-lg sm:text-2xl text-zinc-400/80 max-w-2xl mx-auto font-medium tracking-tight mb-12 leading-snug">
            One platform to command the entire tax operation. Capacity mapping, frictionless time tracking, and instant role switching.
          </p>

          <div className="animate-apple-entrance delay-300 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => window.open("/login", "_blank")}
              className="group bg-white hover:bg-zinc-200 text-black font-semibold px-8 py-4 rounded-full text-sm transition-all duration-300 flex items-center justify-center gap-2.5 w-full sm:w-auto shadow-xl hover:shadow-white/20"
            >
              Launch Dashboard
              <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURES GRID — Deep Glassmorphism
      ═══════════════════════════════════════════ */}
      <section className="relative py-32 z-10 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-24 animate-apple-entrance delay-400">
            <h2 className="text-[clamp(2.5rem,5vw,4.5rem)] font-bold tracking-tighter leading-tight bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-500">
              Engineered for precision.
              <br />
              Designed for speed.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">

            {/* Large Feature Card 1 */}
            <GlassCard className="p-10 md:p-14 md:col-span-2 group">
              <div className="max-w-xl relative z-20">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center mb-8 backdrop-blur-md">
                  <span className="text-white">⌘</span>
                </div>
                <h3 className="text-3xl font-bold tracking-tighter mb-4 text-white">Unified Command</h3>
                <p className="text-zinc-400 text-lg leading-relaxed font-medium">
                  Instantly toggle between Tax Planning and Tax Preparation divisions. Automatically pivot charge codes, capacity models, and reporting structures without losing context.
                </p>
              </div>
              {/* Abstract visual decor within card */}
              <div className="absolute right-0 bottom-0 w-[60%] h-[120%] bg-gradient-to-tl from-zinc-800/30 to-transparent blur-[80px] -z-10 group-hover:from-zinc-700/40 transition-all duration-1000" />
            </GlassCard>

            {/* Medium Feature Cards */}
            <GlassCard className="p-10 relative">
              <h3 className="text-2xl font-bold tracking-tighter mb-4 text-white">Frictionless Tracking</h3>
              <p className="text-zinc-400 text-base leading-relaxed font-medium">
                Role-aware time entry interfaces. Advisors see kickoff calls and projections; Preparers see organizers and e-filing. Clean, direct, and zero clutter.
              </p>
            </GlassCard>

            <GlassCard className="p-10 relative">
              <h3 className="text-2xl font-bold tracking-tighter mb-4 text-white">Capacity Simulator</h3>
              <p className="text-zinc-400 text-base leading-relaxed font-medium">
                Model team output limits instantly via local-storage cached slider arrays. Set arbitrary assumptions and view immediate physical limits.
              </p>
            </GlassCard>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA & FOOTER — Extreme Minimalism
      ═══════════════════════════════════════════ */}
      <section className="relative py-40 z-10 px-6 lg:px-10 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto text-center">

          <h2 className="text-[clamp(3rem,8vw,7rem)] font-bold tracking-tighter leading-[0.9] mb-12 text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600">
            Budgetdog.
            <br />
            Operating System.
          </h2>

          <button
            onClick={() => window.open("/login", "_blank")}
            className="group relative inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 bg-white/[0.05] border border-white/[0.1] text-white font-medium hover:bg-white hover:text-black transition-all duration-500 backdrop-blur-xl"
          >
            Authenticate via Supabase
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>

        </div>
      </section>

      <footer className="relative z-10 py-8 text-center border-t border-white/[0.02]">
        <p className="text-xs font-semibold tracking-widest text-zinc-600 uppercase">
          Internal Operations Hub &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
