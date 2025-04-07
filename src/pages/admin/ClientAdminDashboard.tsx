import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientAdminLayout from '@/components/layout/ClientAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getUsers, type User } from '@/services/userManagementService';
import { getVideos, type Video } from '@/services/videoService';
import { getCampaigns, type Campaign } from '@/services/campaignService';
import { UserPlus, Upload, Video as VideoIcon, Megaphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ClientAdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  console.log('ClientAdminDashboard - User:');
  useEffect(() => {
    document.title = 'Client Admin Dashboard';
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, videosData, campaignsData] = await Promise.all([
        getUsers(),
        getVideos(),
        getCampaigns()
      ]);
      // Filter data for this client admin
      const filteredUsers = usersData.filter(u => u.clientId === user?._id);
      const filteredVideos = videosData.filter(v => v.userId === user?._id);
      const filteredCampaigns = campaignsData.filter(campaign => 
        campaign.assignedUsers.some(assignedUser => 
          typeof assignedUser.user._id === 'string' && 
          typeof user?._id === 'string' && 
          assignedUser.user._id === user._id && 
          assignedUser.role === 'admin'
        )
      );
      setUsers(filteredUsers);
      setVideos(filteredVideos);
      setCampaigns(filteredCampaigns);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ClientAdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </ClientAdminLayout>
    );
  }

  return (
    <ClientAdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Client Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your users and videos</p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/client/users')}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Users
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/client/videos')}
            >
              <VideoIcon className="mr-2 h-4 w-4" />
              Videos
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/client/campaigns')}
            >
              <Megaphone className="mr-2 h-4 w-4" />
              Campaigns
            </Button>
            <Button
              variant="default"
              onClick={() => navigate('/admin/client/upload')} 
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Video
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{videos.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{campaigns.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium">No users yet</h3>
                  <p className="mt-2">Create your first user to get started</p>
                  <Button className="mt-4" onClick={() => navigate('/admin/client/users')}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Manage Users
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.slice(0, 5).map(user => (
                    <div key={user._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.status === 'active'
                            ? 'bg-green-500/10 text-green-500'
                            : user.status === 'suspended'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                  ))}
                  {users.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/admin/client/users')}
                    >
                      View All Users
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Megaphone className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium">No campaigns yet</h3>
                  <p className="mt-2">Create your first campaign to get started</p>
                  <Button className="mt-4" onClick={() => navigate('/admin/client/campaigns')}>
                    <Megaphone className="mr-2 h-4 w-4" />
                    Manage Campaigns
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.slice(0, 5).map(campaign => (
                    <div key={campaign._id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-gray-500">
                          {campaign.videos.length} videos • {campaign.assignedUsers.length} users
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          campaign.status === 'active'
                            ? 'bg-green-500/10 text-green-500'
                            : campaign.status === 'inactive'
                            ? 'bg-yellow-500/10 text-yellow-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </div>
                  ))}
                  {campaigns.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/admin/client/campaigns')}
                    >
                      View All Campaigns
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientAdminLayout>
  );
}
