import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Modal } from './components/Modal';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectDashboardPage } from './pages/ProjectDashboardPage';
import { OrganizationsPage } from './pages/OrganizationsPage';

import api from './api/client';

const ProtectedLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { currentOrg, refreshProjects } = useWorkspace();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectKey, setProjectKey] = useState('');
  const [projectDesc, setProjectDesc] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center text-slate-400 font-sans">
        Loading DevFlow workspace...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;
    try {
      await api.post('/projects', {
        name: projectName,
        key: projectKey.toUpperCase(),
        description: projectDesc,
        organizationId: currentOrg.id,
      });
      setIsNewProjectModalOpen(false);
      setProjectName('');
      setProjectKey('');
      setProjectDesc('');
      refreshProjects();
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex flex-col font-sans">
      <Header />
      <div className="flex-1 flex">
        <Sidebar onNewProjectClick={() => setIsNewProjectModalOpen(true)} />
        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* New Project Modal */}
      <Modal isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Project Name</label>
            <input
              type="text"
              required
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                if (!projectKey) {
                  setProjectKey(e.target.value.substring(0, 3).toUpperCase());
                }
              }}
              placeholder="e.g. Core Backend API"
              className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Project Key (2-10 uppercase letters)</label>
            <input
              type="text"
              required
              maxLength={10}
              value={projectKey}
              onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
              placeholder="e.g. DEV"
              className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs font-mono font-bold text-indigo-400 focus:outline-none focus:border-indigo-500 uppercase"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
            <textarea
              rows={3}
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              placeholder="Brief summary of project goals..."
              className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <WorkspaceProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/organizations" element={<OrganizationsPage />} />
                <Route path="/projects/:projectId" element={<ProjectDashboardPage />}>
                  <Route path=":tab" element={<ProjectDashboardPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </WorkspaceProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
