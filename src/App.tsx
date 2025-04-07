// App.tsx
import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import FolderView from "./pages/dashboard/FolderView";

// Dashboard Pages
import DashboardHome from "./pages/dashboard/DashboardHome";
import VideoLibrary from "./pages/dashboard/VideoLibrary";
import DashboardNotifications from "./pages/dashboard/DashboardNotifications";
import DashboardBilling from "./pages/dashboard/DashboardBilling";
import DashboardSettings from "./pages/dashboard/DashboardSettings";
import VideoDetail from "./pages/dashboard/VideoDetail";
import VideoUploadPage from "./pages/dashboard/VideoUploadPage";
import EnhancedVideoUpload from "./pages/dashboard/EnhancedVideoUpload";
import WorkspaceSettings from "./pages/dashboard/WorkspaceSettings";
import GoogleSheetsIntegration from "./pages/dashboard/GoogleSheetsIntegration";

// Admin Pages
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";
import SuperAdminSettings from "./pages/admin/SuperAdminSettings";
import ClientAdminDashboard from "./pages/admin/ClientAdminDashboard";
import UsersManagement from "./pages/admin/UsersManagement";
import VideoManagement from "./pages/admin/VideoManagement";
import AdminVideoDetail from "./pages/admin/AdminVideoDetail";
import ClientGroups from "./pages/admin/ClientGroups";
import ClientGroupDetail from "./pages/admin/client/groups/ClientGroupDetail";
import ClientGroupSuperDetail from "./pages/admin/ClientGroupDetail";

// Client Admin Pages
import ClientUsers from "./pages/admin/client/ClientUsers";
import ClientVideos from "./pages/admin/client/ClientVideos";
import ClientVideoUpload from "./pages/admin/client/ClientVideoUpload";
import ClientGroupsList from "./pages/admin/client/groups/ClientGroupsList";
import EnhancedClientVideoUpload from "./pages/admin/client/EnhancedClientVideoUpload";
import CampaignsList from "./pages/admin/client/campaigns/CampaignsList";
import CampaignDetail from "./pages/admin/client/campaigns/CampaignDetail";
import CampaignSettings from "./pages/admin/client/campaigns/CampaignSettings";

// Embed and Share Pages
import VideoEmbed from "./pages/embed/VideoEmbed";
import VideoShare from "./pages/share/VideoShare";
import SharedVideo from "./pages/share/SharedVideo";

// Providers and Context
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { fetchWorkspaces } from "./store/workspace/workspaceThunk";
import { useDispatch } from "react-redux";

const queryClient = new QueryClient();

// Protected route for super admin access
const ProtectedSuperAdminRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, isSuperAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

// Protected route for admin access (both super admin and client admin)
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Protected route wrapper for super admin
const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "super-admin") {
    return <Navigate to="/not-found" />;
  }

  return <>{children}</>;
};

const ClientAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation(); // Add this

  console.log("ClientAdminRoute - Current location:", location);
  console.log(
    "User:",
    user,
    "isAuthenticated:",
    isAuthenticated,
    "isAdmin:",
    isAdmin
  );

  if (!isAuthenticated) {
    console.log("ClientAdminRoute - Redirecting to /login");
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    console.log("ClientAdminRoute - Redirecting to /dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("ClientAdminRoute - Rendering children");
  return <>{children}</>;
};
// Redirect authenticated users based on their role
const RoleBasedRedirect = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  switch (user?.role) {
    case "super-admin":
      return <Navigate to="/admin/super" />;
    case "client-admin":
      return <Navigate to="/admin/client" />;
    default:
      return <Navigate to="/not-found" />;
  }
};

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const dispatch = useDispatch();
  // useEffect(() => {
  if (user) {
    dispatch(fetchWorkspaces());
  }
  // }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <AuthProvider>
      {/* <WorkspaceProvider> */}
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Router>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Register />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />

              {/* Profile Route */}
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />

              {/* Admin Routes */}
              <Route path="/admin" element={<RoleBasedRedirect />} />

              {/* Super Admin Routes */}
              <Route
                path="/admin/super"
                element={
                  <SuperAdminRoute>
                    <SuperAdminDashboard />
                  </SuperAdminRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <SuperAdminRoute>
                    <SuperAdminSettings />
                  </SuperAdminRoute>
                }
              />
              <Route
                path="/admin/client-groups"
                element={
                  <SuperAdminRoute>
                    <ClientGroups />
                  </SuperAdminRoute>
                }
              />
              <Route
                path="/admin/client-groups/:groupId"
                element={
                  <SuperAdminRoute>
                    <ClientGroupSuperDetail />
                  </SuperAdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <SuperAdminRoute>
                    <UsersManagement />
                  </SuperAdminRoute>
                }
              />
              <Route
                path="/admin/videos"
                element={
                  <SuperAdminRoute>
                    <VideoManagement />
                  </SuperAdminRoute>
                }
              />
              <Route
                path="/admin/videos/:id"
                element={
                  <SuperAdminRoute>
                    <AdminVideoDetail />
                  </SuperAdminRoute>
                }
              />

              {/* Client Admin Routes */}
              <Route
                path="/admin/client"
                element={
                  <ClientAdminRoute>
                    <ClientAdminDashboard />
                  </ClientAdminRoute>
                }
              />
              <Route
                path="/admin/client/users"
                element={
                  <ClientAdminRoute>
                    <ClientUsers />
                  </ClientAdminRoute>
                }
              />
              <Route
                path="/admin/client/videos"
                element={
                  <ClientAdminRoute>
                    <ClientVideos />
                  </ClientAdminRoute>
                }
              />
              <Route
                path="/admin/client/upload"
                element={
                  <ClientAdminRoute>
                    <ClientVideoUpload />
                  </ClientAdminRoute>
                }
              />
              <Route
                path="/admin/client/enhanced-upload"
                element={
                  <ClientAdminRoute>
                    <EnhancedClientVideoUpload />
                  </ClientAdminRoute>
                }
              />
              <Route
                path="/admin/client/videos/:id"
                element={
                  <ClientAdminRoute>
                    <VideoDetail />
                  </ClientAdminRoute>
                }
              />
              <Route
                path="/admin/client/videos/:id/settings"
                element={
                  <ClientAdminRoute>
                    <VideoDetail />
                  </ClientAdminRoute>
                }
              />
              <Route
                path="/admin/client/groups"
                element={
                  <ClientAdminRoute>
                    <ClientGroupsList />
                  </ClientAdminRoute>
                }
              />
              <Route
                path="/admin/client/groups/:groupId"
                element={
                  <ClientAdminRoute>
                    <ClientGroupDetail />
                  </ClientAdminRoute>
                }
              />
              <Route
                path="/admin/client/campaigns"
                element={
                  <ClientAdminRoute>
                    <CampaignsList />
                  </ClientAdminRoute>
                }
              />
              <Route
                path="/admin/client/campaigns/:campaignId"
                element={
                  <ClientAdminRoute>
                    <CampaignDetail />
                  </ClientAdminRoute>
                }
              />
              <Route
                path="/admin/client/campaigns/:campaignId/settings"
                element={
                  <ClientAdminRoute>
                    <CampaignSettings />
                  </ClientAdminRoute>
                }
              />

              {/* Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardHome />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/videos"
                element={
                  <PrivateRoute>
                    <VideoLibrary />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/folder/:folderId"
                element={
                  <PrivateRoute>
                    <FolderView />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/video/:videoId"
                element={
                  <PrivateRoute>
                    <VideoDetail />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/upload/:folderId"
                element={
                  <PrivateRoute>
                    <VideoUploadPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/enhanced-upload"
                element={
                  <PrivateRoute>
                    <EnhancedVideoUpload />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/enhanced-upload/:folderId"
                element={
                  <PrivateRoute>
                    <EnhancedVideoUpload />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/notifications"
                element={
                  <PrivateRoute>
                    <DashboardNotifications />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/billing"
                element={
                  <PrivateRoute>
                    <DashboardBilling />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/settings"
                element={
                  <PrivateRoute>
                    <DashboardSettings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/workspace"
                element={
                  <PrivateRoute>
                    <WorkspaceSettings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard/integrations/google-sheets"
                element={
                  <PrivateRoute>
                    <GoogleSheetsIntegration />
                  </PrivateRoute>
                }
              />

              {/* Embed and Share Routes */}
              <Route path="/embed/:id" element={<VideoEmbed />} />
              <Route path="/share/:id" element={<VideoShare />} />
              <Route path="/shared/:id" element={<SharedVideo />} />

              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
      {/* </WorkspaceProvider> */}
    </AuthProvider>
  );
};

export default App;
