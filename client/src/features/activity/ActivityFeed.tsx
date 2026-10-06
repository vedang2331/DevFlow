import React, { useState, useEffect } from 'react';
import { ActivityLog } from '../../types';
import { Activity, Clock, ShieldAlert, Sparkles, User as UserIcon } from 'lucide-react';
import api from '../../api/client';

interface ActivityFeedProps {
  projectId: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ projectId }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActivity = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/projects/${projectId}/activity`);
      setLogs(res.data.data);
    } catch (err) {
      console.error('Failed to fetch activity trail', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [projectId]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading audit activity trail...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-[#0F1623] border border-slate-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-100">Project Audit Timeline</h3>
        </div>
        <span className="text-xs text-slate-400">{logs.length} logged events</span>
      </div>

      <div className="bg-[#0F1623] border border-slate-800 rounded-xl p-6 space-y-6">
        {logs.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">No activity recorded yet for this project</p>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {logs.map((log) => (
              <div key={log.id} className="relative flex items-start gap-4 group">
                {/* Timeline Dot */}
                <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-[#0F1623]" />

                <img
                  src={log.actor.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${log.actor.name}`}
                  alt={log.actor.name}
                  className="w-8 h-8 rounded-full border border-slate-700"
                />

                <div className="flex-1 bg-[#0B0F17]/60 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-200">{log.actor.name}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1 font-mono">
                    <span className="text-indigo-400 font-bold">{log.action}: </span>
                    {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
