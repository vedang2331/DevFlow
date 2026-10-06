import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Issue, IssueStatus } from '../../types';
import { PriorityBadge, TypeBadge } from '../../components/Badge';
import { useSocket } from '../../context/SocketContext';
import { Plus, MessageSquare, Calendar, User as UserIcon, Sparkles } from 'lucide-react';
import api from '../../api/client';

const COLUMNS: { id: IssueStatus; title: string; color: string }[] = [
  { id: 'BACKLOG', title: 'Backlog', color: 'border-t-slate-500' },
  { id: 'TODO', title: 'To Do', color: 'border-t-blue-500' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'border-t-amber-500' },
  { id: 'IN_REVIEW', title: 'In Review', color: 'border-t-purple-500' },
  { id: 'DONE', title: 'Done', color: 'border-t-emerald-500' },
];

interface KanbanBoardProps {
  projectId: string;
  onSelectIssue: (issue: Issue) => void;
  onOpenCreateModal: (defaultStatus?: IssueStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId,
  onSelectIssue,
  onOpenCreateModal,
}) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socket, joinProjectRoom } = useSocket();

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/projects/${projectId}/issues?limit=100`);
      setIssues(res.data.data);
    } catch (err) {
      console.error('Failed to fetch Kanban issues', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
    joinProjectRoom(projectId);
  }, [projectId]);

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;

    const handleIssueCreated = (newIssue: Issue) => {
      if (newIssue.projectId === projectId) {
        setIssues((prev) => [newIssue, ...prev]);
      }
    };

    const handleIssueUpdated = (updated: Issue) => {
      if (updated.projectId === projectId) {
        setIssues((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      }
    };

    const handleIssueReordered = (data: { issueId: string; status: IssueStatus; position: number; issue: Issue }) => {
      setIssues((prev) =>
        prev.map((item) => (item.id === data.issueId ? { ...item, status: data.status, position: data.position } : item))
      );
    };

    const handleIssueDeleted = (data: { issueId: string }) => {
      setIssues((prev) => prev.filter((item) => item.id !== data.issueId));
    };

    socket.on('issue_created', handleIssueCreated);
    socket.on('issue_updated', handleIssueUpdated);
    socket.on('issue_reordered', handleIssueReordered);
    socket.on('issue_deleted', handleIssueDeleted);

    return () => {
      socket.off('issue_created', handleIssueCreated);
      socket.off('issue_updated', handleIssueUpdated);
      socket.off('issue_reordered', handleIssueReordered);
      socket.off('issue_deleted', handleIssueDeleted);
    };
  }, [socket, projectId]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const targetStatus = destination.droppableId as IssueStatus;
    const targetPosition = (destination.index + 1) * 1000;

    // Optimistic UI update
    setIssues((prev) =>
      prev.map((item) =>
        item.id === draggableId ? { ...item, status: targetStatus, position: targetPosition } : item
      )
    );

    try {
      await api.patch(`/issues/${draggableId}/reorder`, {
        status: targetStatus,
        position: targetPosition,
      });
    } catch (err) {
      console.error('Failed to persist issue reorder', err);
      fetchIssues(); // Rollback on error
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 pt-2">
        {COLUMNS.map((col) => (
          <div key={col.id} className="w-80 flex-shrink-0 bg-slate-900/40 border border-slate-800 rounded-xl p-4 animate-pulse h-[600px]" />
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 items-start custom-scrollbar">
        {COLUMNS.map((col) => {
          const columnIssues = issues
            .filter((issue) => issue.status === col.id)
            .sort((a, b) => a.position - b.position);

          return (
            <div
              key={col.id}
              className={`w-80 flex-shrink-0 bg-[#0F1623] border border-slate-800/80 rounded-xl flex flex-col max-h-[calc(100vh-12rem)] border-t-2 ${col.color}`}
            >
              {/* Column Header */}
              <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between bg-[#111827]/40">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">{col.title}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] font-semibold text-slate-400 border border-slate-700">
                    {columnIssues.length}
                  </span>
                </div>
                <button
                  onClick={() => onOpenCreateModal(col.id)}
                  className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                  title={`Add ${col.title} Issue`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar transition-colors ${
                      snapshot.isDraggingOver ? 'bg-indigo-950/20' : ''
                    }`}
                    style={{ minHeight: '150px' }}
                  >
                    {columnIssues.map((issue, index) => (
                      <Draggable key={issue.id} draggableId={issue.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onSelectIssue(issue)}
                            className={`p-4 bg-[#141C2E] border border-slate-800 rounded-xl shadow-lg hover:border-indigo-500/50 transition-all cursor-pointer group ${
                              snapshot.isDragging ? 'rotate-2 scale-105 border-indigo-500 shadow-2xl z-50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-[11px] font-mono font-semibold text-indigo-400 group-hover:text-indigo-300">
                                {issue.issueKey}
                              </span>
                              <PriorityBadge priority={issue.priority} showIcon={false} />
                            </div>

                            <h4 className="text-xs font-semibold text-slate-100 line-clamp-2 mb-2 leading-relaxed">
                              {issue.title}
                            </h4>

                            {/* Tags / Labels */}
                            {issue.labels && issue.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {issue.labels.map((il) => (
                                  <span
                                    key={il.labelId}
                                    className="px-1.5 py-0.5 text-[10px] font-medium rounded border"
                                    style={{
                                      backgroundColor: `${il.label.color}15`,
                                      borderColor: `${il.label.color}30`,
                                      color: il.label.color,
                                    }}
                                  >
                                    {il.label.name}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Card Footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                              <div className="flex items-center gap-2">
                                <TypeBadge type={issue.type} />
                                {(issue._count?.comments ?? 0) > 0 && (
                                  <span className="flex items-center gap-1 text-slate-400">
                                    <MessageSquare className="w-3 h-3" />
                                    {issue._count?.comments}
                                  </span>
                                )}
                              </div>

                              {issue.assignee ? (
                                <img
                                  src={issue.assignee.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${issue.assignee.name}`}
                                  alt={issue.assignee.name}
                                  title={`Assigned to ${issue.assignee.name}`}
                                  className="w-6 h-6 rounded-full border border-slate-700"
                                />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500">
                                  <UserIcon className="w-3.5 h-3.5" />
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {columnIssues.length === 0 && (
                      <div className="h-28 flex flex-col items-center justify-center border border-dashed border-slate-800/80 rounded-xl text-center p-4">
                        <p className="text-xs text-slate-500">No issues</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
