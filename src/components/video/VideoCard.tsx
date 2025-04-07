import { useDispatch, useSelector } from 'react-redux';
import { deleteVideo, incrementViews } from '../../store/slices/videoSlice';
import type { AppDispatch, RootState } from '../../store';
import { getFullUrl } from '@/config/api';

interface Video {
  _id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  thumbnailUrl?: string;
  views: number;
  userId: string;
  createdAt: string;
}

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const isOwner = user?._id === video.userId;

  const handlePlay = () => {
    dispatch(incrementViews(video._id));
    window.open(video.url, '_blank');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      await dispatch(deleteVideo(video._id));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={video.thumbnailUrl || getFullUrl(video.thumbnail)}
        alt={video.title}
        className="w-full h-48 object-cover cursor-pointer bg-gray-900"
        onClick={handlePlay}
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
        <p className="text-gray-600 mb-2 line-clamp-2">{video.description}</p>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{video.views} views</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
          >
            Delete Video
          </button>
        )}
      </div>
    </div>
  );
}
