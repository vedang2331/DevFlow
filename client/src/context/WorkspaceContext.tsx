import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { Organization, Project } from '../types';
import { useAuth } from './AuthContext';

interface WorkspaceContextType {
  organizations: Organization[];
  currentOrg: Organization | null;
  projects: Project[];
  currentProject: Project | null;
  isLoadingOrgs: boolean;
  isLoadingProjects: boolean;
  setCurrentOrg: (org: Organization) => void;
  setCurrentProject: (proj: Project | null) => void;
  refreshOrganizations: () => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrgState] = useState<Organization | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const fetchOrgs = async () => {
    if (!user) return;
    setIsLoadingOrgs(true);
    try {
      const res = await api.get('/organizations');
      const orgList: Organization[] = res.data.data;
      setOrganizations(orgList);
      if (orgList.length > 0 && !currentOrg) {
        setCurrentOrgState(orgList[0]);
      }
    } catch (err) {
      console.error('Failed to fetch organizations', err);
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  const fetchProjects = async () => {
    if (!currentOrg) {
      setProjects([]);
      setCurrentProject(null);
      return;
    }
    setIsLoadingProjects(true);
    try {
      const res = await api.get(`/projects?organizationId=${currentOrg.id}`);
      const projList: Project[] = res.data.data;
      setProjects(projList);
      if (projList.length > 0) {
        setCurrentProject(projList[0]);
      } else {
        setCurrentProject(null);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [currentOrg]);

  const setCurrentOrg = (org: Organization) => {
    setCurrentOrgState(org);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        organizations,
        currentOrg,
        projects,
        currentProject,
        isLoadingOrgs,
        isLoadingProjects,
        setCurrentOrg,
        setCurrentProject,
        refreshOrganizations: fetchOrgs,
        refreshProjects: fetchProjects,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return context;
};
