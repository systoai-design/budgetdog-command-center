"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { ArrowRight, Shield, Clock, BarChart3, Users } from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  // If already logged in, go straight to dashboard
  useEffect(() => {
    if (user) router.push("/dashboard");
  }, [user, router]);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-950 to-black text-white overflow-hidden">

      {/* Subtle animated grid background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center font-black text-black text-lg shadow-lg shadow-yellow-500/20">
            B
          </div>
          <span className="text-xl font-bold tracking-tight">BudgetDog</span>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="text-sm text-zinc-400 hover:text-white transition-colors font-medium"
        >
          Sign In
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-1.5 mb-8">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wider">Tax Command Center</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            Run your tax
            <br />
            practice like a
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-400">
              machine.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-xl mb-10 leading-relaxed">
            Track time, plan capacity, and manage both Tax Planning &amp; Tax Preparation — all in one unified command center.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push("/login")}
              className="group bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-black font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              Launch App
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Floating accent orbs */}
        <div className="absolute top-32 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-32 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Feature Cards */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Clock,
              title: "Time Tracking",
              desc: "Log hours by charge code with role-specific workflows.",
              color: "from-blue-500/20 to-blue-600/5",
              border: "border-blue-500/10",
              iconColor: "text-blue-400",
            },
            {
              icon: BarChart3,
              title: "Capacity Planning",
              desc: "Model staffing, revenue, and growth projections.",
              color: "from-green-500/20 to-green-600/5",
              border: "border-green-500/10",
              iconColor: "text-green-400",
            },
            {
              icon: Users,
              title: "8 Role Types",
              desc: "Advisors, preparers, reviewers, and project managers.",
              color: "from-purple-500/20 to-purple-600/5",
              border: "border-purple-500/10",
              iconColor: "text-purple-400",
            },
            {
              icon: Shield,
              title: "Secure Access",
              desc: "Domain-restricted login with role-based permissions.",
              color: "from-yellow-500/20 to-yellow-600/5",
              border: "border-yellow-500/10",
              iconColor: "text-yellow-400",
            },
          ].map((f, i) => (
            <div
              key={i}
              className={`bg-gradient-to-b ${f.color} border ${f.border} rounded-2xl p-6 backdrop-blur-sm hover:scale-[1.02] transition-transform duration-300`}
            >
              <f.icon size={28} className={`${f.iconColor} mb-4`} />
              <h3 className="font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <p className="text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} BudgetDog &bull; Built for tax professionals
        </p>
      </footer>
    </div>
  );
}
