import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, Workspace } from '@/lib/api';
import { useAuth } from '@/features/auth/AuthContext';

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  setCurrentWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string, description?: string) => Promise<Workspace>;
  updateWorkspace: (id: string, name: string, description?: string) => Promise<Workspace>;
  deleteWorkspace: (id: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshWorkspaces = useCallback(async () => {
    if (!isAuthenticated) {
      setWorkspaces([]);
      setCurrentWorkspaceState(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.workspaces.list();
      const list = res.data;
      setWorkspaces(list);

      // Restore active workspace from localStorage or pick the first
      const storedId = localStorage.getItem('lifestack_active_workspace');
      const matched = list.find((w) => w.id === storedId);

      if (matched) {
        setCurrentWorkspaceState(matched);
      } else if (list.length > 0) {
        setCurrentWorkspaceState(list[0]);
        localStorage.setItem('lifestack_active_workspace', list[0].id);
      } else {
        setCurrentWorkspaceState(null);
      }
    } catch {
      setWorkspaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWorkspaces();
  }, [refreshWorkspaces]);

  const setCurrentWorkspace = (workspace: Workspace) => {
    setCurrentWorkspaceState(workspace);
    localStorage.setItem('lifestack_active_workspace', workspace.id);
  };

  const createWorkspace = async (name: string, description?: string) => {
    const res = await api.workspaces.create({ name, description });
    const newWs = res.data;
    await refreshWorkspaces();
    setCurrentWorkspace(newWs);
    return newWs;
  };

  const updateWorkspace = async (id: string, name: string, description?: string) => {
    const res = await api.workspaces.update(id, { name, description });
    const updated = res.data;
    await refreshWorkspaces();
    if (currentWorkspace?.id === id) {
      setCurrentWorkspace(updated);
    }
    return updated;
  };

  const deleteWorkspace = async (id: string) => {
    await api.workspaces.delete(id);
    await refreshWorkspaces();
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        isLoading,
        setCurrentWorkspace,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        refreshWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

