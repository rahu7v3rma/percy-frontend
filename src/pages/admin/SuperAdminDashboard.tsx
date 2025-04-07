import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { createClientAdmin, getUsers, type User, type CreateClientAdminResponse, updateUserStatus, deleteUser } from '@/services/userManagementService';
import { getVideos, type Video as VideoType, deleteVideo } from '@/services/videoService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserPlus, MoreVertical, Ban, XCircle, CheckCircle, Trash2, Video as VideoIcon, Eye, Loader2, Play, Settings, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { API_BASE_URL } from '@/config/api';

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'videos'>('users');
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const { toast } = useToast();
  const { user, isAuthenticated, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated or not super admin
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isSuperAdmin) {
      navigate('/');
      return;
    }

    document.title = 'Super Admin Dashboard';
    const fetchData = async () => {
      try {
        const [usersData, videosData] = await Promise.all([
          getUsers(),
          getVideos()
        ]);
        setUsers(usersData);
        setVideos(videosData);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Check if error is due to authentication
        if (error instanceof Error && error.message.includes('authentication')) {
          navigate('/login');
          return;
        }
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, navigate, isAuthenticated, isSuperAdmin]);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      console.log('Fetched users:', data);
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClientAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Creating client admin with data:', formData);
      const response = await createClientAdmin(formData);
      toast({
        title: 'Success',
        description: response.message,
      });

      setIsDialogOpen(false);
      setFormData({ username: '', email: '', password: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating client admin:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create client admin',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateUserStatus = async (id: string, status: User['status']) => {
    try {
      await updateUserStatus(id, status);
      toast({
        title: 'Success',
        description: `User status updated to ${status}`,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteUser(id);
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      await deleteVideo(id);
      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      });
      const updatedVideos = videos.filter(video => video._id !== id);
      setVideos(updatedVideos);
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete video',
        variant: 'destructive',
      });
    }
  };

  const handleViewVideo = (video: VideoType) => {
    setSelectedVideo(video);
    setIsVideoDialogOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Super Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage client admins and view system statistics</p>
          </div>
          <div className="flex gap-4">
            <Button
              variant={activeTab === 'users' ? 'default' : 'outline'}
              onClick={() => navigate('/admin/users')}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              User Management
            </Button>
            <Button
              variant={activeTab === 'videos' ? 'default' : 'outline'}
              onClick={() => navigate('/admin/videos')}
            >
              <VideoIcon className="mr-2 h-4 w-4" />
              Videos
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/client-groups')}
            >
              <Users className="mr-2 h-4 w-4" />
              Client Groups
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>

        {activeTab === 'users' ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Client Admins</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {users.filter(user => user.role === 'client-admin').length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {users.filter(user => user.role === 'user').length}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {users.filter(user => user.status === 'active').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Client Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .filter(user => user.role === 'client-admin')
                      .map((admin) => (
                        <TableRow key={admin._id}>
                          <TableCell className="font-medium">{admin.username}</TableCell>
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                admin.status === 'active'
                                  ? 'bg-green-500/10 text-green-500'
                                  : admin.status === 'suspended'
                                  ? 'bg-yellow-500/10 text-yellow-500'
                                  : 'bg-red-500/10 text-red-500'
                              }`}
                            >
                              {admin.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {users.filter(user => user.clientId === admin._id).length}
                          </TableCell>
                          <TableCell>
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {admin.status === 'active' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateUserStatus(admin._id, 'suspended')}
                                      className="text-yellow-500"
                                    >
                                      <Ban className="mr-2 h-4 w-4" />
                                      Suspend Admin
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateUserStatus(admin._id, 'banned')}
                                      className="text-red-500"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Ban Admin
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {admin.status === 'suspended' && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateUserStatus(admin._id, 'active')}
                                      className="text-green-500"
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Activate Admin
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateUserStatus(admin._id, 'banned')}
                                      className="text-red-500"
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Ban Admin
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {admin.status === 'banned' && (
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateUserStatus(admin._id, 'active')}
                                    className="text-green-500"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Unban Admin
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(admin._id)}
                                  className="text-red-700"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Admin
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Videos</CardTitle>
                <CardDescription>View and manage all uploaded videos</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Uploader</TableHead>
                      <TableHead>File Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {videos.map((video) => (
                      <TableRow key={video._id}>
                        <TableCell>{video.title}</TableCell>
                        <TableCell>{video.uploader?.username || 'Unknown'}</TableCell>
                        <TableCell>
                          {typeof video.fileSize === 'number' 
                            ? `${(video.fileSize / (1024 * 1024)).toFixed(2)} MB`
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              video.status === 'ready'
                                ? 'bg-green-500/10 text-green-500'
                                : video.status === 'processing'
                                ? 'bg-yellow-500/10 text-yellow-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}
                          >
                            {video.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewVideo(video)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Quick View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/admin/videos/${video._id}`)}>
                                <Settings className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteVideo(video._id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{selectedVideo?.title}</DialogTitle>
            </DialogHeader>
            {selectedVideo && (
              <div className="aspect-video relative">
                <video
                  className="w-full h-full rounded-lg"
                  controls
                  src={`${API_BASE_URL}/videos/${selectedVideo._id}/stream`}
                  poster={selectedVideo.thumbnail}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Client Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Client Admin</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateClientAdmin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="submit" className="w-full">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
