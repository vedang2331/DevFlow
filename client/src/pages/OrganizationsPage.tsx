import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { Modal } from '../components/Modal';
import { Building2, Plus, UserPlus, Shield, Trash2, Mail, CheckCircle2 } from 'lucide-react';
import api from '../api/client';
import { OrgRole } from '../types';

export const OrganizationsPage: React.FC = () => {
  const { organizations, currentOrg, refreshOrganizations } = useWorkspace();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgRole>('MEMBER');

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/organizations', { name, slug });
      setIsCreateModalOpen(false);
      setName('');
      setSlug('');
      refreshOrganizations();
    } catch (err) {
      console.error('Failed to create organization', err);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;
    try {
      await api.post(`/organizations/${currentOrg.id}/members`, {
        email: inviteEmail,
        role: inviteRole,
      });
      setIsInviteModalOpen(false);
      setInviteEmail('');
      refreshOrganizations();
    } catch (err) {
      console.error('Failed to invite member', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 bg-[#0F1623] border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Organizations & Role-Based Access Control</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage multi-tenant workspace members, roles (Owner, Admin, Member), and permissions.
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Organization
        </button>
      </div>

      {currentOrg && (
        <div className="p-6 bg-[#0F1623] border border-slate-800 rounded-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-100">{currentOrg.name} Members</h2>
              <p className="text-xs text-slate-400">slug: {currentOrg.slug}</p>
            </div>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          </div>

          <div className="space-y-3">
            {currentOrg.members?.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-[#0B0F17]/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={m.user.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${m.user.name}`}
                    alt={m.user.name}
                    className="w-9 h-9 rounded-full border border-slate-700"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-100">{m.user.name}</p>
                    <p className="text-[11px] text-slate-400">{m.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 uppercase tracking-wider">
                    {m.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Org Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Workspace">
        <form onSubmit={handleCreateOrg} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Organization Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
              }}
              placeholder="Acme Engineering"
              className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Workspace Slug (URL-friendly identifier)</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="acme-engineering"
              className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
            >
              Create Workspace
            </button>
          </div>
        </form>
      </Modal>

      {/* Invite Member Modal */}
      <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite Member to Workspace">
        <form onSubmit={handleInviteMember} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">User Email Address</label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="developer@devflow.io"
              className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Organization Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as OrgRole)}
              className="w-full px-3 py-2 bg-[#0B0F17] border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="MEMBER">Member (Create & Update assigned issues)</option>
              <option value="ADMIN">Admin (Manage projects & team members)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
