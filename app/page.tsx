"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-yellow-500/30 overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════
          NAV
      ═══════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center font-black text-black text-xs">
              BD
            </div>
            <span className="font-bold text-white text-[15px] tracking-tight">budgetdog</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-zinc-400 hover:text-white transition-colors font-medium hidden sm:block"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push("/login")}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm px-5 py-2 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-16">
        <div className="absolute top-20 left-1/3 w-[600px] h-[400px] bg-yellow-500/[0.04] rounded-full blur-[150px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-yellow-500/20 bg-yellow-500/[0.06] rounded-full px-4 py-1.5 mb-8">
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
            <span className="text-[11px] font-bold text-yellow-500 uppercase tracking-[0.15em]">Command Center</span>
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(2.5rem,7vw,5.5rem)] font-black leading-[1.05] tracking-tight max-w-4xl mb-6">
            The operations hub
            <br />
            your tax team
            <br />
            <span className="text-yellow-500">actually needs.</span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-500 max-w-xl mb-10 leading-relaxed">
            Track time, plan capacity, and manage both divisions — Tax Planning and Tax Preparation — from a single unified dashboard.
          </p>

          <div className="flex flex-wrap items-center gap-4 mb-20">
            <button
              onClick={() => router.push("/login")}
              className="group bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-7 py-3.5 rounded-xl transition-all duration-200 flex items-center gap-2.5 shadow-lg shadow-yellow-500/15 hover:shadow-yellow-500/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              Launch App
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>
            <span className="text-xs text-zinc-600 font-medium">Internal Team Access Only</span>
          </div>

          {/* ── Product Preview ── */}
          <div className="relative rounded-2xl border border-white/[0.06] bg-zinc-900/50 p-2 shadow-2xl shadow-black/40">
            <div className="rounded-xl bg-zinc-900 border border-white/[0.04] overflow-hidden">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.04] bg-zinc-950/50">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-zinc-800 rounded-md px-4 py-1 text-[10px] text-zinc-500 font-mono">
                    budgetdog-command-center.netlify.app/dashboard
                  </div>
                </div>
              </div>
              {/* Mock dashboard content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Dashboard</div>
                    <div className="text-lg font-bold">Time Tracker</div>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs font-bold text-yellow-500">Planning</div>
                    <div className="px-3 py-1.5 bg-zinc-800 border border-white/5 rounded-lg text-xs font-medium text-zinc-400">Preparation</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Hours Today", value: "6.5h", color: "text-yellow-500" },
                    { label: "This Week", value: "32h", color: "text-blue-400" },
                    { label: "Utilization", value: "87%", color: "text-green-400" },
                    { label: "Active Clients", value: "142", color: "text-purple-400" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-zinc-800/50 border border-white/[0.04] rounded-xl p-4">
                      <div className="text-[10px] text-zinc-500 mb-1 font-medium">{stat.label}</div>
                      <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-zinc-800/30 border border-white/[0.03] rounded-xl p-4 h-20">
                      <div className="w-16 h-2 bg-zinc-700/50 rounded mb-2" />
                      <div className="w-24 h-2 bg-zinc-700/30 rounded mb-2" />
                      <div className="w-12 h-2 bg-zinc-700/20 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SOCIAL PROOF BAR
      ═══════════════════════════════════════════════════ */}
      <section className="border-y border-white/[0.04] py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-wrap items-center justify-center gap-x-16 gap-y-4">
          {[
            { n: "8", label: "Role Types" },
            { n: "2", label: "Divisions" },
            { n: "30+", label: "Charge Codes" },
            { n: "160h", label: "Max Capacity/mo" },
            { n: "$4k", label: "Avg Client/yr" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-black text-yellow-500">{stat.n}</div>
              <div className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          "BUDGETDOG IS A BETTER WAY"
      ═══════════════════════════════════════════════════ */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center font-black text-black mx-auto mb-6">
              BD
            </div>
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black leading-[1.1] tracking-tight mb-4">
              One platform.
              <br />
              <span className="text-yellow-500">Both divisions.</span>
            </h2>
            <p className="text-zinc-500 text-base max-w-lg mx-auto leading-relaxed">
              No more juggling spreadsheets and separate tools. The Command Center unifies everything the BudgetDog team needs to operate.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          DESIGNED FOR TAX PLANNING
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-[11px] font-bold text-yellow-500 uppercase tracking-[0.15em] mb-4">Division One</p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-black leading-[1.1] tracking-tight mb-6">
                Designed for
                <br />
                Tax Planning
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed mb-8 max-w-md">
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
                  <div key={i} className="bg-zinc-900/60 border border-white/[0.05] rounded-2xl p-5">
                    <div className="font-bold text-sm mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      {r.role}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.codes.map((c, j) => (
                        <span key={j} className="text-[10px] font-medium bg-zinc-800 border border-white/[0.04] text-zinc-400 px-2.5 py-1 rounded-md">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue card */}
            <div className="lg:mt-20">
              <div className="bg-zinc-900/60 border border-white/[0.05] rounded-2xl p-8">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-6">Revenue Model</p>
                <div className="mb-6">
                  <span className="text-5xl font-black text-yellow-500">$350</span>
                  <span className="text-zinc-500 text-sm font-medium ml-2">/ client / month</span>
                </div>
                <div className="space-y-3 text-sm text-zinc-500">
                  <div className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span>Avg. planning hours per client</span>
                    <span className="text-white font-semibold">2.5h</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span>Max capacity per staff</span>
                    <span className="text-white font-semibold">160h/mo</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Target utilization</span>
                    <span className="text-white font-semibold">85%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          BUILT FOR TAX PREPARATION
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Revenue card — left side this time */}
            <div className="order-2 lg:order-1 lg:mt-20">
              <div className="bg-zinc-900/60 border border-white/[0.05] rounded-2xl p-8">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider mb-6">Revenue Model</p>
                <div className="mb-6">
                  <span className="text-5xl font-black text-yellow-500">$4,000</span>
                  <span className="text-zinc-500 text-sm font-medium ml-2">/ client / year</span>
                </div>
                <div className="space-y-3 text-sm text-zinc-500">
                  <div className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span>Monthly equivalent</span>
                    <span className="text-white font-semibold">$333/mo</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/[0.04]">
                    <span>Avg. prep hours per return</span>
                    <span className="text-white font-semibold">8-12h</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span>Full lifecycle workflow</span>
                    <span className="text-white font-semibold">6 roles</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-[11px] font-bold text-yellow-500 uppercase tracking-[0.15em] mb-4">Division Two</p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-black leading-[1.1] tracking-tight mb-6">
                Built for
                <br />
                Tax Preparation
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed mb-8 max-w-md">
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
                  <div key={i} className="bg-zinc-900/60 border border-white/[0.05] rounded-xl p-4 hover:border-yellow-500/15 transition-colors">
                    <div className="font-bold text-xs mb-1 flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 ${r.color} rounded-full`} />
                      {r.role}
                    </div>
                    <div className="text-[11px] text-zinc-500">{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          MADE FOR YOUR TEAM
      ═══════════════════════════════════════════════════ */}
      <section className="py-20 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-[11px] font-bold text-yellow-500 uppercase tracking-[0.15em] mb-4">Platform</p>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-black leading-[1.1] tracking-tight mb-14">
            Made for
            <br />
            your team
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Time Tracking",
                desc: "Log billable hours by charge code. Each role gets its own specific codes — advisors see planning codes, preparers see prep codes. Daily and weekly views.",
                accent: "border-l-yellow-500",
              },
              {
                title: "Capacity Planner",
                desc: "Model staffing vs. client demand. Adjust clients, headcount, fees, and growth rate to project utilization, revenue, and financial margins.",
                accent: "border-l-blue-400",
              },
              {
                title: "Actuals Dashboard",
                desc: "Real logged hours vs. projected capacity. Compare advisor and support utilization against monthly and quarterly targets.",
                accent: "border-l-green-400",
              },
              {
                title: "Division Toggle",
                desc: "Super Admins switch between Tax Planning and Tax Preparation instantly. Each division carries its own roles, charge codes, and revenue defaults.",
                accent: "border-l-purple-400",
              },
              {
                title: "Role-Based Views",
                desc: "8 distinct role types across two divisions. Each user sees exactly the charge codes, features, and data relevant to their role.",
                accent: "border-l-amber-400",
              },
              {
                title: "Access Control",
                desc: "Domain-restricted login via Supabase. Super Admin config, approved email lists. Only @budgetdog.com and whitelisted domains.",
                accent: "border-l-red-400",
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`bg-zinc-900/40 border border-white/[0.04] border-l-2 ${f.accent} rounded-xl p-6 hover:bg-zinc-900/60 transition-colors`}
              >
                <h3 className="font-bold text-white text-sm mb-2">{f.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA — "Ready to launch?"
      ═══════════════════════════════════════════════════ */}
      <section className="py-28 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[1.05] tracking-tight mb-6">
            Ready to
            <br />
            <span className="text-yellow-500">launch?</span>
          </h2>
          <p className="text-sm text-zinc-500 mb-10 max-w-md mx-auto">
            Sign in with your BudgetDog credentials to access the dashboard. All team members use a single login.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="group bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl transition-all duration-200 inline-flex items-center gap-3 shadow-lg shadow-yellow-500/15 hover:shadow-yellow-500/25 hover:scale-[1.02] active:scale-[0.98] text-base"
          >
            Launch App
            <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.04] py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Large brand */}
          <div className="mb-8">
            <div className="text-[clamp(3rem,8vw,6rem)] font-black tracking-tighter text-zinc-800 leading-none select-none">
              BUDGETDOG
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/[0.03]">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-yellow-500 rounded-md flex items-center justify-center font-black text-black text-[9px]">
                BD
              </div>
              <span className="text-xs text-zinc-600 font-medium">Tax Command Center</span>
            </div>
            <p className="text-[11px] text-zinc-700">
              Internal use only &bull; &copy; {new Date().getFullYear()} BudgetDog
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
