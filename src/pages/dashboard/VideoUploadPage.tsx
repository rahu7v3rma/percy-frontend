import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Upload, FileVideo, Info, Clock } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { VideoUpload } from '@/components/video/VideoUpload';
import { API_BASE_URL, makeApiRequest } from '@/config/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";

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

export default function VideoUploadPage() {
  const { folderId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const { currentWorkspace } = useWorkspaces();
  const [activeTab, setActiveTab] = useState("upload");
  const [recentUploads, setRecentUploads] = useState<RecentVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleUpload = async (videoFile: File, thumbnailFile: File | null, onProgress: (progress: number) => void): Promise<void> => {
    try {
      // Validate title is not empty
      if (!title.trim()) {
        // Keep showing the upload component while displaying the error
        setErrorMessage('Please enter a video title');
        // Return instead of throwing an error to prevent clearing the form
        return;
      }

      // Check file size - prevent uploads that exceed backend limit
      const MAX_ALLOWED_SIZE = 500 * 1024 * 1024; // 500MB
      if (videoFile.size > MAX_ALLOWED_SIZE) {
        setErrorMessage(`File size (${(videoFile.size / (1024 * 1024)).toFixed(2)} MB) exceeds the maximum allowed size of 500 MB. Please select a smaller file.`);
        return;
      }

      // Ensure workspace is selected
      if (!currentWorkspace || !currentWorkspace._id) {
        // Keep showing the upload component while displaying the error
        setErrorMessage('No workspace selected. Please select a workspace first.');
        // Return instead of throwing an error to prevent clearing the form
        return;
      }

      setUploadStatus('uploading');
      setErrorMessage('');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('folderId', folderId || '');
      formData.append('video', videoFile);
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
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
          onProgress(progress);
        }
      };

      xhr.onload = function () {
        if (xhr.status === 201) {
          setUploadStatus('success');
          const response = JSON.parse(xhr.responseText);
          setTimeout(() => {
            navigate(`/dashboard/video/${response._id || response.id}`);
          }, 1500);
        } else {
          setUploadStatus('error');
          setErrorMessage('Upload failed. Please try again.');
          onProgress(0);
        }
      };

      xhr.onerror = function () {
        setUploadStatus('error');
        setErrorMessage('Network error occurred. Please check your internet connection and try again.');
        onProgress(0);
      };

      xhr.send(formData);
    } catch (error) {
      setUploadStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrorMessage(errorMsg);
      throw error;
    }
  };

  const handleUploadSuccess = () => {
    setUploadStatus('success');
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
              onClick={() => navigate(`/dashboard/enhanced-upload${folderId ? `/${folderId}` : ''}`)}
              className="text-sm flex items-center gap-1"
            >
              <span className="bg-opal-500/20 text-opal-400 rounded-full p-0.5">
                <FileVideo className="h-3.5 w-3.5" />
              </span>
              Try Enhanced Uploader
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-6 w-64">
            <TabsTrigger value="upload">Upload Video</TabsTrigger>
            <TabsTrigger value="recent">Recent Uploads</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
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
                  <CardContent className="space-y-6">
                    {uploadStatus === 'uploading' && (
                      <div className="bg-gray-800/50 rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-medium text-white">Uploading Video...</h3>
                          <span className="text-opal-400 font-medium">{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="w-full h-2" />
                        <p className="text-gray-400 text-sm">Please don't close this window until the upload completes</p>
                      </div>
                    )}

                    {uploadStatus !== 'uploading' && (
                      <VideoUpload
                        onUpload={handleUpload}
                        onSuccess={handleUploadSuccess}
                        onError={setErrorMessage}
                      />
                    )}
                    
                    {errorMessage && uploadStatus !== 'success' && (
                      <Alert className="bg-red-900/20 text-red-400 border-red-900/30">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {errorMessage}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {uploadStatus === 'success' && (
                      <Alert className="bg-green-900/20 text-green-400 border-green-900/30">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          Video uploaded successfully! Redirecting to video details...
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle>Video Details</CardTitle>
                    <CardDescription>Add information about your video</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                        <Input
                          id="title"
                          placeholder="Enter video title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="bg-gray-800 border-gray-700 focus:border-opal-500 focus:ring-opal-500/20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Enter video description (optional)"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="bg-gray-800 border-gray-700 focus:border-opal-500 focus:ring-opal-500/20 min-h-[120px]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-opal-400" />
                      Upload Guidelines
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-gray-400">
                      <li className="flex items-start gap-2">
                        <div className="min-w-4 min-h-4 rounded-full bg-opal-500/20 p-0.5 mt-0.5">
                          <div className="w-3 h-3 rounded-full bg-opal-500"></div>
                        </div>
                        <span>Only MP4 format is supported</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="min-w-4 min-h-4 rounded-full bg-opal-500/20 p-0.5 mt-0.5">
                          <div className="w-3 h-3 rounded-full bg-opal-500"></div>
                        </div>
                        <span>Maximum file size is 500MB</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="min-w-4 min-h-4 rounded-full bg-opal-500/20 p-0.5 mt-0.5">
                          <div className="w-3 h-3 rounded-full bg-opal-500"></div>
                        </div>
                        <span>Thumbnails should be JPG or PNG format</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="min-w-4 min-h-4 rounded-full bg-opal-500/20 p-0.5 mt-0.5">
                          <div className="w-3 h-3 rounded-full bg-opal-500"></div>
                        </div>
                        <span>Ensure stable internet connection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="min-w-4 min-h-4 rounded-full bg-opal-500/20 p-0.5 mt-0.5">
                          <div className="w-3 h-3 rounded-full bg-opal-500"></div>
                        </div>
                        <span>Video title should be descriptive</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="min-w-4 min-h-4 rounded-full bg-opal-500/20 p-0.5 mt-0.5">
                          <div className="w-3 h-3 rounded-full bg-opal-500"></div>
                        </div>
                        <span>Avoid uploading copyrighted content</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-opal-400" />
                      After Upload
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm text-gray-400">
                      <p>Once your video is uploaded, you'll be able to:</p>
                      <ul className="space-y-2 list-disc list-inside">
                        <li>Customize player appearance</li>
                        <li>Add call-to-action elements</li>
                        <li>Generate sharing links</li>
                        <li>Access detailed analytics</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Recently Uploaded Videos</CardTitle>
                <CardDescription>Your 5 most recent uploads</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="bg-gray-800 h-16 w-28 rounded"></div>
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-800 rounded w-2/3"></div>
                          <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentUploads.length > 0 ? (
                  <div className="space-y-3">
                    {recentUploads.map((video) => (
                      <div 
                        key={video.id || video._id} 
                        className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => navigate(`/dashboard/video/${video.id || video._id}`)}
                      >
                        <div className="rounded overflow-hidden h-16 w-28 bg-gray-800 flex-shrink-0">
                          {video.thumbnailUrl ? (
                            <img 
                              src={video.thumbnailUrl} 
                              alt={video.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full bg-gray-800">
                              <FileVideo className="h-6 w-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">{video.title}</h4>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span>{formatDate(video.createdAt)}</span>
                            <span className="mx-2">•</span>
                            <span>{video.views || 0} views</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileVideo className="h-12 w-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500">No videos uploaded yet</p>
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