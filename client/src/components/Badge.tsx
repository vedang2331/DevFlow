import React from 'react';
import { IssuePriority, IssueStatus, IssueType } from '../types';
import { AlertCircle, ArrowUp, ArrowDown, CheckCircle2, Circle, Clock, Flame, Tag, Layers, Bug, Sparkles, CheckSquare } from 'lucide-react';

interface PriorityBadgeProps {
  priority: IssuePriority;
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, showIcon = true }) => {
  const configs = {
    CRITICAL: { label: 'Critical', bg: 'bg-red-500/10 text-red-400 border-red-500/20', icon: Flame },
    HIGH: { label: 'High', bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: ArrowUp },
    MEDIUM: { label: 'Medium', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Circle },
    LOW: { label: 'Low', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: ArrowDown },
  };

  const config = configs[priority] || configs.MEDIUM;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg}`}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
};

interface StatusBadgeProps {
  status: IssueStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs = {
    BACKLOG: { label: 'Backlog', bg: 'bg-slate-800 text-slate-400 border-slate-700', icon: Circle },
    TODO: { label: 'To Do', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Clock },
    IN_PROGRESS: { label: 'In Progress', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Sparkles },
    IN_REVIEW: { label: 'In Review', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: Layers },
    DONE: { label: 'Done', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
  };

  const config = configs[status] || configs.TODO;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

interface TypeBadgeProps {
  type: IssueType;
}

export const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => {
  const configs = {
    BUG: { label: 'Bug', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', icon: Bug },
    FEATURE: { label: 'Feature', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', icon: Sparkles },
    TASK: { label: 'Task', bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20', icon: CheckSquare },
    IMPROVEMENT: { label: 'Improvement', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: Tag },
  };

  const config = configs[type] || configs.TASK;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${config.bg}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};
