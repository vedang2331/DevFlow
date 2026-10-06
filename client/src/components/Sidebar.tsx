import React from 'react';
import { NavLink } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { LayoutDashboard, Kanban, FolderGit2, Building2, Settings, Plus, ListTodo, Activity, Github } from 'lucide-react';

export const Sidebar: React.FC<{ onNewProjectClick?: () => void }> = ({ onNewProjectClick }) => {
  const { currentProject, projects, setCurrentProject } = useWorkspace();

  return (
    <aside className="w-64 bg-[#0B0F17] border-r border-slate-800/80 flex flex-col h-[calc(100vh-4rem)] sticky top-16 hidden md:flex">
      <div className="p-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
        {/* Main Navigation Links */}
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Platform Overview
          </p>
          <nav className="space-y-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-indigo-600/10 text-indigo-400 font-semibold border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </NavLink>
            <NavLink
              to="/organizations"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? 'bg-indigo-600/10 text-indigo-400 font-semibold border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <Building2 className="w-4 h-4" />
              Workspaces & Roles
            </NavLink>
          </nav>
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Projects ({projects.length})
            </p>
            {onNewProjectClick && (
              <button
                onClick={onNewProjectClick}
                className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                title="Create Project"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1">
            {projects.length === 0 ? (
              <p className="px-3 py-2 text-xs text-slate-500">No projects yet</p>
            ) : (
              projects.map((proj) => {
                const isSelected = currentProject?.id === proj.id;
                return (
                  <button
                    key={proj.id}
                    onClick={() => setCurrentProject(proj)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                      isSelected
                        ? 'bg-slate-800/90 text-indigo-300 font-semibold border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <span className="w-6 h-6 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px] border border-indigo-500/20">
                      {proj.key}
                    </span>
                    <span className="truncate flex-1">{proj.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Active Project Navigation */}
        {currentProject && (
          <div className="border-t border-slate-800/80 pt-4">
            <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {currentProject.key} Views
            </p>
            <nav className="space-y-1">
              <NavLink
                to={`/projects/${currentProject.id}/board`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive ? 'bg-indigo-600/10 text-indigo-400 font-semibold border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`
                }
              >
                <Kanban className="w-4 h-4" />
                Kanban Board
              </NavLink>
              <NavLink
                to={`/projects/${currentProject.id}/issues`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive ? 'bg-indigo-600/10 text-indigo-400 font-semibold border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`
                }
              >
                <ListTodo className="w-4 h-4" />
                Issues List
              </NavLink>
              <NavLink
                to={`/projects/${currentProject.id}/activity`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive ? 'bg-indigo-600/10 text-indigo-400 font-semibold border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`
                }
              >
                <Activity className="w-4 h-4" />
                Activity Trail
              </NavLink>
              <NavLink
                to={`/projects/${currentProject.id}/github`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive ? 'bg-indigo-600/10 text-indigo-400 font-semibold border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`
                }
              >
                <Github className="w-4 h-4" />
                GitHub Integration
              </NavLink>
            </nav>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
          <p className="text-[11px] font-medium text-slate-400">Environment</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">Production Mode</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
