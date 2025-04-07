import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Share2,
  Code,
  Link as LinkIcon,
  Copy,
  Calendar,
  Mail,
  Save,
  Trash2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';

interface Video {
  _id: string;
  title: string;
  description: string;
  filePath: string;
  thumbnail: string;
  views: number;
  isPrivate: boolean;
  allowedEmails: string[];
  expirationDate: string | null;
  createdAt: string;
  workspaceId: string;
  folderId: string | null;
}

export default function VideoDetails() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isEmbedDialogOpen, setIsEmbedDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    isPrivate: false,
    allowedEmails: '',
    expirationDate: ''
  });

  useEffect(() => {
    if (!videoId) return;
    fetchVideoDetails();
  }, [videoId]);

  const fetchVideoDetails = async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch video details');
      const data = await response.json();
      setVideo(data);
      setEditForm({
        title: data.title,
        description: data.description || '',
        isPrivate: data.isPrivate,
        allowedEmails: data.allowedEmails?.join('\n') || '',
        expirationDate: data.expirationDate || ''
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load video details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          isPrivate: editForm.isPrivate,
          allowedEmails: editForm.allowedEmails.split('\n').filter(email => email.trim()),
          expirationDate: editForm.expirationDate || null
        })
      });

      if (!response.ok) throw new Error('Failed to update video');
      
      toast({
        title: 'Success',
        description: 'Video updated successfully',
      });
      fetchVideoDetails();
      setEditMode(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update video',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteVideo = async () => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete video');
      
      toast({
        title: 'Success',
        description: 'Video deleted successfully',
      });
      navigate('/dashboard/videos');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete video',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Link copied to clipboard',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!video) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{video.title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsShareDialogOpen(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button onClick={() => setIsEmbedDialogOpen(true)}>
            <Code className="mr-2 h-4 w-4" />
            Embed
          </Button>
        </div>
      </div>

      {/* Video Player */}
      <Card>
        <CardContent className="p-0">
          <div className="aspect-video">
            <video
              src={video.filePath}
              controls
              className="w-full h-full"
              poster={video.thumbnail}
            />
          </div>
        </CardContent>
      </Card>

      {/* Video Details */}
      <Card>
        <CardHeader>
          <CardTitle>Video Details</CardTitle>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editForm.title}
                  onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="private"
                  checked={editForm.isPrivate}
                  onCheckedChange={checked => setEditForm(prev => ({ ...prev, isPrivate: checked }))}
                />
                <Label htmlFor="private">Make video private</Label>
              </div>

              {editForm.isPrivate && (
                <>
                  <div>
                    <Label htmlFor="expiration">Expiration Date (Optional)</Label>
                    <Input
                      id="expiration"
                      type="datetime-local"
                      value={editForm.expirationDate}
                      onChange={e => setEditForm(prev => ({ ...prev, expirationDate: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="emails">Allowed Emails (One per line)</Label>
                    <Textarea
                      id="emails"
                      value={editForm.allowedEmails}
                      onChange={e => setEditForm(prev => ({ ...prev, allowedEmails: e.target.value }))}
                      rows={4}
                      placeholder="Enter email addresses, one per line"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="mt-1 text-gray-600">{video.description || 'No description provided'}</p>
              </div>

              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-gray-600">Views</span>
                <span>{video.views}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-gray-600">Privacy</span>
                <span>{video.isPrivate ? 'Private' : 'Public'}</span>
              </div>

              {video.isPrivate && (
                <>
                  {video.expirationDate && (
                    <div className="flex items-center justify-between py-2 border-t">
                      <span className="text-gray-600">Expires</span>
                      <span>{new Date(video.expirationDate).toLocaleString()}</span>
                    </div>
                  )}

                  {video.allowedEmails?.length > 0 && (
                    <div className="py-2 border-t">
                      <h3 className="font-medium mb-2">Allowed Emails</h3>
                      <div className="space-y-1">
                        {video.allowedEmails.map(email => (
                          <div key={email} className="text-sm text-gray-600">{email}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-gray-600">Created</span>
                <span>{new Date(video.createdAt).toLocaleString()}</span>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditMode(true)}>
                  Edit Details
                </Button>
                <Button variant="destructive" onClick={handleDeleteVideo}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Video
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Direct Link</Label>
              <div className="flex mt-1.5">
                <Input
                  readOnly
                  value={`${window.location.origin}/shared/${video._id}`}
                />
                <Button
                  className="ml-2"
                  onClick={() => copyToClipboard(`${window.location.origin}/shared/${video._id}`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Embed Dialog */}
      <Dialog open={isEmbedDialogOpen} onOpenChange={setIsEmbedDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Embed Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Embed Code</Label>
              <div className="flex mt-1.5">
                <Input
                  readOnly
                  value={`<iframe src="${window.location.origin}/embed/${video._id}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`}
                />
                <Button
                  className="ml-2"
                  onClick={() => copyToClipboard(`<iframe src="${window.location.origin}/embed/${video._id}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
