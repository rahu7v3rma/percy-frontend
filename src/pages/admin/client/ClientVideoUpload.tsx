import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientAdminLayout from '@/components/layout/ClientAdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Upload, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadVideo } from '@/services/videoService';

export default function ClientVideoUpload() {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null as File | null,
    isPrivate: false,
    expirationDate: '',
    allowedEmails: '',
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      toast({
        title: 'Error',
        description: 'Please select a video file to upload',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const videoData = new FormData();
      videoData.append('title', formData.title);
      videoData.append('description', formData.description);
      videoData.append('file', formData.file);
      videoData.append('userId', user?._id || '');
      videoData.append('isPrivate', String(formData.isPrivate));
      if (formData.expirationDate) {
        videoData.append('expirationDate', formData.expirationDate);
      }
      if (formData.allowedEmails) {
        videoData.append('allowedEmails', formData.allowedEmails);
      }

      await uploadVideo(videoData);
      toast({
        title: 'Success',
        description: 'Video uploaded successfully',
      });
      navigate('/admin/client/videos');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload video',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <ClientAdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Upload Video</h1>
            <p className="text-muted-foreground">Upload a new video to your library</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/client/videos')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Videos
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Video Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter video title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter video description"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Video File</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  required
                />
                <p className="text-sm text-gray-500">
                  Supported formats: MP4, WebM, MOV. Maximum file size: 2GB
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isPrivate">Make video private</Label>
                </div>
                <p className="text-sm text-gray-500">
                  Private videos can only be accessed by specified email addresses
                </p>
              </div>

              {formData.isPrivate && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="expirationDate">Expiration Date (Optional)</Label>
                    <Input
                      id="expirationDate"
                      name="expirationDate"
                      type="datetime-local"
                      value={formData.expirationDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allowedEmails">Allowed Emails</Label>
                    <Textarea
                      id="allowedEmails"
                      name="allowedEmails"
                      value={formData.allowedEmails}
                      onChange={handleInputChange}
                      placeholder="Enter email addresses (one per line)"
                      rows={3}
                    />
                    <p className="text-sm text-gray-500">
                      Enter email addresses that can access this video, one per line
                    </p>
                  </div>
                </>
              )}

              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Video
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ClientAdminLayout>
  );
}
