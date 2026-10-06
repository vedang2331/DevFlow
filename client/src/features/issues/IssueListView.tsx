import React, { useState, useEffect } from 'react';
import { Issue, IssueStatus, IssuePriority, IssueType } from '../../types';
import { PriorityBadge, StatusBadge, TypeBadge } from '../../components/Badge';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import api from '../../api/client';

interface IssueListViewProps {
  projectId: string;
  onSelectIssue: (issue: Issue) => void;
  onOpenCreateModal: () => void;
}

export const IssueListView: React.FC<IssueListViewProps> = ({
  projectId,
  onSelectIssue,
  onOpenCreateModal,
}) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        projectId,
        page: page.toString(),
        limit: '15',
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(priorityFilter ? { priority: priorityFilter } : {}),
        ...(typeFilter ? { type: typeFilter } : {}),
      });

      const res = await api.get(`/projects/${projectId}/issues?${params.toString()}`);
      setIssues(res.data.data);
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages || 1);
        setTotalCount(res.data.meta.total || 0);
      }
    } catch (err) {
      console.error('Failed to list issues', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [projectId, search, statusFilter, priorityFilter, typeFilter, page]);

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="p-4 bg-[#0F1623] border border-slate-800 rounded-xl flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search issues by key, title, description..."
              className="w-full pl-9 pr-4 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="BACKLOG">Backlog</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Types</option>
            <option value="BUG">Bug</option>
            <option value="FEATURE">Feature</option>
            <option value="TASK">Task</option>
            <option value="IMPROVEMENT">Improvement</option>
          </select>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Create Issue
        </button>
      </div>

      {/* Issues Table */}
      <div className="bg-[#0F1623] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading issues list...</div>
        ) : issues.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <p className="text-sm">No issues found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0B0F17]/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Key</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {issues.map((issue) => (
                  <tr
                    key={issue.id}
                    onClick={() => onSelectIssue(issue)}
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400 group-hover:text-indigo-300">
                      {issue.issueKey}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200 max-w-md truncate">
                      {issue.title}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={issue.status} />
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={issue.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <TypeBadge type={issue.type} />
                    </td>
                    <td className="py-3 px-4">
                      {issue.assignee ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={issue.assignee.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${issue.assignee.name}`}
                            alt={issue.assignee.name}
                            className="w-5 h-5 rounded-full border border-slate-700"
                          />
                          <span className="text-slate-300">{issue.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-800 bg-[#0B0F17]/40 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-slate-200">{issues.length}</strong> of{' '}
            <strong className="text-slate-200">{totalCount}</strong> issues
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
