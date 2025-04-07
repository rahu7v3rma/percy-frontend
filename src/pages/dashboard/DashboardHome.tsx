import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import VideoList from "@/components/video/VideoList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Upload,
  Users,
  Clock,
  TrendingUp,
  Eye,
  Share2,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRecentVideos } from "@/store/dashboard/dashboardThunk";

// Import Video type from VideoList interface
interface Video {
  _id: string;
  title: string;
  fileSize: number;
  url: string;
  createdAt: string;
  views: number;
  description?: string;
  thumbnail?: string;
}

// Define the root state structure
interface RootState {
  dashboard: {
    recentVideos: Video[];
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, description, icon }: StatCardProps) => (
  <Card className="bg-gray-900 border-gray-800">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-400">
        {title}
      </CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-100">{value}</div>
      <p className="text-xs text-gray-500">{description}</p>
    </CardContent>
  </Card>
);

export default function DashboardHome() {
  const dispatch = useDispatch();
  // const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const videos = useSelector((state: RootState) => state.dashboard.recentVideos);

  console.log("videos --- ", videos);

  useEffect(() => {
    document.title = "Dashboard | Percy";
  }, []);

  useEffect(() => {
    // const fetchVideos = async () => {
    //   try {
    //     const token = localStorage.getItem("token");
    //       headers: {
    //         Authorization: `Bearer ${token}`,
    //         "Content-Type": "application/json",
    //       },
    //       credentials: "same-origin",
    //     });

    //     if (!response.ok) {
    //       throw new Error("Failed to fetch videos");
    //     }

    //     const data = await response.json();
    //     setVideos(data);
    //     setLoading(false);
    //   } catch (error) {
    //     console.error("Error fetching videos:", error);
    //     setError("Failed to load videos");
    //     setLoading(false);
    //   }
    // };
    getDashboardData();
  }, []);

  const getDashboardData = () => {
    try {
      dispatch(fetchRecentVideos());
    } catch (error) {
      console.log('error while fetching reccent videos')
    } finally {
      setLoading(false);
    }
  };

  // This would typically come from your API/state management
  const stats = {
    totalViews: "10.2K",
    totalVideos: "156",
    avgWatchTime: "4:32",
    engagement: "24%",
  };

  const recentActivity = [
    {
      type: "view",
      message: 'Your video "Getting Started with React" received 100 new views',
      time: "2 hours ago",
    },
    {
      type: "share",
      message: 'Someone shared your video "Advanced TypeScript Tips"',
      time: "4 hours ago",
    },
    {
      type: "trending",
      message: 'Your channel is trending in "Technology" category',
      time: "1 day ago",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "view":
        return <Eye className="h-4 w-4 text-blue-500" />;
      case "share":
        return <Share2 className="h-4 w-4 text-green-500" />;
      case "trending":
        return <TrendingUp className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          <Button
            className="bg-gradient-to-r from-opal-500 to-opal-700 hover:from-opal-600 hover:to-opal-800"
            asChild
          >
            <Link to="/dashboard/enhanced-upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Video
            </Link>
          </Button>
          <Button
            variant="outline"
            className="border-gray-700 hover:bg-gray-800"
            asChild
          >
            <Link to="/dashboard/videos">
              <Eye className="mr-2 h-4 w-4" />
              Browse Library
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Views"
            value={stats.totalViews}
            description="Total video views across all content"
            icon={<Eye className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Total Videos"
            value={stats.totalVideos}
            description="Videos in your library"
            icon={<BarChart className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Avg. Watch Time"
            value={stats.avgWatchTime}
            description="Average viewing duration"
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Engagement Rate"
            value={stats.engagement}
            description="Likes and comments ratio"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
        </div> */}

        {/* Recent Videos */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Recent Videos</CardTitle>
            {/* <Button
              variant="ghost"
              className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
              asChild
            >
              <Link to="/dashboard/library">View All</Link>
            </Button> */}
          </CardHeader>
          <CardContent>
            <VideoList videoList={videos} loading={loading} error={error} />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        {/* <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none text-gray-200">
                      {activity.message}
                    </p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card> */}
      </div>
    </DashboardLayout>
  );
}
