import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoShare } from "@/components/video/VideoShare";
import { VideoEditor } from "@/components/video/VideoEditor";
import { VideoAnalytics } from "@/components/video/VideoAnalytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, Calendar, HardDrive, Share2, Pencil, BarChart, Sliders } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { API_BASE_URL, getFullUrl } from "@/config/api";
import { VideoSettings } from "@/models/VideoSettings";

interface Video {
  id: string;
  title: string;
  fileSize: number;
  url: string;
  createdAt: string;
  views: number;
  description?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  settings?: VideoSettings;
}

export default function VideoDetail() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showEditorDialog, setShowEditorDialog] = useState(false);
  const [editorInitialTab, setEditorInitialTab] = useState("details");
  const [activeTab, setActiveTab] = useState("details");
  const [playerKey, setPlayerKey] = useState(Date.now()); // Force player to re-render when settings change

  console.log('videoId --- ',videoId)

  useEffect(() => {
    const fetchVideo = async () => {
      console.log('fetch url ----- ',`${API_BASE_URL}/videos/${videoId}`)
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/videos/${videoId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        console.log('response', response)

        if (!response.ok) {
          throw new Error("Video not found");
        }

        const data = await response.json();
        setVideo({
          ...data,
          id: data._id, // Map _id to id for frontend consistency
        });
      } catch (error) {
        console.error("Error fetching video:", error);
        setError("Video not found");
      }
    };

    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  const handleVideoEdited = async () => {
    // Refetch the video data to update the UI
    if (videoId) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/videos/${videoId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Video not found");
        }

        const data = await response.json();
        setVideo({
          ...data,
          id: data._id,
        });
        
        // Force player to re-render with new settings
        setPlayerKey(Date.now());
      } catch (error) {
        console.error("Error fetching video:", error);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard/videos")}
            className="text-gray-400 hover:text-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Folder
          </Button>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-12 text-center">
              <h2 className="text-xl font-semibold text-red-500">{error}</h2>
              <p className="text-gray-500 mt-2">
                The video you're looking for might have been deleted or doesn't
                exist.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!video) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-32 bg-gray-800 rounded" />
          <div className="aspect-video bg-gray-800 rounded-lg" />
          <div className="space-y-4">
            <div className="h-8 w-64 bg-gray-800 rounded" />
            <div className="h-4 w-full bg-gray-800 rounded" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>

          <div className="flex items-center space-x-2">
            <Badge
              variant="secondary"
              className="bg-purple-500/20 text-purple-500"
            >
              MP4
            </Badge>
            <Button
              variant="outline"
              onClick={() => setShowShareDialog(!showShareDialog)}
              className="bg-purple-500/20 text-purple-500 border-purple-500/20 hover:bg-purple-500/30"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditorInitialTab("details");
                setShowEditorDialog(true);
              }}
              className="bg-blue-500/20 text-blue-500 border-blue-500/20 hover:bg-blue-500/30"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setEditorInitialTab("appearance");
                setShowEditorDialog(true);
              }}
              className="bg-purple-500/20 text-purple-500 border-purple-500/20 hover:bg-purple-500/30"
            >
              <Sliders className="mr-2 h-4 w-4" />
              Player Settings
            </Button>
          </div>
        </div>

        {/* Video Player */}
        <div className="aspect-video relative overflow-hidden rounded-lg">
          {video ? (
            <VideoPlayer
              key={playerKey}
              videoId={video.id}
              src={`${API_BASE_URL}/videos/${video.id}/stream`}
              title={video.title}
              thumbnailUrl={video.thumbnailUrl || video.thumbnail}
              posterUrl={video.thumbnail ? getFullUrl(video.thumbnail) : undefined}
              autoPlay={video.settings?.autoPlay || false}
              primaryColor={video.settings?.playerColor || "#F59E0B"}
              secondaryColor={video.settings?.secondaryColor || "#EF4444"}
              callToAction={video.settings?.callToAction}
              className="w-full"
              trackAnalytics={true}
              onError={(error) => setError(error)}
              controls={true}
            />
          ) : (
            <div className="bg-gray-800 w-full h-full flex items-center justify-center">
              <p className="text-gray-400">Loading video...</p>
            </div>
          )}
        </div>

        {showShareDialog && (
          <VideoShare
            videoId={video.id}
            videoUrl={video.url}
            title={video.title}
          />
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className="flex items-center justify-center">
              <HardDrive className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center justify-center">
              <BarChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="pt-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>{video.title}</CardTitle>
                {video.description && (
                  <p className="text-gray-400 text-sm mt-2">{video.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-purple-500/20 p-2">
                      <Calendar className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Upload Date</div>
                      <div className="font-medium">
                        {formatDate(video.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-pink-500/20 p-2">
                      <Clock className="h-5 w-5 text-pink-500" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Views</div>
                      <div className="font-medium">
                        {video.views} views
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-blue-500/20 p-2">
                      <HardDrive className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">File Size</div>
                      <div className="font-medium">
                        {formatFileSize(video.fileSize)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="pt-6">
            <VideoAnalytics videoId={video.id} />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Video Editor Dialog */}
      {showEditorDialog && (
        <VideoEditor
          videoId={video.id}
          initialData={{
            title: video.title,
            description: video.description,
            thumbnail: video.thumbnail,
            thumbnailUrl: video.thumbnailUrl,
            settings: video.settings,
          }}
          initialTab={editorInitialTab}
          open={showEditorDialog}
          onOpenChange={setShowEditorDialog}
          onSave={handleVideoEdited}
        />
      )}
    </DashboardLayout>
  );
}
