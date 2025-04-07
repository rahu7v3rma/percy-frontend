import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getVideos, type Video as VideoType, deleteVideo } from '@/services/videoService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreVertical, Video as VideoIcon, Trash2, Play, Eye, Settings } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { API_BASE_URL, API_URL, getFullUrl } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Videos() {
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isSuperAdmin) {
      navigate('/login');
      return;
    }

    document.title = 'Video Management';
    fetchVideos();
  }, [navigate, isAuthenticated, isSuperAdmin]);

  const fetchVideos = async () => {
    try {
      const data = await getVideos();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch videos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

  const handleBatchDeleteVideos = async () => {
    if (selectedVideos.length === 0) return;
    
    setIsProcessing(true);
    try {
      let successCount = 0;
      let errorCount = 0;
      
      await Promise.all(
        selectedVideos.map(async (videoId) => {
          try {
            await deleteVideo(videoId);
            successCount++;
          } catch (error) {
            console.error(`Error deleting video ${videoId}:`, error);
            errorCount++;
          }
        })
      );
      
      const updatedVideos = videos.filter(video => !selectedVideos.includes(video._id));
      setVideos(updatedVideos);
      setSelectedVideos([]);
      
      if (successCount > 0) {
        toast({
          title: 'Success',
          description: `Successfully deleted ${successCount} videos${errorCount > 0 ? ` (${errorCount} failed)` : ''}`,
          variant: errorCount > 0 ? 'default' : 'default',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete videos',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error in batch delete:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during batch deletion',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId) 
        : [...prev, videoId]
    );
  };

  const selectAllVideos = () => {
    if (selectedVideos.length === videos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(videos.map(video => video._id));
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Video Management</h2>
          
          {selectedVideos.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isProcessing}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedVideos.length})
            </Button>
          )}
        </div>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedVideos.length} videos? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isProcessing}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleBatchDeleteVideos}
                disabled={isProcessing}
              >
                {isProcessing ? 'Deleting...' : 'Delete Videos'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>All Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center space-x-2">
                <Checkbox 
                  id="selectAllVideos" 
                  checked={videos.length > 0 && selectedVideos.length === videos.length} 
                  onClick={selectAllVideos}
                />
                <label htmlFor="selectAllVideos" className="text-sm cursor-pointer">Select All</label>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Uploader</TableHead>
                    <TableHead>Client Admin</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                        No videos found
                      </TableCell>
                    </TableRow>
                  ) : (
                    videos.map((video) => (
                      <TableRow 
                        key={video._id} 
                        className={selectedVideos.includes(video._id) ? "bg-muted" : ""}
                      >
                        <TableCell>
                          <Checkbox 
                            checked={selectedVideos.includes(video._id)} 
                            onClick={() => toggleVideoSelection(video._id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {video.thumbnail ? (
                              <img
                                src={getFullUrl(video.thumbnail)}
                                alt={video.title}
                                className="h-8 w-8 rounded object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                <VideoIcon className="h-4 w-4" />
                              </div>
                            )}
                            <span className="font-medium">{video.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {video.uploader?.username}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {video.uploader?.email}
                          </span>
                        </TableCell>
                        <TableCell>
                          {typeof video.userId === 'object' && video.userId.role === 'client-admin' ? (
                            <>
                              {video.userId.username}
                              <br />
                              <span className="text-xs text-muted-foreground">
                                {video.userId.email}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
                        </TableCell>
                        <TableCell>{video.views}</TableCell>
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
                                onClick={() => window.open(video.url, '_blank')}
                                className="text-blue-500"
                              >
                                <Play className="mr-2 h-4 w-4" />
                                Play Video
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => navigate(`/admin/videos/${video._id}`)}
                                className="text-purple-500"
                              >
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteVideo(video._id)}
                                className="text-red-500"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Video
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
