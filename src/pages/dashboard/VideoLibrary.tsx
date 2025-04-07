import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL, getAuthHeaders, handleApiResponse, getFullUrl } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder, Video as VideoIcon, MoreVertical, Plus, Play, Upload, SortDesc, Filter, Eye, Clock } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import {
  createFolder,
  deleteFolder,
  fetchFolders,
} from "@/store/folders/folderThunk";
import { Video } from "@/types/videos";

interface FolderType {
  _id: string;
  name: string;
  parentFolderId: string | null;
}

// Define Redux state interfaces
interface WorkspaceState {
  currentWorkspace: {
    _id: string;
    name: string;
  } | null;
}

interface FoldersState {
  folders: FolderType[];
}

interface RootState {
  workspace: WorkspaceState;
  folders: FoldersState;
}

export default function VideoLibrary() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [sortOption, setSortOption] = useState<string>("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const currentWorkspace = useSelector(
    (state: RootState) => state.workspace.currentWorkspace
  );

  const folders = useSelector((state: RootState) => state.folders.folders);

  // Filter videos by search query
  const filteredVideos = videos.filter(video => 
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to sort videos based on selected option
  const getSortedVideos = () => {
    if (!filteredVideos.length) return [];
    
    const videosCopy = [...filteredVideos];
    
    switch(sortOption) {
      case "newest":
        return videosCopy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "oldest":
        return videosCopy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "mostViews":
        return videosCopy.sort((a, b) => (b.views || 0) - (a.views || 0));
      case "alphabetical":
        return videosCopy.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return videosCopy;
    }
  };

  // Get sorted videos
  const sortedVideos = getSortedVideos();

  useEffect(() => {
    if (currentWorkspace) {
      fetchFolderContents();
    }
  }, [currentWorkspace]);

  const fetchFolderContents = async () => {
    if (!currentWorkspace) {
      setLoading(false);
      return;
    }

    try {
      dispatch(fetchFolders(currentWorkspace._id));

      // Fetch all workspace videos instead of just root level
      const videosResponse = await fetch(
        `${API_BASE_URL}/videos/workspace/${currentWorkspace._id}`,
        { headers: getAuthHeaders() }
      );
      const videosData = await handleApiResponse(videosResponse);
      
      // Log detailed data about thumbnails
      console.log('Fetched videos:', videosData);
      videosData.forEach((video: Video) => {
        console.log(`Video ${video.title}:`, {
          thumbnail: video.thumbnail,
          thumbnailUrl: video.thumbnailUrl
        });
      });
      
      // Ensure the videos data includes thumbnailUrl
      setVideos(videosData);
    } catch (error) {
      console.error("Error loading library contents:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load library contents",
        variant: "destructive",
      });
      // Set empty arrays on error to prevent showing stale data
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    console.log("workspace --- ", typeof currentWorkspace?._id);
    try {
      if (!newFolderName.trim() || !currentWorkspace) return;

      dispatch(
        createFolder({ newFolderName, workspace_id: currentWorkspace._id })
      );
    } catch (error) {
      console.log("error while creating folder ---- ", error);
    } finally {
      setIsCreateFolderOpen(false);
      setNewFolderName('')
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this folder and all its contents?"
      )
    )
      return;
    try {
      dispatch(deleteFolder({ folderId }));
    } catch (error) {
      console.log("error while delete folder --- ", error);
    }
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-96">
  //       <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
  //     </div>
  //   );
  // }

  return (
    <DashboardLayout>
      {!currentWorkspace ? (
        <div className="flex flex-col items-center justify-center h-96">
          <h2 className="text-xl font-semibold mb-2">No Workspace Selected</h2>
          <p className="text-muted-foreground">
            Please select or create a workspace to view your videos.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Workspace Library</h1>
              <p className="text-muted-foreground">
                {currentWorkspace?.name} - {videos.length} videos available
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setIsCreateFolderOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            </div>
          </div>

          {/* Folders */}
          {folders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Folders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {folders.map((folder) => (
                    <Card
                      key={folder._id}
                      className="cursor-pointer"
                      onClick={() =>
                        navigate(`/dashboard/folder/${folder._id}`)
                      }
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Folder className="h-8 w-8 text-blue-500" />
                          <div>
                            <h3 className="font-medium">{folder.name}</h3>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()} // Prevent card click event
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click event
                                handleDeleteFolder(folder._id);
                              }}
                            >
                              Delete Folder
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>All Workspace Videos ({filteredVideos.length})</CardTitle>
                  {filteredVideos.length !== videos.length && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Showing {filteredVideos.length} of {videos.length} videos
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Input
                      placeholder="Search videos..."
                      className="w-[200px] pr-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-2"
                        onClick={() => setSearchQuery('')}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <SortDesc className="mr-2 h-4 w-4" />
                        Sort
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => setSortOption("newest")}
                        className={sortOption === "newest" ? "bg-gray-100" : ""}
                      >
                        Newest First
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setSortOption("oldest")}
                        className={sortOption === "oldest" ? "bg-gray-100" : ""}
                      >
                        Oldest First
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setSortOption("mostViews")}
                        className={sortOption === "mostViews" ? "bg-gray-100" : ""}
                      >
                        Most Views
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setSortOption("alphabetical")}
                        className={sortOption === "alphabetical" ? "bg-gray-100" : ""}
                      >
                        A-Z
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {sortedVideos.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sortedVideos.map((video) => (
                      <Card
                        key={video._id}
                        className="overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-opal-500/10 border-gray-800 bg-gray-900 hover:bg-gray-800/80"
                      >
                        <CardContent className="p-0">
                          <div
                            className="group relative aspect-video bg-gray-800 cursor-pointer overflow-hidden"
                            onClick={() =>
                              navigate(`/dashboard/video/${video._id}`)
                            }
                          >
                            {video.thumbnail || video.thumbnailUrl ? (
                              <>
                                {/* Add debugging info */}
                                {console.log(`Rendering thumbnail for ${video.title}:`, {
                                  thumbnailUrl: video.thumbnailUrl,
                                  thumbnail: video.thumbnail,
                                  fullUrl: video.thumbnail ? getFullUrl(video.thumbnail) : 'none'
                                })}
                                <img
                                  src={video.thumbnailUrl || (video.thumbnail ? getFullUrl(video.thumbnail) : '')}
                                  alt={video.title}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    // Fallback if thumbnail fails to load
                                    const target = e.target as HTMLImageElement;
                                    console.error('Thumbnail failed to load:', target.src);
                                    target.onerror = null; // Prevent infinite error loop
                                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiM0YjUwNjMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjI0IiBmaWxsPSIjZmZmZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBhbGlnbm1lbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gVGh1bWJuYWlsPC90ZXh0Pjwvc3ZnPg==';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                  <Play className="h-12 w-12 text-white" />
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <Play className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium truncate text-gray-100">{video.title}</h3>
                            <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                              <div className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                <span>{video.views} views</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    {searchQuery ? (
                      <>
                        <h3 className="text-lg font-medium">No videos found</h3>
                        <p className="text-gray-500 mt-2">
                          No videos match your search criteria
                        </p>
                        <Button 
                          className="mt-4" 
                          variant="outline" 
                          onClick={() => setSearchQuery('')}
                        >
                          Clear Search
                        </Button>
                      </>
                    ) : (
                      <>
                        <VideoIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium">No videos in this workspace</h3>
                        <p className="text-gray-500 mt-2">
                          Upload videos to get started
                        </p>
                        <Button className="mt-4" onClick={() => navigate("/dashboard/upload")}>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Video
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {!folders.length && !videos.length && (
            <Card>
              <CardContent className="p-8 text-center">
                <VideoIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium">Your workspace is empty</h3>
                <p className="text-gray-500 mt-2">
                  Upload videos or create folders to organize your content
                </p>
                <div className="flex items-center justify-center space-x-4 mt-6">
                  <Button onClick={() => setIsCreateFolderOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Folder
                  </Button>
                  <Button onClick={() => navigate("/dashboard/upload")}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Video
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create Folder Dialog */}
          <Dialog
            open={isCreateFolderOpen}
            onOpenChange={setIsCreateFolderOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name"
                  />
                </div>
                
                <Button onClick={handleCreateFolder} className="w-full">
                  Create Folder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </DashboardLayout>
  );
}
