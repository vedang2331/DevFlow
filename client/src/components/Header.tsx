import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { NotificationDropdown } from './NotificationDropdown';
import { ChevronDown, LogOut, Building2, Plus, Search, User as UserIcon, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { organizations, currentOrg, setCurrentOrg } = useWorkspace();
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-[#0B0F17] border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-black tracking-wider text-base">DF</span>
          </div>
          <span className="text-lg font-bold text-slate-100 tracking-tight hidden sm:block">
            DEV<span className="text-indigo-400">FLOW</span>
          </span>
        </Link>

        {/* Divider */}
        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        {/* Organization Workspace Switcher */}
        {currentOrg && (
          <div className="relative">
            <button
              onClick={() => setShowOrgDropdown(!showOrgDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:border-slate-700 transition-colors text-sm font-medium"
            >
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span className="max-w-[140px] truncate">{currentOrg.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showOrgDropdown && (
              <div className="absolute left-0 mt-2 w-64 bg-[#111827] border border-slate-800 rounded-xl shadow-2xl z-50 p-1.5">
                <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Workspaces
                </div>
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      setCurrentOrg(org);
                      setShowOrgDropdown(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                      currentOrg.id === org.id
                        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <div className="flex-1 truncate">
                      <p className="font-semibold text-slate-200">{org.name}</p>
                      <p className="text-[10px] text-slate-500">slug: {org.slug}</p>
                    </div>
                  </button>
                ))}
                <div className="border-t border-slate-800 mt-1 pt-1">
                  <Link
                    to="/organizations"
                    onClick={() => setShowOrgDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-indigo-400 hover:bg-slate-800 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create Organization
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Actions & User Profile */}
      <div className="flex items-center gap-3">
        {/* Real-time Notifications */}
        <NotificationDropdown />

        {/* User Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-800 transition-colors"
            >
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.name}`}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-indigo-500/30 object-cover"
              />
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-[#111827] border border-slate-800 rounded-xl shadow-2xl z-50 p-1.5">
                <div className="px-3 py-2.5 border-b border-slate-800">
                  <p className="text-xs font-semibold text-slate-100">{user.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    Profile Settings
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    Organization Roles
                  </Link>
                </div>

                <div className="border-t border-slate-800 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
