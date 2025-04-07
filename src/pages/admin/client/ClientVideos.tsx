import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientAdminLayout from '@/components/layout/ClientAdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getVideos, type Video, deleteVideo } from '@/services/videoService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Upload, MoreVertical, Play, Eye, Trash2, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/config/api';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ClientVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, isClientAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !isClientAdmin) {
      navigate('/login');
      return;
    }

    document.title = 'Video Management';
    fetchVideos();
  }, [navigate, isAuthenticated, isClientAdmin]);

  const fetchVideos = async () => {
    try {
      const data = await getVideos();
      // Filter videos for this client admin
      const filteredVideos = data.filter(v => v.userId._id === user?._id);
      setVideos(filteredVideos);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch videos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      await deleteVideo(videoId);
      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      });
      const updatedVideos = videos.filter(video => video._id !== videoId);
      setVideos(updatedVideos);
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete video',
        variant: 'destructive',
      });
    }
  };

  const handleBatchDeleteVideos = async () => {
    if (selectedVideos.length === 0) return;
    setIsProcessing(true);

    try {
      // Delete each selected video one by one
      const promises = selectedVideos.map(videoId => deleteVideo(videoId));
      await Promise.all(promises);

      // Update the videos list
      setVideos(videos.filter(video => !selectedVideos.includes(video._id)));
      setSelectedVideos([]);
      
      toast({
        title: 'Success',
        description: `${selectedVideos.length} videos deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting videos:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete some videos',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setDeleteDialogOpen(false);
    }
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId) 
        : [...prev, videoId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedVideos.length === videos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(videos.map(video => video._id));
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
            <h1 className="text-2xl font-bold">Video Management</h1>
            <p className="text-muted-foreground">Manage your video content</p>
          </div>
          <div className="flex gap-2">
            {selectedVideos.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isProcessing}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedVideos.length})
              </Button>
            )}
            <Button onClick={() => navigate('/admin/client/upload')}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Video
            </Button>
            <Button variant="secondary" onClick={() => navigate('/admin/client/enhanced-upload')}>
              <Upload className="mr-2 h-4 w-4" />
              Enhanced Upload
            </Button>
          </div>
        </div>

        {/* Delete confirmation dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Videos</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedVideos.length} selected videos? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isProcessing}>Cancel</Button>
              <Button variant="destructive" onClick={handleBatchDeleteVideos} disabled={isProcessing}>
                {isProcessing ? 'Deleting...' : 'Delete Videos'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              <CardTitle>Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {videos.reduce((acc, video) => acc + (video.views || 0), 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Processing Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {videos.filter(video => video.status === 'processing').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Videos List</CardTitle>
            <CardDescription>
              All your uploaded videos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {videos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Upload className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium">No videos yet</h3>
                <p className="mt-2">Upload your first video to get started</p>
                <Button className="mt-4" onClick={() => navigate('/admin/client/upload')}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Video
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox 
                        checked={selectedVideos.length === videos.length && videos.length > 0}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((video) => (
                    <TableRow key={video._id} className={selectedVideos.includes(video._id) ? "bg-muted/30" : ""}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedVideos.includes(video._id)}
                          onCheckedChange={() => toggleVideoSelection(video._id)}
                          aria-label={`Select ${video.title}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{video.title}</TableCell>
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
                      <TableCell>{video.views || 0}</TableCell>
                      <TableCell>
                        {new Date(video.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => window.open(`${API_BASE_URL}/videos/${video._id}/stream`, '_blank')}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Video
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/admin/client/videos/${video._id}/settings`)}
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteVideo(video._id)}
                              className="text-red-700"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Video
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientAdminLayout>
  );
}
