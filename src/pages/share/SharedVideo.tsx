import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
// import { VideoPlayer } from '@/components/VideoPlayer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VideoPlayer } from '@/components/video/VideoPlayer';
interface SharedVideoState {
  status: 'loading' | 'requires_email' | 'ready' | 'expired' | 'not_found';
  video?: any;
  error?: string;
}

export default function SharedVideo() {
  const { videoId } = useParams();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<SharedVideoState>({ status: 'loading' });
  const [email, setEmail] = useState('');

  useEffect(() => {
    checkAccess();
  }, [videoId]);

  const checkAccess = async () => {
    try {
      // In a real app, validate with backend
      const videos = JSON.parse(localStorage.getItem('uploadedVideos') || '[]');
      const video = videos.find((v: any) => v.id === videoId);

      if (!video) {
        setState({ status: 'not_found' });
        return;
      }

      const expires = searchParams.get('expires');
      const requiresEmail = searchParams.get('auth') === '1';

      if (expires && Number(expires) < Date.now()) {
        setState({ status: 'expired' });
        return;
      }

      if (requiresEmail && !localStorage.getItem(`video_${videoId}_email`)) {
        setState({ status: 'requires_email', video });
        return;
      }

      setState({ status: 'ready', video });
    } catch (error) {
      console.error('Error checking access:', error);
      setState({ status: 'not_found', error: 'Failed to load video' });
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // In a real app, validate email with backend
      localStorage.setItem(`video_${videoId}_email`, email);
      setState(prev => ({ ...prev, status: 'ready' }));
      
      // Log video view
      const viewData = {
        videoId,
        email,
        timestamp: new Date().toISOString(),
      };
      const views = JSON.parse(localStorage.getItem('video_views') || '[]');
      views.push(viewData);
      localStorage.setItem('video_views', JSON.stringify(views));
    } catch (error) {
      console.error('Error submitting email:', error);
    }
  };

  if (state.status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (state.status === 'not_found') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-red-500">Video Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              This video may have been removed or the link is invalid.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state.status === 'expired') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-red-500">Link Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              This sharing link has expired. Please request a new link from the video owner.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state.status === 'requires_email') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <Card className="w-full max-w-md bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Enter Your Email to Watch</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                Watch Video
              </Button>
              <p className="text-sm text-gray-400">
                Your email is required by the video owner to track viewership.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>{state.video.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video">
              <VideoPlayer
                src={state.video.url}
                title={state.video.name}
                autoPlay={false}
                controls={true}
                className="w-full h-full rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
