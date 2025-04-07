import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  ExternalLink,
  Minimize2,
  Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { API_BASE_URL, API_URL, getFullUrl } from "@/config/api";
import { Button } from "@/components/ui/button";
import { CallToAction } from "@/models/VideoSettings";
import { v4 as uuidv4 } from 'uuid';
import { HTMLAttributes } from "react";

interface Shortcut {
  key: string;
  description: string;
}

interface VideoPlayerProps {
  src: string;
  title?: string;
  thumbnailUrl?: string;
  isPlaying?: boolean;
  onPlaybackChange?: (isPlaying: boolean) => void;
  onEnded?: () => void;
  isTheaterMode?: boolean;
  isMiniPlayer?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  callToAction?: CallToAction;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  posterUrl?: string;
  onDurationChange?: (duration: number) => void;
  startTime?: number;
  className?: string;
  videoId?: string;
  trackAnalytics?: boolean;
  onError?: (error: string) => void;
  controls?: boolean;
}

export const VideoPlayer = ({
  src,
  title,
  thumbnailUrl,
  isPlaying: externalIsPlaying,
  onPlaybackChange,
  onEnded,
  isTheaterMode: initialTheaterMode = false,
  isMiniPlayer: initialMiniPlayer = false,
  primaryColor = "#F59E0B", // Default to amber color
  secondaryColor = "#EF4444", // Default to red color
  callToAction,
  autoPlay = false,
  muted = false,
  loop = false,
  posterUrl,
  className,
  onDurationChange,
  startTime = 0,
  videoId,
  trackAnalytics = false,
  onError,
  controls = true,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef<string>(uuidv4());
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(autoPlay || false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showCaptions, setShowCaptions] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(initialTheaterMode);
  const [isMiniPlayer, setIsMiniPlayer] = useState(initialMiniPlayer);
  
  // Analytics and CTA state
  const [showCTA, setShowCTA] = useState(false);
  const [quartersWatched, setQuartersWatched] = useState<number[]>([]);
  const [analyticsPositions, setAnalyticsPositions] = useState<{position: number, timestamp: number}[]>([]);
  const [videoEnded, setVideoEnded] = useState(false);

  const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const shortcuts: Shortcut[] = [
    { key: "k", description: "Play/Pause" },
    { key: "Space", description: "Play/Pause" },
    { key: "j", description: "Rewind 10 seconds" },
    { key: "l", description: "Forward 10 seconds" },
    { key: "←", description: "Rewind 5 seconds" },
    { key: "→", description: "Forward 5 seconds" },
    { key: "↑", description: "Increase volume 5%" },
    { key: "↓", description: "Decrease volume 5%" },
    { key: "m", description: "Mute/Unmute" },
    { key: "f", description: "Toggle fullscreen" },
    { key: "t", description: "Theater mode" },
    { key: "i", description: "Mini player" },
    { key: "c", description: "Toggle captions" },
    { key: "<", description: "Previous frame (while paused)" },
    { key: ">", description: "Next frame (while paused)" },
    { key: "0", description: "Go to start of video" },
    { key: "1-9", description: "Go to 10-90% of video" },
    { key: "/", description: "Focus on search" },
    { key: "?", description: "Show keyboard shortcuts" },
    { key: ".", description: "Increase speed" },
    { key: ",", description: "Decrease speed" },
  ];

  // Use a function to determine the correct poster URL
  const getPosterUrl = useCallback(() => {
    if (thumbnailUrl) {
      return thumbnailUrl;
    } else if (posterUrl) {
      return posterUrl;
    }
    return '';
  }, [thumbnailUrl, posterUrl]);

  // Video control functions
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play().catch(err => {
        console.error("Could not play video:", err);
        onError?.(err.message);
      });
    } else {
      video.pause();
    }
    
    setIsPlaying(!video.paused);
    onPlaybackChange?.(!video.paused);
  }, [onError, onPlaybackChange]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    // Ensure time is within valid range
    const seekTime = Math.max(0, Math.min(time, duration));
    
    // Set the current time in the video element
    video.currentTime = seekTime;
    
    // Update state immediately for responsive UI
    setCurrentTime(seekTime);
  }, [duration]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const skipForward = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.min(video.currentTime + 10, duration);
  }, [duration]);

  const skipBackward = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(video.currentTime - 10, 0);
  }, []);

  const formatTime = useCallback((time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Keyboard controls handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Debugging: Log the key pressed to verify the event listener is working
      console.log("Key pressed:", event.key);

      // Don't handle keyboard events if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      // Don't prevent default for '/' key to allow search functionality
      if (event.key !== "/") {
        event.preventDefault(); // Prevent default for all other video controls
      }

      switch (event.key.toLowerCase()) {
        case "k":
        case " ":
          event.preventDefault();
          togglePlay();
          break;
        case "j":
          event.preventDefault();
          video.currentTime = Math.max(video.currentTime - 10, 0);
          break;
        case "l":
          event.preventDefault();
          video.currentTime = Math.min(video.currentTime + 10, video.duration);
          break;
        case "arrowleft":
          event.preventDefault();
          video.currentTime = Math.max(video.currentTime - 5, 0);
          break;
        case "arrowright":
          event.preventDefault();
          video.currentTime = Math.min(video.currentTime + 5, video.duration);
          break;
        case "arrowup": {
          const newVolumeUp = Math.min(volume + 0.05, 1);
          event.preventDefault();
          handleVolumeChange(newVolumeUp);
          break;
        }
        case "arrowdown": {
          const newVolumeDown = Math.max(volume - 0.05, 0);
          event.preventDefault();
          handleVolumeChange(newVolumeDown);
          break;
        }
        case "m":
          event.preventDefault();
          toggleMute();
          break;
        case "f":
          event.preventDefault();
          toggleFullscreen();
          break;
        case "t":
          event.preventDefault();
          setIsTheaterMode((prev) => !prev);
          break;
        case "i":
          event.preventDefault();
          setIsMiniPlayer((prev) => !prev);
          break;
        case "c":
          event.preventDefault();
          setShowCaptions((prev) => !prev);
          break;
        case ",": {
          const prevIndex = playbackSpeeds.indexOf(playbackSpeed) - 1;
          if (prevIndex >= 0) {
            const newSpeed = playbackSpeeds[prevIndex];
            event.preventDefault();
            video.playbackRate = newSpeed;
            setPlaybackSpeed(newSpeed);
          }
          break;
        }
        case ".": {
          const nextIndex = playbackSpeeds.indexOf(playbackSpeed) + 1;
          if (nextIndex < playbackSpeeds.length) {
            const newSpeed = playbackSpeeds[nextIndex];
            event.preventDefault();
            video.playbackRate = newSpeed;
            setPlaybackSpeed(newSpeed);
          }
          break;
        }
        case "?":
          event.preventDefault();
          setShowShortcuts((prev) => !prev);
          break;
        case "0":
          event.preventDefault();
          video.currentTime = 0;
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9": {
          const percent = parseInt(event.key) * 10;
          event.preventDefault();
          video.currentTime = (video.duration * percent) / 100;
          break;
        }
        default:
          break;
      }
    },
    [
      volume,
      playbackSpeed,
      togglePlay,
      toggleMute,
      toggleFullscreen,
      handleVolumeChange,
    ]
  );

  // Track video analytics
  const trackPlaybackPosition = useCallback(() => {
    if (!trackAnalytics || !videoRef.current || !videoId) return;
    
    const currentPos = videoRef.current.currentTime;
    setAnalyticsPositions(prev => [
      ...prev, 
      { position: currentPos, timestamp: Date.now() }
    ]);
    
    // Track quarters watched (25%, 50%, 75%, 100%)
    const quarterSize = duration / 4;
    const currentQuarter = Math.floor(currentPos / quarterSize);
    
    if (currentQuarter >= 0 && !quartersWatched.includes(currentQuarter)) {
      setQuartersWatched(prev => [...prev, currentQuarter]);
      
      // Send analytics data to backend
      try {
        fetch(`${API_BASE_URL}/videos/${videoId}/analytics/quarters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            quarter: currentQuarter,
            sessionId: sessionId.current,
            position: currentPos
          }),
          credentials: 'include'
        });
      } catch (error) {
        console.error('Failed to track quarter analytics:', error);
      }
    }
  }, [duration, quartersWatched, trackAnalytics, videoId]);

  // Handle CTA click
  const handleCTAClick = useCallback(() => {
    if (!callToAction?.buttonLink || !trackAnalytics || !videoId) return;
    
    // Track CTA click
    try {
      fetch(`${API_BASE_URL}/videos/${videoId}/analytics/cta-click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId: sessionId.current
        }),
        credentials: 'include'
      });
    } catch (error) {
      console.error('Failed to track CTA click:', error);
    }
    
    // Open link in new tab
    window.open(callToAction.buttonLink, '_blank');
  }, [callToAction, trackAnalytics, videoId]);

  // Send view data when component unmounts
  useEffect(() => {
    const startTime = Date.now();
    let hasTrackedView = false;
    
    return () => {
      if (!trackAnalytics || !videoId || hasTrackedView) return;
      
      const endTime = Date.now();
      const watchTimeSeconds = (endTime - startTime) / 1000;
      
      // Only send analytics data if the video was completed
      if (videoEnded) {
        try {
          fetch(`${API_BASE_URL}/videos/${videoId}/analytics/view`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              sessionId: sessionId.current,
              startTime,
              endTime,
              watchTime: watchTimeSeconds,
              playbackPositions: analyticsPositions,
              completedQuarters: quartersWatched,
              isCompleteView: true
            }),
            credentials: 'include'
          });
          hasTrackedView = true;
        } catch (error) {
          console.error('Failed to send analytics data:', error);
        }
      }
    };
  }, [videoId, analyticsPositions, quartersWatched, trackAnalytics, videoEnded]);

  // Handle video time updates
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);
    
    // Track analytics at intervals
    if (trackAnalytics && video.currentTime % 10 < 0.5) {
      trackPlaybackPosition();
    }
  }, [trackAnalytics, trackPlaybackPosition]);

  // Handle video metadata loaded
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    console.log("Video duration:", video.duration);
    setDuration(video.duration);
    
    // Set current time if needed (for restoration)
    if (startTime > 0) {
      video.currentTime = startTime;
    }
    
    if (onDurationChange) {
      onDurationChange(video.duration);
    }
  }, [startTime, onDurationChange]);

  // Handle duration change
  const handleDurationChange = useCallback(() => {
    const video = videoRef.current;
    if (!video || isNaN(video.duration)) return;
    
    setDuration(video.duration);
    
    if (onDurationChange) {
      onDurationChange(video.duration);
    }
  }, [onDurationChange]);

  // Handle when video can play
  const handleCanPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // If autoplay is true and the video is supposed to be playing
    if (autoPlay && !video.paused) {
      video.play().catch(err => {
        console.error("Could not play video on canplay event:", err);
      });
    }
  }, [autoPlay]);

  // Handle video ended
  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
    setShowCTA(true);
    setVideoEnded(true);
    onEnded?.();
  }, [onEnded]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Add a custom style for the slider progress bar and other color-themed elements
  const themeStyles = useCallback(() => {
    return {
      // Define custom properties for colors
      '--primary-color': primaryColor,
      '--secondary-color': secondaryColor,
      // Define gradient for various elements
      '--color-gradient': `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
    } as React.CSSProperties;
  }, [primaryColor, secondaryColor]);

  // Add a touch handler for better mobile interaction with the slider
  const handleProgressBarTouch = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    if (newTime >= 0 && newTime <= duration) {
      handleSeek(newTime);
    }
  }, [duration, handleSeek]);

  // Add a handler for clicking directly on the progress bar
  const handleProgressBarClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    if (newTime >= 0 && newTime <= duration) {
      handleSeek(newTime);
    }
  }, [duration, handleSeek]);

  // Set up event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set up event listeners
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("ended", handleVideoEnded);
    video.addEventListener("canplay", handleCanPlay);
    
    // Handle external playback state
    if (externalIsPlaying !== undefined && externalIsPlaying !== isPlaying) {
      if (externalIsPlaying) {
        video.play().catch(err => console.error("Could not play video:", err));
      } else {
        video.pause();
      }
      setIsPlaying(externalIsPlaying);
    }
    
    // Handle autoplay
    if (autoPlay) {
      video.muted = true; // Browsers require muted for autoplay
      video.play().catch(err => console.error("Could not autoplay:", err));
    }
    
    // Set initial position if specified
    if (startTime > 0 && Math.abs(video.currentTime - startTime) > 0.5) {
      video.currentTime = startTime;
    }
    
    // Set loop
    video.loop = loop;
    
    // Set initial volume
    video.volume = volume;
    video.muted = isMuted;

    // Set up keyboard event listeners
    document.addEventListener("keydown", handleKeyDown);

    // Set up playback speed
    video.playbackRate = playbackSpeed;

    // Clean up event listeners
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("ended", handleVideoEnded);
      video.removeEventListener("canplay", handleCanPlay);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    handleTimeUpdate,
    handleLoadedMetadata,
    handleDurationChange,
    handleVideoEnded,
    handleCanPlay,
    handleKeyDown,
    externalIsPlaying,
    autoPlay,
    startTime,
    loop,
    volume,
    isMuted,
    playbackSpeed,
  ]);

  // Update external play state
  useEffect(() => {
    if (onPlaybackChange && isPlaying !== undefined) {
      onPlaybackChange(isPlaying);
    }
  }, [isPlaying, onPlaybackChange]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!controls) return;
      
      switch(e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'arrowleft':
          e.preventDefault();
          handleSeek(Math.max(0, currentTime - 5));
          break;
        case 'arrowright':
          e.preventDefault();
          handleSeek(Math.min(duration, currentTime + 5));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [controls, togglePlay, toggleMute, toggleFullscreen, handleSeek, currentTime, duration]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative group bg-black rounded-lg overflow-hidden",
        isTheaterMode && "max-h-[70vh] w-full",
        isMiniPlayer && "fixed bottom-4 right-4 w-64 h-36",
        className
      )}
      style={themeStyles()}
      tabIndex={0} // Make container focusable for keyboard controls
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onTouchStart={() => setShowControls(true)}
      onTouchEnd={() => {
        setTimeout(() => setShowControls(false), 3000);
      }}
      onKeyDown={(e) => e.stopPropagation()} // Prevent double handling of keyboard events
    >
      <video
        ref={videoRef}
        src={src}
        poster={getPosterUrl()}
        className="w-full h-full cursor-pointer object-contain bg-black"
        autoPlay={isPlaying}
        playsInline
        onClick={togglePlay}
        onError={(e) => {
          const error = e.currentTarget.error;
          const message = error ? error.message : "Error playing video";
          console.error("Video playback error:", message);
          onError?.(message);
        }}
      />

      {/* Call to Action Overlay */}
      {callToAction?.enabled && showCTA && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white p-6 text-center">
          <h2 className="text-2xl font-bold mb-2">{callToAction.title}</h2>
          {callToAction.description && (
            <p className="mb-8 max-w-md">{callToAction.description}</p>
          )}
          <Button
            onClick={handleCTAClick}
            style={{background: `var(--color-gradient)`}}
            className="px-8 py-2 rounded-full font-medium flex items-center gap-2 transition-all
              hover:brightness-110 hover:scale-105"
          >
            {callToAction.buttonText}
            <ExternalLink className="h-4 w-4" />
          </Button>
          
          {videoEnded && (
            <Button
              variant="ghost"
              className="mt-4 text-sm"
              onClick={() => {
                setShowCTA(false);
                setVideoEnded(false);
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                  setIsPlaying(true);
                }
              }}
            >
              Replay Video
            </Button>
          )}
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      {showShortcuts && (
        <div className="absolute inset-0 bg-black/90 text-white p-8 overflow-y-auto max-h-full">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Keyboard Shortcuts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {shortcuts.map((shortcut) => (
                <div key={shortcut.key} className="flex items-center gap-4">
                  <kbd className="px-2 py-1 bg-gray-700 rounded">
                    {shortcut.key}
                  </kbd>
                  <span>{shortcut.description}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-gray-400">
              Press '?' again to close this help screen
            </p>
          </div>
        </div>
      )}

      {controls && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-white text-sm">
              {formatTime(currentTime)}
            </span>
            <div 
              className="relative flex-1 h-5 group flex items-center cursor-pointer" 
              style={themeStyles()}
              onClick={handleProgressBarClick}
              onTouchStart={handleProgressBarTouch}
              onTouchMove={handleProgressBarTouch}
            >
              {/* Progress bar background - use custom styling */}
              <div className="absolute inset-0 h-2 top-1/2 -translate-y-1/2 bg-gray-700/50 rounded-full overflow-hidden">
                {/* Progress bar fill */}
                <div 
                  className="absolute h-full"
                  style={{ 
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                    background: `var(--color-gradient)`
                  }}
                ></div>
              </div>
              
              {duration > 0 && (
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={0.1}
                  className="flex-1 cursor-pointer z-10"
                  rangeClassName="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)]"
                  trackClassName="bg-gray-700/50"
                  thumbClassName={cn(
                    "h-5 w-5 bg-white rounded-full border-none",
                    "transition-transform hover:scale-125",
                    "group-hover:scale-110 shadow-md"
                  )}
                  onValueChange={(value) => {
                    handleSeek(value[0]);
                  }}
                  onValueCommit={(value) => {
                    // Final confirmation of the seek
                    handleSeek(value[0]);
                  }}
                  aria-label="Seek time"
                />
              )}
            </div>
            <span className="text-white text-sm">{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="hover:opacity-80 transition-colors"
                  title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                  style={{color: primaryColor}}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </button>
                <div className="text-white text-sm">
                  {playbackSpeed !== 1 && `${playbackSpeed}x`}
                </div>
              </div>

              <button
                onClick={skipBackward}
                className="hover:opacity-80 transition-colors"
                title="Skip backward 10s (J)"
                style={{color: primaryColor}}
              >
                <SkipBack className="h-5 w-5" />
              </button>

              <button
                onClick={skipForward}
                className="hover:opacity-80 transition-colors"
                title="Skip forward 10s (L)"
                style={{color: primaryColor}}
              >
                <SkipForward className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="hover:opacity-80 transition-colors"
                  title="Mute/Unmute (M)"
                  style={{color: primaryColor}}
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.01}
                  className="w-24"
                  rangeClassName="bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)]"
                  trackClassName="bg-gray-700/50"
                  thumbClassName="h-4 w-4 bg-white rounded-full border-none shadow-md"
                  onValueChange={(value) => handleVolumeChange(value[0])}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {title && (
                <span className="text-white text-sm hidden md:block">
                  {title}
                </span>
              )}
              <button
                onClick={toggleFullscreen}
                className="hover:opacity-80 transition-colors"
                title="Toggle fullscreen (F)"
                style={{color: primaryColor}}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
