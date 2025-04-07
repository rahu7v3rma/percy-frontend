import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Users,
  Video,
  Upload,
  Settings,
  LogOut,
  LayoutDashboard,
  FolderKanban,
  Megaphone
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ClientAdminLayoutProps {
  children: React.ReactNode;
}

const ClientAdminLayout = ({ children }: ClientAdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/admin/client', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/client/users', icon: Users },
    { name: 'Videos', href: '/admin/client/videos', icon: Video },
    { name: 'Campaigns', href: '/admin/client/campaigns', icon: Megaphone },
    { name: 'Client Groups', href: '/admin/client/groups', icon: FolderKanban },
    { name: 'Upload Video', href: '/admin/client/upload', icon: Upload },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6">
            <Link to="/admin/client" className="text-xl font-bold text-purple-500">
              Client Admin
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center px-4 py-2 text-sm rounded-lg',
                    location.pathname === item.href
                      ? 'bg-purple-500/10 text-purple-500'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-400 rounded-lg hover:text-white hover:bg-gray-800"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export default ClientAdminLayout;
