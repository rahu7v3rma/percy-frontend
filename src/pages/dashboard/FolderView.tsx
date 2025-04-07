import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Folder,
  Video,
  ArrowLeft,
  MoreVertical,
  Play,
  Upload,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { API_BASE_URL } from "@/config/api";
import { Link } from "react-router-dom";
import VideoList from "@/components/video/VideoList";
import { useDispatch, useSelector } from "react-redux";
import { fetchFolderContent } from "@/store/folders/folderThunk";

interface FolderContent {
  folders: {
    _id: string;
    name: string;
    parentFolderId: string | null;
  }[];
  videos: {
    _id: string;
    title: string;
    thumbnail: string;
    duration: number;
    views: number;
    createdAt: string;
  }[];
}

export default function FolderView() {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  // const [content, setContent] = useState<FolderContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentWorkspace = useSelector(
    (state: any) => state.workspace.currentWorkspace
  );
  const content = useSelector((state: any) => state.folders.folderContent);

  console.log("content ----- ", content);

  useEffect(() => {
    if (!currentWorkspace || !folderId) return;
    getFolderData();
  }, [currentWorkspace, folderId]);
  console.log("content");
  const getFolderData = async () => {
    try {
      let tempFolderId = folderId;
      dispatch(fetchFolderContent(folderId));
      // setContent(data);
    } catch (error) {
      console.log("folder view error --- ", error);
      toast({
        title: "Error",
        description: "Failed to load folder contents",
        variant: "destructive",
      });
      setError("Failed to load videos");
    } finally {
      setLoading(false);
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
      const response = await fetch(`/api/folders/${folderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) throw new Error("Failed to delete folder");

      toast({
        title: "Success",
        description: "Folder deleted successfully",
      });
      fetchFolderContent();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete folder",
        variant: "destructive",
      });
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
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Videos</h1>
              {/* <p className="text-muted-foreground">
              {currentWorkspace?.name ||
                "Select a workspace to view your videos"}
            </p> */}
            </div>
            <div className="flex items-center space-x-2">
              {/* <Button onClick={() => setIsCreateFolderOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Folder
            </Button> */}
              <Button
                className="bg-gradient-to-r from-opal-500 to-opal-700 hover:from-opal-600 hover:to-opal-800"
                asChild
              >
                <Link to="/dashboard/enhanced-upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Video
                </Link>
              </Button>
            </div>
          </div>

          {/* Subfolders */}
          {/* {content?.folders?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Folders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {content.folders.map((folder) => (
                  <Card
                    key={folder._id}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div
                        className="flex items-center space-x-4"
                        onClick={() =>
                          navigate(`/dashboard/folder/${folder._id}`)
                        }
                      >
                        <Folder className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-medium">{folder.name}</h3>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteFolder(folder._id)}
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
        )} */}

          {/* Videos */}
          {content?.videos?.length > 0 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Folder Contents</CardTitle>
              </CardHeader>
              <CardContent>
                <VideoList
                  videoList={content.videos}
                  loading={loading}
                  error={error}
                />
              </CardContent>
            </Card>
          )}
          {!content?.folders?.length && !content?.videos?.length && (
            <Card>
              <CardContent className="p-8 text-center">
                <Folder className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium">This folder is empty</h3>
                <p className="text-gray-500 mt-2">
                  Upload videos to your folder
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
