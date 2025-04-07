import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentWorkspace } from '@/store/workspace/workspaceSlice';

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function useWorkspaces() {
  const dispatch = useDispatch();
  const currentWorkspace = useSelector(
    (state: { workspace: { currentWorkspace: Workspace | null } }) => state.workspace.currentWorkspace
  );
  const workspaces = useSelector(
    (state: { workspace: { workspaces: Workspace[] } }) => state.workspace.workspaces
  );

  // If there are workspaces but none selected, automatically select the first one
  useEffect(() => {
    if (!currentWorkspace && workspaces.length > 0) {
      dispatch(setCurrentWorkspace(workspaces[0]));
    }
  }, [currentWorkspace, workspaces, dispatch]);

  return {
    currentWorkspace,
    workspaces
  };
} 