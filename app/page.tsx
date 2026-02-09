"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [name, setName] = useState("");
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      login(name);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            BudgetDog <span className="text-yellow-400">Command Center</span>
          </h1>
          <p className="text-zinc-500">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 rounded-lg transition-colors"
          >
            Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
