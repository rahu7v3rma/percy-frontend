import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { makeApiRequest } from "@/config/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  Video,
  Upload,
  LogOut,
  Plus,
  ChevronDown,
  Folder,
  Settings,
  Users,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentWorkspace,
  WorkspaceState,
} from "@/store/workspace/workspaceSlice";
import { createWorkspace } from "@/store/workspace/workspaceThunk";
import { fetchFolders } from "@/store/folders/folderThunk";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface Folder {
  _id: string;
  name: string;
  workspaceId: string;
  parentFolderId: string | null;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  // const {
  //   workspaces,
  //   currentWorkspace,
  //   setCurrentWorkspace,
  //   refreshWorkspaces,
  // } = useWorkspace();

  const { toast } = useToast();
  const dispatch = useDispatch();
  // const [folders, setFolders] = useState<Folder[]>([]);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  // Define proper interfaces for the Redux state
  interface RootState {
    workspace: {
      currentWorkspace: {
        _id: string;
        name: string;
      } | null;
      workspaces: Array<{
        _id: string;
        name: string;
      }>;
    };
    folders: {
      folders: Folder[];
    };
  }

  const currentWorkspace = useSelector(
    (state: RootState) => state.workspace.currentWorkspace
  );
  const workspaces = useSelector((state: RootState) => state.workspace.workspaces);
  const folders = useSelector((state: RootState) => state.folders.folders);

  useEffect(() => {
    if (currentWorkspace) {
      // fetchFolders();
      dispatch(fetchFolders(currentWorkspace._id));
    }
  }, [currentWorkspace]);


  const handleCreateWorkspace = async () => {
    try {
      if (!newWorkspaceName.trim() || !user) return;
      dispatch(createWorkspace(newWorkspaceName));
    } catch (error) {
      console.log("workspace creation error ---- ", error);
    } finally {
      setIsCreateWorkspaceOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      current: location.pathname === "/dashboard",
    },
    {
      name: "My Library",
      href: "/dashboard/videos",
      icon: Video,
      current: location.pathname === "/dashboard/videos",
    },
    // {
    //   name: "Upload Video",
    //   href: "/dashboard/enhanced-upload",
    //   icon: Upload,
    //   current: location.pathname.includes("/dashboard/enhanced-upload"),
    // },
  ];

  const onWorkspaceChange = (value) => {
    const workspace = workspaces.find((w) => w._id === value);
    if (workspace) dispatch(setCurrentWorkspace(workspace));
  };

  return (
    <div className="min-h-screen ">
      <div className="absolute z-[-1] inset-0 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(138, 43, 226, 0.08) 0%, rgba(0, 0, 0, 0) 70%)",
            filter: "blur(100px)",
          }}
        />
        <div
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(138, 43, 226, 0.06) 0%, rgba(0, 0, 0, 0) 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-[200px] h-[200px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(138, 43, 226, 0.04) 0%, rgba(0, 0, 0, 0) 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 border-r min-h-screen bg-gradient-to-b from-gray-950 to-black">
        <div className="flex flex-col h-full">
          {/* Workspace Selector */}
          <div className="p-4 border-b mb-2">
            <Button
              onClick={() => setIsCreateWorkspaceOpen(true)}
              variant="outline"
              className="w-full mb-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Workspace
            </Button>

            <Select
              value={currentWorkspace?._id || ""}
              onValueChange={onWorkspaceChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((workspace) => (
                  <SelectItem key={workspace._id} value={workspace._id}>
                    {workspace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  item.current
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3 text-gray-400" />
                {item.name}
              </Link>
            ))}

            {/* Folders Section */}
            {currentWorkspace && (
              <div className="pt-4 ">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Folders
                </h3>
                <div className="mt-2 space-y-1">
                  {folders.map((folder) => (
                    <Link
                      key={folder._id}
                      to={`/dashboard/folder/${folder._id}`}
                      className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Folder className="w-5 h-5 mr-3 text-gray-400" />
                      {folder.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Workspace Actions */}
          {/* {currentWorkspace && (
            <div className="p-4 border-t">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Workspace
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => navigate(`/dashboard/workspace/settings`)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate(`/dashboard/workspace/members`)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Members
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )} */}

          {/* User Menu */}
          <div className="p-4 border-t">
            <Button onClick={handleLogout} variant="outline" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Create Workspace Dialog */}
      <Dialog
        open={isCreateWorkspaceOpen}
        onOpenChange={setIsCreateWorkspaceOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="">
              <Label htmlFor="workspace-name">Workspace Name</Label>
              <Input
                id="workspace-name"
                className="mt-3"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="Enter workspace name"
              />
            </div>
            <Button onClick={handleCreateWorkspace} className="w-full">
              Create Workspace
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="pl-64">
        <main className="">
          <div className="mx-auto py-10 sm:px-6 md:px-8 min-h-screen bg-gradient-to-b from-gray-950 to-black overflow-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
