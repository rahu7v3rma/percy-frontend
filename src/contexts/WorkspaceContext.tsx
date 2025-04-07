import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { API_BASE_URL, getAuthHeaders, handleApiResponse } from '@/config/api';

interface Workspace {
  _id: string;
  name: string;
  ownerId: string;
  members: {
    userId: string;
    role: 'owner' | 'admin' | 'member';
  }[];
  createdAt: string;
  updatedAt: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const { toast } = useToast();

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/workspaces`, {
        headers: getAuthHeaders()
      });
      const data = await handleApiResponse(response);
      setWorkspaces(data);

      // Set current workspace if none is selected
      if (!currentWorkspace && data.length > 0) {
        setCurrentWorkspace(data[0]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load workspaces',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const value = {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    refreshWorkspaces: fetchWorkspaces
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
