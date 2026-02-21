"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import {
  ArrowRight,
  Shield,
  Clock,
  BarChart3,
  Users,
  FileText,
  Calculator,
  ClipboardCheck,
  Layers,
  Zap,
  Target,
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-500 rounded-lg flex items-center justify-center font-black text-black text-sm">
              BD
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight">BudgetDog</span>
              <span className="text-yellow-500 text-xs font-semibold ml-1.5">Tax Command Center</span>
            </div>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm px-5 py-2 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-500/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
              <span className="text-[11px] font-bold text-yellow-400 uppercase tracking-widest">Internal Team Tool</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight mb-6">
              BudgetDog
              <br />
              <span className="text-yellow-500">Command Center</span>
            </h1>

            <p className="text-lg text-zinc-400 max-w-2xl mb-10 leading-relaxed">
              The unified operations hub for the BudgetDog team. Track billable hours, plan staffing capacity, and manage workflows across both the <strong className="text-zinc-200">Tax Planning</strong> and <strong className="text-zinc-200">Tax Preparation</strong> divisions.
            </p>

            <button
              onClick={() => router.push("/login")}
              className="group bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl transition-all duration-200 flex items-center gap-3 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              Launch App
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ── DIVISIONS OVERVIEW ── */}
      <section className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-[11px] font-bold text-yellow-500 uppercase tracking-widest mb-3">Two Divisions, One Platform</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-12">Built for how BudgetDog operates.</h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Tax Planning */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-8 hover:border-yellow-500/20 transition-colors">
              <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center mb-5">
                <Calculator size={20} className="text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Tax Planning Division</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-5">
                Financial advisors and support staff managing client relationships, kickoff calls, deep dives, and tax projections.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <div className="w-1 h-1 bg-blue-400 rounded-full" />
                  <span><strong className="text-zinc-300">Advisor</strong> — Client calls, projections, follow-ups</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <div className="w-1 h-1 bg-blue-400 rounded-full" />
                  <span><strong className="text-zinc-300">Support Staff</strong> — Data entry, compliance, admin</span>
                </div>
              </div>
            </div>

            {/* Tax Preparation */}
            <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-8 hover:border-yellow-500/20 transition-colors">
              <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center mb-5">
                <FileText size={20} className="text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Tax Preparation Division</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-5">
                Full return lifecycle — from organizer review and workbook prep through final review, e-signature, and e-filing.
              </p>
              <div className="space-y-2">
                {[
                  { role: "Tax Planning Admin", desc: "Client onboarding, calls, follow-ups" },
                  { role: "Tax Prep Admin", desc: "Organizers, workbooks, e-filing" },
                  { role: "Preparer L1", desc: "1040 & business return preparation" },
                  { role: "Preparer L2", desc: "Workbook & return review" },
                  { role: "Tax Return Reviewer", desc: "Final review before filing" },
                  { role: "Project Manager", desc: "Assignments, meetings, team 1-1s" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-500">
                    <div className="w-1 h-1 bg-amber-400 rounded-full" />
                    <span><strong className="text-zinc-300">{r.role}</strong> — {r.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PLATFORM CAPABILITIES ── */}
      <section className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-[11px] font-bold text-yellow-500 uppercase tracking-widest mb-3">Platform Capabilities</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-12">Everything the team needs in one place.</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Clock,
                title: "Time Tracking",
                desc: "Log billable hours by charge code. Each role gets its own specific charge codes — advisors see planning codes, preparers see prep codes.",
                accent: "yellow",
              },
              {
                icon: BarChart3,
                title: "Capacity Planner",
                desc: "Model staffing vs. client demand. Adjust clients, staff count, fees, and growth rate to project utilization and financial margins.",
                accent: "blue",
              },
              {
                icon: Target,
                title: "Actuals Dashboard",
                desc: "View real logged hours vs. projected capacity. Compare advisor and support utilization against targets.",
                accent: "green",
              },
              {
                icon: Layers,
                title: "Division Toggle",
                desc: "Super Admins switch between Tax Planning and Tax Preparation instantly. Each division has its own roles and charge code sets.",
                accent: "purple",
              },
              {
                icon: Users,
                title: "8 Role Types",
                desc: "Two Planning roles plus six Preparation roles. Each with unique charge codes, permissions, and workflow visibility.",
                accent: "amber",
              },
              {
                icon: Shield,
                title: "Access Control",
                desc: "Domain-restricted login, Super Admin overrides, configurable admin lists. Only @budgetdog.com and approved domains get in.",
                accent: "red",
              },
            ].map((feature, i) => {
              const colors: Record<string, string> = {
                yellow: "bg-yellow-500/10 border-yellow-500/15 text-yellow-400",
                blue: "bg-blue-500/10 border-blue-500/15 text-blue-400",
                green: "bg-green-500/10 border-green-500/15 text-green-400",
                purple: "bg-purple-500/10 border-purple-500/15 text-purple-400",
                amber: "bg-amber-500/10 border-amber-500/15 text-amber-400",
                red: "bg-red-500/10 border-red-500/15 text-red-400",
              };
              const colorClass = colors[feature.accent] || colors.yellow;

              return (
                <div
                  key={i}
                  className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors"
                >
                  <div className={`w-10 h-10 ${colorClass} border rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon size={18} />
                  </div>
                  <h3 className="font-bold text-white mb-2 text-sm">{feature.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CHARGE CODE REFERENCE ── */}
      <section className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <p className="text-[11px] font-bold text-yellow-500 uppercase tracking-widest mb-3">Quick Reference</p>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Revenue Model</h2>
          <p className="text-sm text-zinc-400 mb-10 max-w-xl">Key financial assumptions built into the Capacity Planner.</p>

          <div className="grid sm:grid-cols-3 gap-5">
            <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 text-center">
              <p className="text-3xl font-black text-yellow-500 mb-1">$350</p>
              <p className="text-xs text-zinc-500 font-medium">Per Client / Month</p>
              <p className="text-[10px] text-zinc-600 mt-1">Tax Planning Division</p>
            </div>
            <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 text-center">
              <p className="text-3xl font-black text-yellow-500 mb-1">$4,000</p>
              <p className="text-xs text-zinc-500 font-medium">Per Client / Year</p>
              <p className="text-[10px] text-zinc-600 mt-1">Tax Preparation Division</p>
            </div>
            <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-6 text-center">
              <p className="text-3xl font-black text-yellow-500 mb-1">160</p>
              <p className="text-xs text-zinc-500 font-medium">Max Hours / Month</p>
              <p className="text-[10px] text-zinc-600 mt-1">Per Staff Member</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-sm text-zinc-500 mb-8">Sign in with your BudgetDog credentials to access the dashboard.</p>
          <button
            onClick={() => router.push("/login")}
            className="group bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl transition-all duration-200 inline-flex items-center gap-3 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            Launch App
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500 rounded-md flex items-center justify-center font-black text-black text-[10px]">
              BD
            </div>
            <span className="text-xs text-zinc-600 font-medium">BudgetDog Tax Command Center</span>
          </div>
          <p className="text-[11px] text-zinc-700">
            Internal use only &bull; &copy; {new Date().getFullYear()} BudgetDog
          </p>
        </div>
      </footer>
    </div>
  );
}
