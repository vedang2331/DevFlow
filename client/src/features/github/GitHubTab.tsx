import React, { useState, useEffect } from 'react';
import { GitHubIntegration } from '../../types';
import { Github, GitCommit, GitPullRequest, ExternalLink, CheckCircle2, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import api from '../../api/client';

interface GitHubTabProps {
  projectId: string;
}

export const GitHubTab: React.FC<GitHubTabProps> = ({ projectId }) => {
  const [data, setData] = useState<{
    integration: GitHubIntegration | null;
    commits: any[];
    pullRequests: any[];
  }>({ integration: null, commits: [], pullRequests: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [repoName, setRepoName] = useState('devflow-io/devflow');
  const [repoUrl, setRepoUrl] = useState('https://github.com/devflow-io/devflow');

  const fetchGitHubDetails = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/projects/${projectId}/github`);
      if (res.data.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch GitHub integration', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGitHubDetails();
  }, [projectId]);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${projectId}/github/connect`, {
        repositoryName: repoName,
        repositoryUrl: repoUrl,
      });
      fetchGitHubDetails();
    } catch (err) {
      console.error('Failed to connect GitHub repository', err);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading GitHub Integration...</div>;
  }

  return (
    <div className="space-y-6">
      {/* GitHub Repository Connection Header */}
      <div className="p-6 bg-[#0F1623] border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-200">
            <Github className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">
                {data.integration ? data.integration.repositoryName : 'Connect GitHub Repository'}
              </h3>
              {data.integration?.isConnected && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Connected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Link code commits, pull requests, and enable automatic issue status transitions via Webhooks.
            </p>
          </div>
        </div>

        {!data.integration?.isConnected && (
          <form onSubmit={handleConnect} className="flex gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="owner/repository"
              className="px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Connect Repo
            </button>
          </form>
        )}
      </div>

      {data.integration?.isConnected && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Commits Timeline */}
          <div className="lg:col-span-2 p-5 bg-[#0F1623] border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-slate-200">Recent Code Commits</h4>
              </div>
              <a
                href={data.integration.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                View on GitHub
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-3">
              {data.commits.map((c) => (
                <div key={c.sha} className="p-3 bg-[#0B0F17]/60 border border-slate-800/80 rounded-xl flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{c.message}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                      <span>by {c.author}</span>
                      <span>•</span>
                      <span>{new Date(c.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {c.sha}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pull Requests & Webhook Guide */}
          <div className="space-y-6">
            <div className="p-5 bg-[#0F1623] border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <GitPullRequest className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-bold text-slate-200">Pull Requests</h4>
              </div>

              <div className="space-y-3">
                {data.pullRequests.map((pr) => (
                  <div key={pr.id} className="p-3 bg-[#0B0F17]/60 border border-slate-800/80 rounded-xl">
                    <p className="text-xs font-semibold text-slate-200">{pr.title}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span className="capitalize text-purple-400 font-medium">{pr.state}</span>
                      <span>{pr.author}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Webhook Guide Box */}
            <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                <Sparkles className="w-4 h-4" />
                Auto-Close Issue Keywords
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Include <code className="text-indigo-300 font-mono">Fixes DEV-102</code> or <code className="text-indigo-300 font-mono">Closes DEV-102</code> in your commit message to automatically transition issues to <strong>DONE</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
