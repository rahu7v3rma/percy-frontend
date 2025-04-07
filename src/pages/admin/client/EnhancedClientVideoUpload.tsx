import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  CheckCircle2, 
  Upload, 
  FileVideo, 
  Tag, 
  Settings, 
  Check, 
  Loader2,
  X,
  ArrowLeft
} from 'lucide-react';
import ClientAdminLayout from '@/components/layout/ClientAdminLayout';
import { EnhancedVideoUploader } from '@/components/video/EnhancedVideoUploader';
import { API_BASE_URL } from '@/config/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/contexts/AuthContext';
import { getClientGroups, type ClientGroup } from '@/services/clientGroupService';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RecentVideo {
  _id: string;
  title: string;
  thumbnailUrl?: string;
  createdAt: string;
  views?: number;
}

interface VideoResponse {
  _id: string;
  title: string;
  userId?: {
    _id: string;
    username: string;
    email: string;
  };
  thumbnailUrl?: string;
  createdAt: string;
  views?: number;
}

export default function EnhancedClientVideoUpload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadState, setUploadState] = useState<'waiting' | 'uploading' | 'processing' | 'complete' | 'error'>('waiting');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [activeTab, setActiveTab] = useState("upload");
  const [recentUploads, setRecentUploads] = useState<RecentVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch client groups where the current client admin is assigned
    const fetchClientGroups = async () => {
      try {
        const groups = await getClientGroups();
        setClientGroups(groups);
      } catch (error) {
        console.error('Failed to fetch client groups', error);
        toast({
          title: 'Error',
          description: 'Failed to load client groups',
          variant: 'destructive',
        });
      }
    };

    // Fetch recent uploads
    const fetchRecentUploads = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/videos`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch videos');
        }
        
        const data = await response.json();
        const filteredVideos = data.filter((video: VideoResponse) => 
          video.userId && video.userId._id === user?._id
        );
        setRecentUploads(filteredVideos.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch recent uploads', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientGroups();
    fetchRecentUploads();
  }, [toast, user]);

  // Handle file selection - update state but don't upload yet
  const handleFileSelect = (file: File) => {
    if (!file) {
      // User canceled the selection
      setSelectedVideo(null);
      return;
    }
    
    setSelectedVideo(file);
    
    // Extract file name without extension and set as title only if no title exists or it's empty
    if (!title.trim()) {
      const newTitle = file.name.replace(/\.[^/.]+$/, "");
      setTitle(newTitle);
    }
    
    // Clear any previous errors
    setErrorMessage('');
    setUploadState('waiting');
  };
  
  // Handle actual upload - called when user clicks the Upload button
  const handleUpload = (file: File) => {
    if (!file) return;
    
    // Use the current title for validation
    startVideoUpload(file);
  };
  
  const startVideoUpload = async (videoFile: File) => {
    try {
      // Validate the title
      if (!title.trim()) {
        setErrorMessage('Please enter a video title');
        setUploadState('error');
        return;
      }

      // Check file size - prevent uploads that exceed backend limit
      const MAX_ALLOWED_SIZE = 500 * 1024 * 1024; // 500MB
      if (videoFile.size > MAX_ALLOWED_SIZE) {
        setErrorMessage(`File size (${(videoFile.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum allowed size of 500 MB. Please select a smaller file.`);
        setUploadState('error');
        return;
      }

      setUploadState('uploading');
      setErrorMessage('');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('file', videoFile);
      
      // Add tags if they exist
      if (tags) {
        formData.append('tags', tags);
      }
      
      // Add privacy setting
      formData.append('isPublic', isPublic.toString());
      
      // Add client group if selected
      if (selectedGroupId) {
        formData.append('clientGroup', selectedGroupId);
      }
      
      if (selectedThumbnail) {
        formData.append('thumbnail', selectedThumbnail);
      }

      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Create XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/videos`, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.withCredentials = true;

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = function () {
        if (xhr.status === 201) {
          setUploadState('processing');
          
          // Simulate processing time
          setTimeout(() => {
            setUploadState('complete');
            
            toast({
              title: 'Upload Complete',
              description: 'Your video has been uploaded and is now processing. You can view it in your videos list.',
              variant: 'default',
            });
            
            // Add to recent uploads
            const response = JSON.parse(xhr.responseText);
            if (thumbnailPreview) {
              response.thumbnailUrl = thumbnailPreview;
            }
            
            setRecentUploads(prev => [response, ...prev.slice(0, 4)]);
          }, 2000);
        } else {
          setUploadState('error');
          setErrorMessage(`Upload failed: ${xhr.statusText}`);
          
          toast({
            title: 'Upload Failed',
            description: `There was an error uploading your video: ${xhr.statusText}`,
            variant: 'destructive',
          });
        }
      };

      xhr.onerror = function () {
        setUploadState('error');
        setErrorMessage('Network error occurred during upload');
        
        toast({
          title: 'Network Error',
          description: 'A network error occurred while uploading. Please check your connection and try again.',
          variant: 'destructive',
        });
      };

      xhr.send(formData);
    } catch (error) {
      setUploadState('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      
      toast({
        title: 'Upload Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred during upload',
        variant: 'destructive',
      });
    }
  };

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file for the thumbnail",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Thumbnail image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedThumbnail(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getUploadStatusUI = () => {
    switch (uploadState) {
      case 'uploading':
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
            <h3 className="text-lg font-medium">Uploading Video...</h3>
            <Progress value={uploadProgress} className="w-full max-w-md" />
            <p className="text-sm text-muted-foreground">{uploadProgress}% Complete</p>
          </div>
        );
      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
            <h3 className="text-lg font-medium">Processing Video...</h3>
            <p className="text-sm text-muted-foreground">Your video is being processed. This may take a few minutes.</p>
          </div>
        );
      case 'complete':
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <h3 className="text-lg font-medium">Upload Complete!</h3>
            <p className="text-sm text-muted-foreground">Your video has been uploaded and is being processed.</p>
            <div className="flex space-x-4">
              <Button onClick={() => navigate('/admin/client/videos')}>
                View All Videos
              </Button>
              <Button variant="outline" onClick={() => {
                setTitle('');
                setDescription('');
                setTags('');
                setSelectedVideo(null);
                setSelectedThumbnail(null);
                setThumbnailPreview(null);
                setUploadState('waiting');
                setUploadProgress(0);
                setErrorMessage('');
              }}>
                Upload Another
              </Button>
            </div>
          </div>
        );
      case 'error':
        return (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              {errorMessage || 'An error occurred during upload. Please try again.'}
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <ClientAdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Enhanced Video Upload</h1>
            <p className="text-muted-foreground">Upload videos with advanced options</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/client/videos')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Videos
          </Button>
        </div>
        
        <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="recent">Recent Uploads</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Video Upload</CardTitle>
                  <CardDescription>
                    Upload a new video to your library with enhanced options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {uploadState === 'waiting' ? (
                    <div className="space-y-6">
                      <EnhancedVideoUploader 
                        onFileSelect={handleFileSelect}
                        onUpload={handleUpload}
                        className="min-h-[300px]"
                      />
                      
                      {selectedVideo && (
                        <>
                          <div className="space-y-4 mt-6">
                            <div className="space-y-2">
                              <Label htmlFor="title">Title</Label>
                              <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter a title for your video"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter a description"
                                rows={4}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="tags">Tags (comma separated)</Label>
                              <Input
                                id="tags"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                placeholder="education, tutorial, etc."
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="clientGroup">Client Group (optional)</Label>
                              <Select 
                                value={selectedGroupId} 
                                onValueChange={setSelectedGroupId}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a client group" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Client Groups</SelectLabel>
                                    {clientGroups.length === 0 ? (
                                      <SelectItem value="none" disabled>No client groups available</SelectItem>
                                    ) : (
                                      <>
                                        <SelectItem value="">None</SelectItem>
                                        {clientGroups.map(group => (
                                          <SelectItem key={group._id} value={group._id}>
                                            {group.name}
                                          </SelectItem>
                                        ))}
                                      </>
                                    )}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                              <p className="text-sm text-muted-foreground">
                                Associate this video with a client group to give group members access
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="thumbnail">Custom Thumbnail (optional)</Label>
                              <Input
                                id="thumbnail"
                                type="file"
                                onChange={handleThumbnailChange}
                                accept="image/*"
                              />
                              <p className="text-sm text-muted-foreground">
                                Upload a custom thumbnail image (JPG, PNG, max 5MB)
                              </p>
                              
                              {thumbnailPreview && (
                                <div className="mt-2 relative w-40 h-24 overflow-hidden rounded-md border border-border">
                                  <img 
                                    src={thumbnailPreview} 
                                    alt="Thumbnail preview" 
                                    className="object-cover w-full h-full"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedThumbnail(null);
                                      setThumbnailPreview(null);
                                    }}
                                    className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
                                    aria-label="Remove thumbnail"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id="isPublic"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label htmlFor="isPublic">Make video public</Label>
                            </div>
                            
                            <Button 
                              type="button" 
                              onClick={() => handleUpload(selectedVideo)}
                              className="w-full bg-purple-600 hover:bg-purple-700"
                            >
                              <Upload className="mr-2 h-4 w-4 text-purple-400" />
                              Upload Video
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    getUploadStatusUI()
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Upload Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Tag className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Add Descriptive Titles</h4>
                        <p className="text-sm text-muted-foreground">
                          Clear, descriptive titles help users find your videos.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <FileVideo className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Optimal Video Formats</h4>
                        <p className="text-sm text-muted-foreground">
                          MP4 with H.264 encoding works best for playback on all devices.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Settings className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Custom Thumbnails</h4>
                        <p className="text-sm text-muted-foreground">
                          Upload a custom thumbnail to make your video stand out.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Check className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Client Group Access</h4>
                        <p className="text-sm text-muted-foreground">
                          Associate videos with client groups to control who can view them.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
                <CardDescription>
                  Your most recently uploaded videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : recentUploads.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileVideo className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No videos yet</h3>
                    <p>Upload your first video to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentUploads.map((video) => (
                      <div 
                        key={video._id} 
                        className="flex items-center space-x-4 p-4 rounded-md border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-24 h-14 relative rounded overflow-hidden bg-muted">
                          {video.thumbnailUrl ? (
                            <img 
                              src={video.thumbnailUrl} 
                              alt={video.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileVideo className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                          {/* Status indicator */}
                          <div className="absolute bottom-1 right-1 bg-black/70 text-xs px-1.5 py-0.5 rounded text-white">
                            {video.views || 0} view{(video.views !== 1) && 's'}
                          </div>
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <h4 className="font-medium text-sm truncate">{video.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            Uploaded on {formatDate(video.createdAt)}
                          </p>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/admin/client/videos/${video._id}/settings`)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ClientAdminLayout>
  );
} 