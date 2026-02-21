"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

/* ───────────────────────────────────────────────
   FLOATING MONEY SYMBOLS — pure CSS animation
   ─────────────────────────────────────────────── */
function FloatingMoney() {
  const symbols = ["$", "¥", "€", "£", "$", "$", "$", "₿", "$", "$", "¢", "$", "$", "$", "$"];
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {symbols.map((s, i) => {
        const left = `${5 + (i * 6.3) % 90}%`;
        const size = 14 + (i % 5) * 8;
        const dur = 12 + (i % 7) * 4;
        const delay = (i * 1.7) % 10;
        const startY = 80 + (i % 4) * 20;
        return (
          <span
            key={i}
            className="absolute text-yellow-500/[0.07] font-black select-none"
            style={{
              left,
              fontSize: `${size}px`,
              bottom: `-${size}px`,
              animation: `floatUp ${dur}s ${delay}s linear infinite`,
              "--start-y": `${startY}vh`,
            } as React.CSSProperties}
          >
            {s}
          </span>
        );
      })}
    </div>
  );
}

/* ───────────────────────────────────────────────
   PARALLAX SECTION WRAPPER
   ─────────────────────────────────────────────── */
function ParallaxSection({
  children,
  className = "",
  speed = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const offset = rect.top * speed * -1;
      el.style.transform = `translateY(${offset}px)`;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}

/* ───────────────────────────────────────────────
   GLASS CARD COMPONENT
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
        bg-white/[0.03] backdrop-blur-xl border border-white/[0.06]
        rounded-2xl shadow-xl shadow-black/20
        ${hover ? "hover:bg-white/[0.06] hover:border-yellow-500/10 hover:shadow-yellow-500/5 transition-all duration-500" : ""}
        ${className}
      `}
    >
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

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  return (
    <div className="min-h-screen bg-[#060606] text-white selection:bg-yellow-500/30 overflow-x-hidden">

      {/* ── Keyframe animations ── */}
      <style jsx global>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(calc(var(--start-y, 80vh) * -1.3)) rotate(25deg);
            opacity: 0;
          }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.03; transform: scale(1); }
          50% { opacity: 0.07; transform: scale(1.05); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>

      {/* ═══════════════════════════════════════════
          ISLAND NAV — Frosted Glass Floating Header
      ═══════════════════════════════════════════ */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
        <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-2xl px-6 py-3 flex items-center justify-between shadow-2xl shadow-black/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center font-black text-black text-xs shadow-lg shadow-yellow-500/20">
              BD
            </div>
            <span className="font-bold text-white text-[15px] tracking-tight">budgetdog</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.open("/login", "_blank")}
              className="text-sm text-zinc-400 hover:text-white transition-colors font-medium hidden sm:block"
            >
              Sign In
            </button>
            <button
              onClick={() => window.open("/login", "_blank")}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm px-5 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-yellow-500/15"
            >
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════
          HERO — with floating money + parallax glow
      ═══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-24 pb-20">
        {/* Animated gradient orbs */}
        <div
          className="absolute top-10 left-1/4 w-[700px] h-[500px] bg-yellow-500/[0.04] rounded-full blur-[180px] pointer-events-none"
          style={{ animation: "pulseGlow 8s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-20 right-1/4 w-[500px] h-[400px] bg-yellow-600/[0.03] rounded-full blur-[150px] pointer-events-none"
          style={{ animation: "pulseGlow 10s ease-in-out infinite 3s" }}
        />

        {/* Floating money symbols */}
        <FloatingMoney />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 w-full">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 border border-yellow-500/20 bg-yellow-500/[0.06] backdrop-blur-sm rounded-full px-5 py-2 mb-8">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse" />
            <span className="text-xs font-bold text-yellow-500 uppercase tracking-[0.15em]">Internal Team Tool</span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-100 text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[1.05] tracking-tight max-w-5xl mb-6">
            The operations hub for{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #eab308, #facc15, #fde047, #facc15, #eab308)",
                backgroundSize: "200% auto",
                animation: "shimmer 4s linear infinite",
              }}
            >
              Budgetdog Tax Team.
            </span>
          </h1>

          <p className="animate-fade-in-up delay-200 text-lg sm:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
            Track time, plan capacity, and manage workflows across both Tax Planning and Tax Preparation divisions — all from a single unified dashboard.
          </p>

          <div className="animate-fade-in-up delay-300 flex flex-wrap items-center gap-4 mb-16">
            <button
              onClick={() => window.open("/login", "_blank")}
              className="group bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl text-base transition-all duration-200 flex items-center gap-2.5 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:scale-[1.03] active:scale-[0.98]"
            >
              Launch App
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
            <span className="text-sm text-zinc-600 font-medium">@budgetdog.com access only</span>
          </div>

          {/* ── Product Preview (Glass Island) ── */}
          <ParallaxSection speed={0.05} className="animate-fade-in-up delay-400">
            <GlassCard className="p-2" hover={false}>
              <div className="rounded-xl bg-black/40 backdrop-blur-sm border border-white/[0.04] overflow-hidden">
                {/* Mock browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.04] bg-black/30">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-white/[0.04] backdrop-blur-sm rounded-lg px-4 py-1 text-xs text-zinc-500 font-mono border border-white/[0.04]">
                      budgetdog-command-center.netlify.app/dashboard
                    </div>
                  </div>
                </div>
                {/* Mock dashboard */}
                <div className="p-6 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-zinc-500 mb-1">Dashboard</div>
                      <div className="text-xl font-bold">Time Tracker</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs font-bold text-yellow-500 backdrop-blur-sm">Planning</div>
                      <div className="px-3 py-1.5 bg-white/[0.04] border border-white/5 rounded-lg text-xs font-medium text-zinc-400 backdrop-blur-sm">Preparation</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Hours Today", value: "6.5h", color: "text-yellow-500" },
                      { label: "This Week", value: "32h", color: "text-blue-400" },
                      { label: "Utilization", value: "87%", color: "text-green-400" },
                      { label: "Team Members", value: "12", color: "text-purple-400" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.04] rounded-xl p-4">
                        <div className="text-xs text-zinc-500 mb-1 font-medium">{stat.label}</div>
                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-white/[0.02] border border-white/[0.03] rounded-xl p-5 h-24">
                        <div className="w-20 h-2.5 bg-white/[0.04] rounded mb-3" />
                        <div className="w-28 h-2.5 bg-white/[0.03] rounded mb-3" />
                        <div className="w-14 h-2.5 bg-white/[0.02] rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </ParallaxSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          KEY NUMBERS — Glass islands
      ═══════════════════════════════════════════ */}
      <section className="py-14 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {[
              { n: "8", label: "Role Types" },
              { n: "2", label: "Divisions" },
              { n: "30+", label: "Charge Codes" },
              { n: "160h", label: "Max Capacity / mo" },
            ].map((stat, i) => (
              <GlassCard key={i} className="px-8 py-5 text-center">
                <div className="text-3xl font-black text-yellow-500">{stat.n}</div>
                <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mt-1">{stat.label}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          ONE PLATFORM, BOTH DIVISIONS
      ═══════════════════════════════════════════ */}
      <section className="py-28 relative">
        <ParallaxSection speed={0.08}>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/[0.03] rounded-full blur-[200px] pointer-events-none"
            style={{ animation: "pulseGlow 12s ease-in-out infinite 2s" }}
          />
        </ParallaxSection>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-14 h-14 bg-yellow-500/10 backdrop-blur-xl border border-yellow-500/20 rounded-2xl flex items-center justify-center font-black text-yellow-500 text-lg mx-auto mb-8 shadow-lg shadow-yellow-500/10">
              BD
            </div>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black leading-[1.1] tracking-tight mb-5">
              One platform.
              <br />
              <span className="text-yellow-500">Both divisions.</span>
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Stop juggling spreadsheets and separate tools. The Command Center brings everything the team needs into one place.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          DESIGNED FOR TAX PLANNING — Glass Cards
      ═══════════════════════════════════════════ */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs font-bold text-yellow-500 uppercase tracking-[0.15em] mb-4">Division One</p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-black leading-[1.1] tracking-tight mb-6">
                Designed for
                <br />
                Tax Planning
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed mb-8 max-w-md">
                Financial advisors and support staff managing client relationships from kickoff calls through deep dives and ongoing tax projections.
              </p>

              <div className="space-y-4">
                {[
                  {
                    role: "Advisor",
                    codes: ["Kickoff Call", "Tax Projection", "Follow-up Call", "Deep Dive", "Quarterly Review"],
                  },
                  {
                    role: "Support Staff",
                    codes: ["Data Entry", "Tax Notice", "Compliance", "Client Communication", "Admin"],
                  },
                ].map((r, i) => (
                  <GlassCard key={i} className="p-6">
                    <div className="font-bold text-base mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full shadow-sm shadow-blue-400/50" />
                      {r.role}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {r.codes.map((c, j) => (
                        <span key={j} className="text-xs font-medium bg-white/[0.04] backdrop-blur-sm border border-white/[0.06] text-zinc-400 px-3 py-1.5 rounded-lg">
                          {c}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* At-a-glance glass card */}
            <ParallaxSection speed={0.06} className="lg:mt-20">
              <GlassCard className="p-8">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-6">At a Glance</p>
                <div className="space-y-4 text-base text-zinc-400">
                  <div className="flex justify-between py-3 border-b border-white/[0.04]">
                    <span>Team roles</span>
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/[0.04]">
                    <span>Unique charge codes</span>
                    <span className="text-white font-bold">10+</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/[0.04]">
                    <span>Max capacity per person</span>
                    <span className="text-white font-bold">160h/mo</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span>Target utilization</span>
                    <span className="text-white font-bold">85%</span>
                  </div>
                </div>
              </GlassCard>
            </ParallaxSection>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          BUILT FOR TAX PREPARATION — Glass Cards
      ═══════════════════════════════════════════ */}
      <section className="py-20 relative">
        <div
          className="absolute -right-40 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/[0.02] rounded-full blur-[180px] pointer-events-none"
          style={{ animation: "pulseGlow 10s ease-in-out infinite 4s" }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* At-a-glance glass card */}
            <ParallaxSection speed={0.06} className="order-2 lg:order-1 lg:mt-20">
              <GlassCard className="p-8">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-6">At a Glance</p>
                <div className="space-y-4 text-base text-zinc-400">
                  <div className="flex justify-between py-3 border-b border-white/[0.04]">
                    <span>Team roles</span>
                    <span className="text-white font-bold">6</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/[0.04]">
                    <span>Unique charge codes</span>
                    <span className="text-white font-bold">20+</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-white/[0.04]">
                    <span>Full lifecycle workflow</span>
                    <span className="text-white font-bold">Yes</span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span>Covers prep through e-filing</span>
                    <span className="text-white font-bold">End-to-end</span>
                  </div>
                </div>
              </GlassCard>
            </ParallaxSection>

            <div className="order-1 lg:order-2">
              <p className="text-xs font-bold text-yellow-500 uppercase tracking-[0.15em] mb-4">Division Two</p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-black leading-[1.1] tracking-tight mb-6">
                Built for
                <br />
                Tax Preparation
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed mb-8 max-w-md">
                The full return lifecycle — from organizer review and workbook prep through final review, e-signature, and e-filing. Six specialized roles, each with their own charge codes.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { role: "Tax Planning Admin", desc: "Client onboarding & follow-ups", color: "bg-amber-400" },
                  { role: "Tax Prep Admin", desc: "Organizers, workbooks, e-filing", color: "bg-orange-400" },
                  { role: "Preparer L1", desc: "1040 & business return prep", color: "bg-yellow-500" },
                  { role: "Preparer L2", desc: "Workbook & return review", color: "bg-yellow-400" },
                  { role: "Tax Return Reviewer", desc: "Final review before filing", color: "bg-lime-400" },
                  { role: "Project Manager", desc: "Assignments & team coordination", color: "bg-green-400" },
                ].map((r, i) => (
                  <GlassCard key={i} className="p-5">
                    <div className="font-bold text-sm mb-1.5 flex items-center gap-2">
                      <div className={`w-2 h-2 ${r.color} rounded-full shadow-sm`} style={{ boxShadow: `0 0 6px currentColor` }} />
                      {r.role}
                    </div>
                    <div className="text-sm text-zinc-500">{r.desc}</div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MADE FOR THE TEAM — Feature Glass Islands
      ═══════════════════════════════════════════ */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-xs font-bold text-yellow-500 uppercase tracking-[0.15em] mb-4">Platform</p>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-black leading-[1.1] tracking-tight mb-14">
            Made for
            <br />
            the team
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Time Tracking",
                desc: "Log hours by charge code. Each role gets its own specific codes — advisors see planning codes, preparers see prep codes. Daily and weekly views with logs.",
                accent: "bg-yellow-500",
              },
              {
                title: "Capacity Planner",
                desc: "Model staffing vs. workload. Adjust team size, growth rate, and utilization targets to project capacity and plan ahead.",
                accent: "bg-blue-400",
              },
              {
                title: "Actuals Dashboard",
                desc: "View real logged hours vs. projected capacity. Compare advisor and support utilization against monthly and quarterly targets.",
                accent: "bg-green-400",
              },
              {
                title: "Division Toggle",
                desc: "Super Admins switch between Tax Planning and Tax Preparation instantly. Each division carries its own roles and charge code sets.",
                accent: "bg-purple-400",
              },
              {
                title: "Role-Based Views",
                desc: "8 distinct role types across two divisions. Each team member sees exactly the charge codes and features relevant to their position.",
                accent: "bg-amber-400",
              },
              {
                title: "Access Control",
                desc: "Domain-restricted login via Supabase Auth. Super Admin config, approved email lists. Only @budgetdog.com and whitelisted domains.",
                accent: "bg-red-400",
              },
            ].map((f, i) => (
              <GlassCard key={i} className="p-6 relative overflow-hidden group">
                {/* Accent glow line */}
                <div className={`absolute top-0 left-0 w-full h-0.5 ${f.accent} opacity-40 group-hover:opacity-80 transition-opacity`} />
                <h3 className="font-bold text-white text-base mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          CTA — "Ready to launch?" Glass Island
      ═══════════════════════════════════════════ */}
      <section className="py-28 relative">
        <ParallaxSection speed={0.04}>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-yellow-500/[0.04] rounded-full blur-[200px] pointer-events-none"
            style={{ animation: "pulseGlow 10s ease-in-out infinite" }}
          />
        </ParallaxSection>
        <div className="relative max-w-4xl mx-auto px-6 lg:px-10">
          <GlassCard className="p-12 sm:p-16 text-center" hover={false}>
            <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[1.05] tracking-tight mb-6">
              Ready to
              <br />
              <span className="text-yellow-500">launch?</span>
            </h2>
            <p className="text-base text-zinc-400 mb-10 max-w-md mx-auto">
              Sign in with your BudgetDog credentials to access the dashboard.
            </p>
            <button
              onClick={() => window.open("/login", "_blank")}
              className="group bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl transition-all duration-200 inline-flex items-center gap-3 shadow-xl shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:scale-[1.03] active:scale-[0.98] text-lg"
            >
              Launch App
              <ArrowUpRight size={20} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </GlassCard>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.04] py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="mb-8">
            <div className="text-[clamp(3rem,8vw,6rem)] font-black tracking-tighter text-white leading-none select-none">
              BUDGETDOG
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/[0.03]">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/20 rounded-md flex items-center justify-center font-black text-yellow-500 text-[9px]">
                BD
              </div>
              <span className="text-sm text-zinc-400 font-medium">Tax Command Center</span>
            </div>
            <p className="text-xs text-zinc-500">
              Internal use only &bull; &copy; {new Date().getFullYear()} BudgetDog
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
