import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { Issue, ActivityLog } from '../types';
import { PriorityBadge, StatusBadge } from '../components/Badge';
import { LayoutDashboard, CheckCircle2, Clock, Flame, Sparkles, FolderGit2, ArrowRight, Activity, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { currentOrg, projects } = useWorkspace();
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    critical: 0,
    done: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!projects || projects.length === 0) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const firstProjId = projects[0].id;
        const res = await api.get(`/projects/${firstProjId}/issues?limit=20`);
        const issueList: Issue[] = res.data.data;
        setRecentIssues(issueList);

        setStats({
          total: issueList.length,
          inProgress: issueList.filter((i) => i.status === 'IN_PROGRESS').length,
          critical: issueList.filter((i) => i.priority === 'CRITICAL').length,
          done: issueList.filter((i) => i.status === 'DONE').length,
        });
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [projects]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-[#0F1623] border border-indigo-500/20 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400">Workspace Dashboard</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Welcome back, {user?.name}!</h1>
          <p className="text-xs text-slate-400 mt-1">
            Active Workspace: <strong className="text-slate-200">{currentOrg?.name || 'DevFlow Team'}</strong>
          </p>
        </div>

        {projects.length > 0 && (
          <Link
            to={`/projects/${projects[0].id}/board`}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-colors"
          >
            Open Project Board
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#0F1623] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Project Issues</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-100">{stats.total}</p>
        </div>

        <div className="p-5 bg-[#0F1623] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">In Progress Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-100">{stats.inProgress}</p>
        </div>

        <div className="p-5 bg-[#0F1623] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Critical Priority</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-100">{stats.critical}</p>
        </div>

        <div className="p-5 bg-[#0F1623] border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Completed Sprint Issues</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-100">{stats.done}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Active Issues */}
        <div className="lg:col-span-2 p-6 bg-[#0F1623] border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-slate-100">Recent Assigned & Active Issues</h3>
            <span className="text-xs text-slate-500">{recentIssues.length} items</span>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-slate-500">Loading issues...</div>
          ) : recentIssues.length === 0 ? (
            <div className="py-8 text-center text-slate-500">No issues found</div>
          ) : (
            <div className="space-y-2.5">
              {recentIssues.slice(0, 6).map((issue) => (
                <div
                  key={issue.id}
                  className="p-3.5 bg-[#0B0F17]/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-indigo-400 flex-shrink-0">
                      {issue.issueKey}
                    </span>
                    <span className="text-xs font-medium text-slate-200 truncate">{issue.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={issue.status} />
                    <PriorityBadge priority={issue.priority} showIcon={false} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workspace Summary Box */}
        <div className="p-6 bg-[#0F1623] border border-slate-800 rounded-xl space-y-5">
          <h3 className="text-sm font-bold text-slate-100 pb-3 border-b border-slate-800">
            Workspace Summary
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-slate-300">
              <span className="text-slate-400">Organization</span>
              <span className="font-semibold">{currentOrg?.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-slate-300">
              <span className="text-slate-400">Active Projects</span>
              <span className="font-semibold">{projects.length}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60 text-slate-300">
              <span className="text-slate-400">Your Role</span>
              <span className="font-semibold text-indigo-400">{currentOrg?.currentUserRole || 'OWNER'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
