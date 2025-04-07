import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/config/api';

interface SharedVideo {
  _id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
}

export default function VideoShare() {
  const { id } = useParams<{ id: string }>();

  console.log('token ------- ',id)
  const [searchParams] = useSearchParams();
  const [video, setVideo] = useState<SharedVideo | null>(null);
  const [email, setEmail] = useState('');
  const [requireEmail, setRequireEmail] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVideo = async (emailParam?: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/share/${id}${emailParam ? `?email=${emailParam}` : ''}`
      );
      const data: SharedVideo | { requireEmail: boolean; error: string } = await response.json();

      if (!response.ok) {
        if ('requireEmail' in data && data.requireEmail) {
          setRequireEmail(true);
          setError(null);
          return;
        }
        throw new Error('error' in data ? data.error : 'Failed to load video');
      }

      if ('_id' in data) {
        setVideo(data);
        setError(null);
      } else {
        throw new Error('Invalid video data received');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load video';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      fetchVideo(emailParam);
    } else {
      fetchVideo();
    }
  }, [id, searchParams]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email',
        variant: 'destructive',
      });
      return;
    }
    fetchVideo(email);
  };

  const handleError = (error: string) => {
    setError(error);
    toast({
      title: 'Error',
      description: error,
      variant: 'destructive',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (requireEmail && !video) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 bg-gray-900 p-6 rounded-lg border border-gray-800">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white">Email Required</h2>
            <p className="mt-2 text-gray-400">
              Please enter your email to view this video
            </p>
          </div>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 border-gray-700"
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              Continue to Video
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-500">{error}</h2>
          <p className="text-gray-400">
            The video might have been removed or the share link has expired.
          </p>
        </div>
      </div>
    );
  }

  if (!video) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-white">{video.title}</h1>
        
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <VideoPlayer
            videoId={video._id}
            src={`${API_BASE_URL}/videos/${video._id}/stream`}
            title={video.title}
            thumbnailUrl={video.thumbnail}
            onError={handleError}
            primaryColor="#9333EA"
            secondaryColor="#E11D48"
            controls={true}
            className="w-full h-full"
          />
        </div>

        {video.description && (
          <p className="text-gray-400 mt-4">{video.description}</p>
        )}
      </div>
    </div>
  );
}
