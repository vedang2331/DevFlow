import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import { Issue, IssueStatus, IssuePriority, IssueType, Project } from '../types';
import { KanbanBoard } from '../features/kanban/KanbanBoard';
import { IssueListView } from '../features/issues/IssueListView';
import { IssueDetailModal } from '../features/issues/IssueDetailModal';
import { GitHubTab } from '../features/github/GitHubTab';
import { ActivityFeed } from '../features/activity/ActivityFeed';
import { Modal } from '../components/Modal';
import { Kanban, ListTodo, Activity, Github, Plus, UserPlus, Users, FolderGit2 } from 'lucide-react';
import api from '../api/client';

export const ProjectDashboardPage: React.FC = () => {
  const { projectId, tab = 'board' } = useParams<{ projectId: string; tab?: string }>();
  const navigate = useNavigate();
  const { currentProject } = useWorkspace();
  const [project, setProject] = useState<Project | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<IssueStatus>('BACKLOG');

  // Create Issue Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<IssueStatus>('BACKLOG');
  const [priority, setPriority] = useState<IssuePriority>('MEDIUM');
  const [type, setType] = useState<IssueType>('TASK');
  const [assigneeId, setAssigneeId] = useState<string>('');

  const fetchProjectDetails = async () => {
    if (!projectId) return;
    try {
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data.data);
    } catch (err) {
      console.error('Failed to fetch project details', err);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  const handleOpenCreateModal = (defaultStatus: IssueStatus = 'BACKLOG') => {
    setCreateDefaultStatus(defaultStatus);
    setStatus(defaultStatus);
    setIsCreateModalOpen(true);
  };

  const handleCreateIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;
    try {
      await api.post(`/projects/${projectId}/issues`, {
        title,
        description,
        status,
        priority,
        type,
        assigneeId: assigneeId || null,
      });
      setIsCreateModalOpen(false);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Failed to create issue', err);
    }
  };

  const activeTab = tab || 'board';

  return (
    <div className="space-y-6">
      {/* Project Header Bar */}
      <div className="p-6 bg-[#0F1623] border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-lg">
            {project?.key || 'DEV'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100">{project?.name || 'Project Workspace'}</h1>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono font-bold text-slate-400 border border-slate-700">
                KEY: {project?.key}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl truncate">
              {project?.description || 'Manage project issues, team members, Kanban columns, and GitHub integration.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenCreateModal('BACKLOG')}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Issue
        </button>
      </div>

      {/* Tab Navigation Bar */}
      <div className="border-b border-slate-800 flex gap-6 text-xs font-semibold">
        <button
          onClick={() => navigate(`/projects/${projectId}/board`)}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'board'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Kanban className="w-4 h-4" />
          Kanban Board
        </button>
        <button
          onClick={() => navigate(`/projects/${projectId}/issues`)}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'issues'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          Issues List
        </button>
        <button
          onClick={() => navigate(`/projects/${projectId}/activity`)}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'activity'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Activity Trail
        </button>
        <button
          onClick={() => navigate(`/projects/${projectId}/github`)}
          className={`pb-3 flex items-center gap-2 transition-colors border-b-2 ${
            activeTab === 'github'
              ? 'border-indigo-500 text-indigo-400 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Github className="w-4 h-4" />
          GitHub Integration
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'board' && (
        <KanbanBoard
          projectId={projectId!}
          onSelectIssue={(issue) => {
            setSelectedIssue(issue);
            setIsDetailModalOpen(true);
          }}
          onOpenCreateModal={handleOpenCreateModal}
        />
      )}

      {activeTab === 'issues' && (
        <IssueListView
          projectId={projectId!}
          onSelectIssue={(issue) => {
            setSelectedIssue(issue);
            setIsDetailModalOpen(true);
          }}
          onOpenCreateModal={() => handleOpenCreateModal('BACKLOG')}
        />
      )}

      {activeTab === 'activity' && <ActivityFeed projectId={projectId!} />}

      {activeTab === 'github' && <GitHubTab projectId={projectId!} />}

      {/* Issue Detail Modal */}
      <IssueDetailModal
        issueId={selectedIssue?.id || null}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedIssue(null);
        }}
        projectMembers={project?.members?.map((m) => m.user) || []}
      />

      {/* Create Issue Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Issue"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateIssue} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Socket.IO real-time reconnect strategy"
              className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, acceptance criteria, or reproduction steps..."
              className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Status Column</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IssueStatus)}
                className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
                className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as IssueType)}
                className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="BUG">Bug</option>
                <option value="FEATURE">Feature</option>
                <option value="TASK">Task</option>
                <option value="IMPROVEMENT">Improvement</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Assignee</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Unassigned</option>
                {project?.members?.map((m) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20"
            >
              Create Issue
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
