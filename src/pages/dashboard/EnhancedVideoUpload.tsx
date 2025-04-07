import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Link as LinkIcon, 
  Settings, 
  Check, 
  Loader2,
  X,
  ArrowLeft
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { EnhancedVideoUploader } from '@/components/video/EnhancedVideoUploader';
import { API_BASE_URL, makeApiRequest } from '@/config/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useSelector } from 'react-redux';

// Define interfaces
interface Workspace {
  _id: string;
  name: string;
}

interface RecentVideo {
  id?: string;
  _id?: string;
  title: string;
  thumbnailUrl?: string;
  createdAt: string;
  views?: number;
}

// Use a simplified workspace hook since we couldn't create a separate file
function useWorkspaces() {
  const currentWorkspace = useSelector(
    (state: { workspace: { currentWorkspace: Workspace | null } }) => state.workspace.currentWorkspace
  );
  
  return { currentWorkspace };
}

export default function EnhancedVideoUpload() {
  const { folderId } = useParams();
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
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaces();
  const [activeTab, setActiveTab] = useState("upload");
  const [recentUploads, setRecentUploads] = useState<RecentVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch recent uploads
    const fetchRecentUploads = async () => {
      try {
        setIsLoading(true);
        const data = await makeApiRequest('/videos?limit=5');
        setRecentUploads(data || []);
      } catch (error) {
        console.error('Failed to fetch recent uploads', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentUploads();
  }, []);

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

      // Ensure workspace is selected
      if (!currentWorkspace || !currentWorkspace._id) {
        setErrorMessage('No workspace selected. Please select a workspace first.');
        setUploadState('error');
        return;
      }

      setUploadState('uploading');
      setErrorMessage('');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('folderId', folderId || '');
      formData.append('video', videoFile);
      
      // Add tags if they exist
      if (tags) {
        formData.append('tags', tags);
      }
      
      // Add privacy setting
      formData.append('isPublic', isPublic.toString());
      
      if (selectedThumbnail) {
        formData.append('thumbnail', selectedThumbnail);
      }

      const workspaceId = currentWorkspace._id;
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Create XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/videos/workspace/${workspaceId}`, true);
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
            const response = JSON.parse(xhr.responseText);
            
            // If we have a thumbnail preview, add it to the response data for display in recent uploads
            if (thumbnailPreview) {
              response.thumbnailUrl = thumbnailPreview;
              
              // Update recent uploads with the thumbnail
              setRecentUploads(prev => {
                const updatedUploads = [...prev];
                const index = updatedUploads.findIndex(v => v._id === response._id || v.id === response.id);
                if (index !== -1) {
                  updatedUploads[index] = {...updatedUploads[index], thumbnailUrl: thumbnailPreview};
                }
                return updatedUploads;
              });
            }
            
            toast({
              title: "Upload Successful",
              description: "Your video has been uploaded successfully."
            });
            
            // Redirect after 2 seconds
            setTimeout(() => {
              navigate(`/dashboard/video/${response._id || response.id}`);
            }, 2000);
          }, 3000);
        } else {
          setUploadState('error');
          setErrorMessage('Upload failed. Please try again.');
        }
      };

      xhr.onerror = function () {
        setUploadState('error');
        setErrorMessage('Network error occurred. Please check your internet connection and try again.');
      };

      xhr.send(formData);
    } catch (error) {
      setUploadState('error');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(errorMsg);
    }
  };

  const handlePublish = () => {
    if (uploadState === 'complete') {
      // Navigate to the video details page or dashboard
      navigate(`/dashboard`);
    }
  };

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file for the thumbnail",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Thumbnail image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedThumbnail(file);
    
    // Create a thumbnail URL for preview
    const thumbnailPreviewUrl = URL.createObjectURL(file);
    setThumbnailPreview(thumbnailPreviewUrl);

    toast({
      title: "Thumbnail selected",
      description: "Thumbnail will be uploaded with your video"
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-opal-400 to-opal-600 w-8 h-8 rounded-lg flex items-center justify-center text-white">
                <FileVideo className="h-4 w-4" />
              </div>
              <div className="text-xs uppercase text-gray-500">UPLOAD</div>
            </div>
            <h1 className="text-3xl font-bold mt-1">Video Uploader</h1>
            <p className="text-gray-400 mt-1">Upload, customize, and manage your videos</p>
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/upload${folderId ? `/${folderId}` : ''}`)}
              className="text-sm"
            >
              <ArrowLeft className="mr-1 h-4 w-4" /> Switch to Classic Uploader
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 w-64">
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
            <TabsTrigger value="recent">Recent Uploads</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Upload Area */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-900 border-gray-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-opal-800 to-opal-900 h-1.5 w-full"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5 text-opal-400" />
                      Upload New Video
                    </CardTitle>
                    <CardDescription>
                      Select a video file to upload to your workspace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {uploadState === 'waiting' && (
                      <EnhancedVideoUploader 
                        onUpload={handleUpload}
                        onFileSelect={handleFileSelect}
                        maxSizeMB={500}
                        className="min-h-[350px]"
                      />
                    )}
                    
                    {(uploadState === 'uploading' || uploadState === 'processing') && (
                      <div className="bg-gray-800/50 rounded-lg p-8 flex flex-col items-center justify-center min-h-[350px]">
                        <div className="w-16 h-16 rounded-full bg-opal-500/10 flex items-center justify-center mb-4">
                          <Loader2 size={28} className="text-opal-500 animate-spin" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          {uploadState === 'uploading' ? 'Uploading Video...' : 'Processing Video...'}
                        </h3>
                        <p className="text-gray-400 text-center mb-4">
                          {uploadState === 'uploading' 
                            ? 'Your video is being uploaded to our servers.' 
                            : 'We\'re optimizing your video for playback on all devices.'}
                        </p>
                        <div className="w-full max-w-md bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-opal-500 h-full transition-all duration-300"
                            style={{ 
                              width: uploadState === 'uploading' ? `${uploadProgress}%` : '60%',
                              animation: uploadState === 'processing' ? 'pulse 2s infinite' : 'none'
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {uploadState === 'complete' && (
                      <div className="bg-gray-800/50 rounded-lg p-8 flex flex-col items-center justify-center min-h-[350px]">
                        <div className="w-16 h-16 rounded-full bg-green-100/10 flex items-center justify-center mb-4">
                          <Check size={28} className="text-green-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Upload Complete</h3>
                        <p className="text-gray-400 text-center mb-6">
                          Your video has been uploaded and processed successfully.
                        </p>
                        <p className="text-center text-sm text-gray-500">
                          Provide additional details about your video on the right, then publish when you're ready.
                        </p>
                      </div>
                    )}
                    
                    {uploadState === 'error' && (
                      <div className="bg-red-900/20 rounded-lg p-8 flex flex-col items-center justify-center min-h-[350px]">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                          <AlertCircle size={28} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-red-400">Upload Failed</h3>
                        <p className="text-red-400 text-center mb-6">
                          {errorMessage || "There was an error uploading your video. Please try again."}
                        </p>
                        <Button
                          onClick={() => setUploadState('waiting')}
                          variant="destructive"
                        >
                          Try Again
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column - Video Details */}
              <div className="lg:col-span-1">
                <Card className={`bg-gray-900 border-gray-800 overflow-hidden h-full transition-all duration-300 ${selectedVideo && uploadState === 'waiting' ? 'shadow-[0_0_15px_rgba(91,33,182,0.15)] border-opal-500/30' : ''}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings size={18} className="text-opal-400" /> Video Details
                    </CardTitle>
                    {selectedVideo && uploadState === 'waiting' && (
                      <CardDescription>
                        Customize your video details before starting the upload
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-1" htmlFor="title">
                        Title
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter video title"
                        disabled={uploadState === 'uploading'}
                        className={`bg-gray-800 border-gray-700 ${selectedVideo && uploadState === 'waiting' ? 'border-opal-500/50 focus:border-opal-500' : ''}`}
                      />
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium mb-1" htmlFor="description">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter video description"
                        rows={3}
                        disabled={uploadState === 'uploading'}
                        className={`bg-gray-800 border-gray-700 ${selectedVideo && uploadState === 'waiting' ? 'border-opal-500/50 focus:border-opal-500' : ''}`}
                      />
                    </div>
                    
                    {/* <div>
                      <Label className="text-sm font-medium mb-1" htmlFor="tags">
                        <Tag size={16} className="inline mr-1" /> Tags
                      </Label>
                      <Input
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Enter tags, separated by commas"
                        disabled={uploadState === 'uploading'}
                        className="bg-gray-800 border-gray-700"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Example: tutorial, product, webinar
                      </p>
                    </div> */}
                    
                    <div>
                      <Label className="text-sm font-medium mb-1" htmlFor="thumbnail">
                        Thumbnail
                      </Label>
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        disabled={uploadState === 'uploading'}
                        className={`bg-gray-800 border-gray-700 ${selectedVideo && uploadState === 'waiting' ? 'border-opal-500/50 focus:border-opal-500' : ''}`}
                      />
                      {selectedThumbnail && (
                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-sm text-gray-400 truncate">{selectedThumbnail.name}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedThumbnail(null);
                              setThumbnailPreview(null);
                            }}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      )}
                      {thumbnailPreview && (
                        <div className="mt-3 border border-gray-700 rounded overflow-hidden">
                          <img 
                            src={thumbnailPreview} 
                            alt="Thumbnail preview" 
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                    </div>
                    
                    {/* <div>
                      <Label className="block text-sm font-medium mb-1" htmlFor="privacy">
                        <LinkIcon size={16} className="inline mr-1" /> Privacy
                      </Label>
                      <div className="flex space-x-4 mt-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={isPublic}
                            onChange={() => setIsPublic(true)}
                            className="accent-opal-500"
                            disabled={uploadState === 'uploading'}
                          />
                          <span>Public</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            checked={!isPublic}
                            onChange={() => setIsPublic(false)}
                            className="accent-opal-500"
                            disabled={uploadState === 'uploading'}
                          />
                          <span>Private</span>
                        </label>
                      </div>
                    </div> */}
                    
                    {/* Add a manual upload button when a file is selected but not yet uploaded */}
                    {selectedVideo && uploadState === 'waiting' && (
                      <Button 
                        onClick={() => handleUpload(selectedVideo)}
                        className="w-full bg-green-600 hover:bg-green-700 mt-6"
                        size="lg"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Start Upload
                      </Button>
                    )}
                    
                    {uploadState === 'complete' && (
                      <Button 
                        onClick={handlePublish}
                        className="w-full bg-opal-600 hover:bg-opal-700 mt-6"
                        disabled={!title.trim()}
                      >
                        Publish Video
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recent">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Recent Uploads</CardTitle>
                <CardDescription>
                  Your most recently uploaded videos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 text-opal-500 animate-spin" />
                  </div>
                ) : recentUploads.length > 0 ? (
                  <div className="space-y-4">
                    {recentUploads.map((video) => (
                      <div 
                        key={video._id || video.id} 
                        className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => navigate(`/dashboard/video/${video._id || video.id}`)}
                      >
                        <div className="w-32 h-18 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                          {video.thumbnailUrl ? (
                            <img 
                              src={video.thumbnailUrl} 
                              alt={video.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileVideo className="h-8 w-8 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{video.title}</h4>
                          <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                            <span>{formatDate(video.createdAt)}</span>
                            {video.views !== undefined && (
                              <span>{video.views} views</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileVideo className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-lg font-medium">No videos yet</h3>
                    <p className="text-gray-500 mt-1">
                      Upload your first video to get started
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
} 