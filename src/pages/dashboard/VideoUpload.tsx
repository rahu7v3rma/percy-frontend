import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Upload } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useSelector } from 'react-redux';

interface Folder {
  _id: string;
  name: string;
  parentFolderId: string | null;
  path: string;
}

export default function VideoUpload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null as File | null,
    folderId: '',
    isPrivate: false,
    allowedEmails: '',
    expirationDate: ''
  });
  const currentWorkspace = useSelector(
    (state: any) => state.workspace.currentWorkspace
  );

  const fetchFolders = async () => {
    if (!currentWorkspace) return;

    try {
      const response = await fetch(`/api/folders/workspace/${currentWorkspace._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch folders');
      const data = await response.json();
      setFolders(data);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

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
    if (!formData.file || !currentWorkspace) {
      toast({
        title: 'Error',
        description: 'Please select a video file and ensure you have a workspace selected',
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
      videoData.append('workspaceId', currentWorkspace._id);
      if (formData.folderId) {
        videoData.append('folderId', formData.folderId);
      }
      videoData.append('isPrivate', String(formData.isPrivate));
      if (formData.expirationDate) {
        videoData.append('expirationDate', formData.expirationDate);
      }
      if (formData.allowedEmails) {
        videoData.append('allowedEmails', formData.allowedEmails);
      }

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/videos/upload', true);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(progress));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          toast({
            title: 'Success',
            description: 'Video uploaded successfully',
          });
          navigate(`/dashboard/video/${response._id}`);
        } else {
          throw new Error('Upload failed');
        }
      };

      xhr.onerror = () => {
        throw new Error('Upload failed');
      };

      xhr.send(videoData);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload video',
        variant: 'destructive',
      });
      setUploading(false);
    }
  };

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
          <h1 className="text-2xl font-bold">Upload Video</h1>
        </div>
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
              <Label htmlFor="folder">Folder (Optional)</Label>
              <Select
                value={formData.folderId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, folderId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Root Folder</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder._id} value={folder._id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                ref={fileInputRef}
              />
              <p className="text-sm text-gray-500">
                Supported formats: MP4, WebM, MOV. Maximum file size: 2GB
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="private"
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrivate: checked }))}
                />
                <Label htmlFor="private">Make video private</Label>
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

            <Button
              type="submit"
              disabled={uploading}
              className="w-full"
            >
              {uploading ? (
                <div className="flex items-center">
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading... {uploadProgress}%
                </div>
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
  );
}
