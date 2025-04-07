import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getVideoById, type Video } from '@/services/adminService';
import { API_BASE_URL, getFullUrl } from '@/config/api';

export default function AdminVideoDetail() {
  const { id } = useParams<{ id: string }>();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        if (!id) return;
        const data = await getVideoById(id);
        setVideo(data);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch video details',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, toast]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!video) {
    return (
      <AdminLayout>
        <div className="text-center text-red-500 p-4">Video not found</div>
      </AdminLayout>
    );
  }

  const uploader = typeof video.userId === 'object' ? video.userId : { username: 'Unknown', email: 'Unknown' };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{video.title}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  className="w-full h-full rounded-lg shadow-lg"
                  controls
                  src={`${API_BASE_URL}/videos/${id}/stream`}
                  poster={video.thumbnail ? getFullUrl(video.thumbnail) : undefined}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Video Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="font-medium text-gray-500">Description</dt>
                  <dd className="mt-1">{video.description || 'No description'}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Uploaded By</dt>
                  <dd className="mt-1">{uploader.username} ({uploader.email})</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Upload Date</dt>
                  <dd className="mt-1">{new Date(video.createdAt).toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">File Size</dt>
                  <dd className="mt-1">{(video.fileSize / (1024 * 1024)).toFixed(2)} MB</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Views</dt>
                  <dd className="mt-1">{video.views}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">File Type</dt>
                  <dd className="mt-1">{video.mimeType}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
