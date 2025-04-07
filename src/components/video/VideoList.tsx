import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Play, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDispatch } from "react-redux";
import { deleteVideo } from "@/store/folders/folderThunk";
import { API_BASE_URL, API_URL, getFullUrl } from "@/config/api";

interface Video {
  _id: string;
  title: string;
  fileSize: number;
  url: string;
  createdAt: string;
  views: number;
  description?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
}

interface VideoListProps {
  videoList: Video[];
  loading: boolean;
  error: string | null;
}

export default function VideoList({ videoList, loading, error }: VideoListProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Ensure videoList is an array
    if (videoList && Array.isArray(videoList)) {
      setVideos(videoList);
    } else {
      console.error("videoList is not an array:", videoList);
      setVideos([]);
    }
  }, [videoList]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDelete = async (videoId: string) => {
    try {
      // const token = localStorage.getItem("token");
      // const response = await fetch(
      //   `${API_BASE_URL}/videos/${videoId}`,
      //   {
      //     method: "DELETE",
      //     headers: {
      //       Authorization: `Bearer ${token}`,
      //       "Content-Type": "application/json",
      //     },
      //     credentials: "same-origin",
      //   }
      // );

      dispatch(deleteVideo({videoId}))
      // dispatch(deleteVideo({videoId}))

      setVideos(videos.filter((video) => video._id !== videoId));
    } catch (error) {
      console.error("Error deleting video:", error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-gray-900 border-gray-800">
            <CardContent className="p-0">
              <div className="aspect-video bg-gray-800 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-800 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-800 rounded w-1/2" />
                  <div className="h-3 bg-gray-800 rounded w-1/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6 text-center text-red-500">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (videos.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-gray-800 p-4">
              <Play className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold">No videos yet</h3>
            <p className="text-gray-500">No recent videos to display</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.isArray(videos) && videos.length > 0 ? videos.slice(0, 6).map((video) => (
        <Card key={video._id} className="bg-gray-900 border-gray-800">
          <CardContent className="p-0">
            <div
              className="aspect-video bg-gray-800 relative group cursor-pointer"
              onClick={() => navigate(`/dashboard/video/${video._id}`)}
            >
              {video.thumbnail || video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl || getFullUrl(video.thumbnail)}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={`${API_BASE_URL}/videos/${video._id}/stream`}
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                >
                  <Play className="h-8 w-8" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="truncate mr-4">
                  <h3
                    className="font-medium truncate cursor-pointer hover:text-purple-400"
                    onClick={() => navigate(`/dashboard/video/${video._id}`)}
                  >
                    {video.title}
                  </h3>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>{formatFileSize(video.fileSize)}</p>
                    <p>{new Date(video.createdAt).toLocaleDateString()}</p>
                    <p>{video.views} views</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-gray-900 border-gray-800"
                  >
                    <DropdownMenuLabel className="text-gray-400">
                      Actions
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem
                      className="text-gray-300 focus:bg-gray-800 focus:text-gray-100"
                      onClick={() => navigate(`/dashboard/video/${video._id}`)}
                    >
                      View Video
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-500 focus:bg-gray-800 focus:text-red-400"
                      onClick={() => handleDelete(video._id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      )) : (
        <Card className="bg-gray-900 border-gray-800 col-span-3">
          <CardContent className="p-6 text-center">
            <p>No videos available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
