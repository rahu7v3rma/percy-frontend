import { VideoPlayer } from '@/components/video/VideoPlayer';
import { API_BASE_URL } from '@/config/api';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { VideoPlayer } from '@/components/VideoPlayer';

interface Video {
  id: string;
  _id: string;
  title: string;
  thumbnail?: string;
  thumbnailUrl?: string;
}

export default function VideoEmbed() {
  const { videoId } = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/videos/${videoId}`);
        
        if (!response.ok) {
          throw new Error('Video not found');
        }
        
        const data = await response.json();
        setVideo({
          ...data,
          id: data._id
        });
      } catch (error) {
        console.error('Error fetching video:', error);
        setError('Video not found');
      }
    };

    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-400">
        {error}
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-950">
      <VideoPlayer
        videoId={video.id}
        src={`${API_BASE_URL}/videos/${video.id}/stream`}
        title={video.title}
        autoPlay={false}
        controls={true}
        className="w-full h-full"
        onError={(error) => setError(error)}
        primaryColor="#9333EA"
        secondaryColor="#E11D48"
        thumbnailUrl={video.thumbnailUrl || video.thumbnail}
        posterUrl={video.thumbnail}
      />
    </div>
  );
}
