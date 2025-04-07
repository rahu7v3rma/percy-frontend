import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientAdminLayout from '@/components/layout/ClientAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getCampaign, type Campaign } from '@/services/campaignService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Video, Settings, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function CampaignDetail() {
  const { campaignId } = useParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!campaignId) return;
    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      const data = await getCampaign(campaignId!);
      setCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch campaign details',
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

  if (!campaign) {
    return (
      <ClientAdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Campaign Not Found</h2>
            <p className="text-muted-foreground mb-4">The campaign you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/admin/client/campaigns')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Button>
          </div>
        </div>
      </ClientAdminLayout>
    );
  }

  return (
    <ClientAdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => navigate("/admin/client/campaigns")} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground">{campaign.description || "No description"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Info</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <Badge
                      variant={
                        campaign.status === 'active'
                          ? 'default'
                          : campaign.status === 'inactive'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {campaign.status}
                    </Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created By</dt>
                  <dd className="mt-1">{campaign.createdBy.username}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created On</dt>
                  <dd className="mt-1">{new Date(campaign.createdAt).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Start Date</dt>
                  <dd className="mt-1">
                    {campaign.startDate
                      ? new Date(campaign.startDate).toLocaleDateString()
                      : 'Not set'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">End Date</dt>
                  <dd className="mt-1">
                    {campaign.endDate
                      ? new Date(campaign.endDate).toLocaleDateString()
                      : 'Not set'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Assigned Users</CardTitle>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Users
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaign.assignedUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        No users assigned to this campaign
                      </TableCell>
                    </TableRow>
                  ) : (
                    campaign.assignedUsers.map((assignedUser) => (
                      <TableRow key={assignedUser.user._id}>
                        <TableCell>{assignedUser.user.username}</TableCell>
                        <TableCell>{assignedUser.user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{assignedUser.role}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Campaign Videos</CardTitle>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Videos
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaign.videos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center">
                        No videos in this campaign
                      </TableCell>
                    </TableRow>
                  ) : (
                    campaign.videos.map((video) => (
                      <TableRow key={video._id}>
                        <TableCell>{video.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Ready</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => navigate(`/admin/client/campaigns/${campaignId}/settings`)}>
            <Settings className="mr-2 h-4 w-4" />
            Campaign Settings
          </Button>
        </div>
      </div>
    </ClientAdminLayout>
  );
} 