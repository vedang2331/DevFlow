import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { Issue, IssueStatus, IssuePriority, IssueType, Comment, User } from '../../types';
import { PriorityBadge, StatusBadge, TypeBadge } from '../../components/Badge';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Trash2, Send, Clock, User as UserIcon, Check, Calendar, Activity, Tag } from 'lucide-react';
import api from '../../api/client';

interface IssueDetailModalProps {
  issueId: string | null;
  isOpen: boolean;
  onClose: () => void;
  projectMembers: User[];
  onIssueUpdated?: () => void;
}

export const IssueDetailModal: React.FC<IssueDetailModalProps> = ({
  issueId,
  isOpen,
  onClose,
  projectMembers,
  onIssueUpdated,
}) => {
  const { user } = useAuth();
  const { socket, joinIssueRoom, leaveIssueRoom } = useSocket();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const fetchIssueDetails = async () => {
    if (!issueId) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/issues/${issueId}`);
      setIssue(res.data.data);
      setComments(res.data.data.comments || []);
    } catch (err) {
      console.error('Failed to fetch issue details', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && issueId) {
      fetchIssueDetails();
      joinIssueRoom(issueId);
    }
    return () => {
      if (issueId) leaveIssueRoom(issueId);
    };
  }, [isOpen, issueId]);

  // Socket updates for comments and issue changes
  useEffect(() => {
    if (!socket || !issueId) return;

    const handleCommentAdded = (comment: Comment) => {
      setComments((prev) => [...prev, comment]);
    };

    const handleIssueUpdated = (updated: Issue) => {
      setIssue(updated);
    };

    socket.on('comment_added', handleCommentAdded);
    socket.on('issue_updated', handleIssueUpdated);

    return () => {
      socket.off('comment_added', handleCommentAdded);
      socket.off('issue_updated', handleIssueUpdated);
    };
  }, [socket, issueId]);

  const handleUpdateField = async (fields: Partial<Issue>) => {
    if (!issueId || !issue) return;
    try {
      const res = await api.patch(`/issues/${issueId}`, fields);
      setIssue(res.data.data);
      if (onIssueUpdated) onIssueUpdated();
    } catch (err) {
      console.error('Failed to update issue', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !issueId) return;

    setIsSubmittingComment(true);
    try {
      const res = await api.post(`/issues/${issueId}/comments`, { content: newComment });
      setComments((prev) => [...prev, res.data.data]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteIssue = async () => {
    if (!issueId || !window.confirm('Are you sure you want to delete this issue?')) return;
    try {
      await api.delete(`/issues/${issueId}`);
      onClose();
      if (onIssueUpdated) onIssueUpdated();
    } catch (err) {
      console.error('Failed to delete issue', err);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-4xl">
      {isLoading || !issue ? (
        <div className="p-8 text-center text-slate-400">Loading issue details...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Left Column (Title, Description, Comments) */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                  {issue.issueKey}
                </span>
                <TypeBadge type={issue.type} />
                <PriorityBadge priority={issue.priority} />
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-3">{issue.title}</h2>
              <div className="p-4 bg-[#0B0F17] rounded-xl border border-slate-800 text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {issue.description || <span className="text-slate-500 italic">No description provided</span>}
              </div>
            </div>

            {/* Comments Feed */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-200">Discussion ({comments.length})</h3>
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="flex gap-3">
                <img
                  src={user?.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user?.name}`}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border border-slate-700 mt-1"
                />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment... (real-time synced)"
                    className="flex-1 px-4 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newComment.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Comment
                  </button>
                </div>
              </form>

              {/* Comments List */}
              <div className="space-y-3 mt-4 max-h-60 overflow-y-auto custom-scrollbar">
                {comments.map((c) => (
                  <div key={c.id} className="p-3 bg-[#0B0F17]/60 border border-slate-800/80 rounded-xl flex gap-3">
                    <img
                      src={c.author.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${c.author.name}`}
                      alt={c.author.name}
                      className="w-7 h-7 rounded-full border border-slate-700 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200">{c.author.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Properties Panel */}
          <div className="bg-[#0B0F17] p-5 rounded-xl border border-slate-800 space-y-5 h-fit">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Properties</h4>

            {/* Status Dropdown */}
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1.5">Status</label>
              <select
                value={issue.status}
                onChange={(e) => handleUpdateField({ status: e.target.value as IssueStatus })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Priority Dropdown */}
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1.5">Priority</label>
              <select
                value={issue.priority}
                onChange={(e) => handleUpdateField({ priority: e.target.value as IssuePriority })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            {/* Assignee Selector */}
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1.5">Assignee</label>
              <select
                value={issue.assigneeId || ''}
                onChange={(e) => handleUpdateField({ assigneeId: e.target.value || null })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Unassigned</option>
                {projectMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reporter Info */}
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">Reporter</label>
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={issue.reporter.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${issue.reporter.name}`}
                  alt="Reporter"
                  className="w-6 h-6 rounded-full border border-slate-700"
                />
                <span className="text-xs font-medium text-slate-300">{issue.reporter.name}</span>
              </div>
            </div>

            {/* Timestamps */}
            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 space-y-1">
              <p>Created: {new Date(issue.createdAt).toLocaleDateString()}</p>
              <p>Updated: {new Date(issue.updatedAt).toLocaleDateString()}</p>
            </div>

            {/* Delete Issue Button */}
            <div className="pt-2">
              <button
                onClick={handleDeleteIssue}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg transition-colors border border-red-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
