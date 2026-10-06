import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Kanban, ShieldCheck, Zap, Github, Layers, ArrowRight, CheckCircle2, Users } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async (email: string) => {
    try {
      await login(email, 'Password123!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-300">
      {/* Navigation Bar */}
      <nav className="h-20 border-b border-slate-800/80 px-6 sm:px-12 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-black text-lg">DF</span>
          </div>
          <span className="text-xl font-bold tracking-tight">
            DEV<span className="text-indigo-400">FLOW</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              Go to Workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2">
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 sm:px-12 pt-16 pb-24 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8 animate-fade-in">
          <Zap className="w-3.5 h-3.5" />
          <span>Full-Stack Developer Collaboration & Issue Tracking Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 max-w-4xl leading-tight mb-6">
          Architected for Software Development Teams That Move <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Fast</span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl leading-relaxed mb-10">
          A Jira + GitHub Issues + Trello platform built with React, Express, PostgreSQL, Prisma, Socket.IO WebSockets, and Redis.
        </p>

        {/* Instant One-Click Demo Logins */}
        <div className="p-6 bg-[#0F1623] border border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full mb-16">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            ⚡ One-Click Interactive Role Previews
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleDemoLogin('owner@devflow.io')}
              className="p-3 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-left transition-all group"
            >
              <p className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300">Org Owner</p>
              <p className="text-[10px] text-slate-400">Vedang Dev</p>
            </button>
            <button
              onClick={() => handleDemoLogin('admin@devflow.io')}
              className="p-3 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 rounded-xl text-left transition-all group"
            >
              <p className="text-xs font-bold text-purple-400 group-hover:text-purple-300">Project Lead</p>
              <p className="text-[10px] text-slate-400">Sarah Connor</p>
            </button>
            <button
              onClick={() => handleDemoLogin('developer@devflow.io')}
              className="p-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-left transition-all group"
            >
              <p className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">Developer</p>
              <p className="text-[10px] text-slate-400">Alex Rivera</p>
            </button>
          </div>
        </div>

        {/* Engineering Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
          <div className="p-6 bg-[#0F1623] border border-slate-800/80 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Kanban className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Drag-and-Drop Kanban</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time column movement with optimistic UI updates and instant Socket.IO broadcasts across team member screens.
            </p>
          </div>

          <div className="p-6 bg-[#0F1623] border border-slate-800/80 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">RBAC & JWT Token Rotation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-tenant Organization & Project access control with short-lived access tokens and SHA-256 hashed refresh token rotation.
            </p>
          </div>

          <div className="p-6 bg-[#0F1623] border border-slate-800/80 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Github className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-100">GitHub Webhook Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect code repositories and automatically transition DevFlow issues to DONE via commit message parsers.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 DevFlow Platform. Engineered with Clean Layered Architecture.</p>
      </footer>
    </div>
  );
};
