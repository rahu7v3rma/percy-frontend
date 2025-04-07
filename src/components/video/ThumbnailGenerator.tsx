import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { API_BASE_URL } from "@/config/api";
import { Camera, Upload, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ThumbnailGeneratorProps {
  videoId: string;
  initialThumbnail?: string;
  onThumbnailSelect: (thumbnail: File | null, thumbnailUrl: string | null) => void;
  onClose: () => void;
}

export function ThumbnailGenerator({
  videoId,
  initialThumbnail,
  onThumbnailSelect,
  onClose,
}: ThumbnailGeneratorProps) {
  const { toast } = useToast();
  const [tab, setTab] = useState<string>("capture");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(initialThumbnail || null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [videoError, setVideoError] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [seekBarValue, setSeekBarValue] = useState<number[]>([0]);
  const [dragActive, setDragActive] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize video player
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const handleMetadata = () => {
      console.log("Video metadata loaded, duration:", videoElement.duration);
      setDuration(videoElement.duration);
      // Set initial position to 10% of the video
      if (videoElement.duration) {
        const initialTime = videoElement.duration * 0.1;
        videoElement.currentTime = initialTime;
        setCurrentTime(initialTime);
        setSeekBarValue([initialTime]);
      }
      // We don't set isLoading to false here as we wait for canplay event
    };
    
    const handleError = (e: Event) => {
      console.error("Video loading error:", e);
      setVideoError(true);
      setIsLoading(false);
      toast({
        title: "Error loading video",
        description: "Failed to load the video. Please try again.",
        variant: "destructive"
      });
    };
    
    const handleLoadStart = () => {
      console.log("Video load started");
      setIsLoading(true);
      setVideoError(false);
    };
    
    const handleCanPlay = () => {
      console.log("Video can play now");
      setIsLoading(false);
    };

    const handleSeeked = () => {
      // Force redraw when seeking completes
      setCurrentTime(videoElement.currentTime);
    };
    
    videoElement.addEventListener("loadedmetadata", handleMetadata);
    videoElement.addEventListener("error", handleError);
    videoElement.addEventListener("loadstart", handleLoadStart);
    videoElement.addEventListener("canplay", handleCanPlay);
    videoElement.addEventListener("seeked", handleSeeked);
    
    // Try to load the video
    videoElement.load();
    
    // Clean up on component unmount
    return () => {
      videoElement.removeEventListener("loadedmetadata", handleMetadata);
      videoElement.removeEventListener("error", handleError);
      videoElement.removeEventListener("loadstart", handleLoadStart);
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.removeEventListener("seeked", handleSeeked);
    };
  }, []);
  
  // Capture thumbnail from current frame
  const captureThumbnail = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Ensure video is ready and has dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        console.error("Video dimensions not available");
        setError("Video not fully loaded. Please wait and try again.");
        setIsLoading(false);
        return;
      }
      
      // Set canvas dimensions to match video
      const aspectRatio = video.videoWidth / video.videoHeight;
      
      // Use a reasonable size that works well in most browsers (max 1280px width)
      const maxWidth = Math.min(1280, video.videoWidth);
      const width = maxWidth;
      const height = Math.round(width / aspectRatio);
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw current frame to canvas
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      // Clear canvas before drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Try to draw with error catching
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      } catch (drawError) {
        console.error("Error drawing to canvas:", drawError);
        setError("Failed to capture frame. Video may not be fully loaded.");
        setIsLoading(false);
        return;
      }
      
      // Convert canvas to Blob/File with fallback
      try {
        canvas.toBlob((blob) => {
          if (!blob) {
            setError("Failed to create image from video frame");
            setIsLoading(false);
            return;
          }
          
          // Create File object from Blob
          const fileName = `thumbnail-${videoId}-${Date.now()}.png`;
          const thumbnailFile = new File([blob], fileName, { type: "image/png" });
          
          // Set thumbnail data
          setThumbnailFile(thumbnailFile);
          const thumbnailUrl = URL.createObjectURL(blob);
          setThumbnailUrl(thumbnailUrl);
          
          // Notify parent component
          onThumbnailSelect(thumbnailFile, thumbnailUrl);
          
          setIsLoading(false);
          
          toast({
            title: "Thumbnail captured",
            description: "Frame captured successfully. Click Save to apply it to your video."
          });
        }, "image/png", 0.95); // Higher quality
      } catch (blobError) {
        console.error("Error creating blob:", blobError);
        setError("Failed to process captured frame. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error capturing thumbnail:", err);
      setError("Failed to capture thumbnail. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Add a fallback capture method using fetch API
  const captureThumbnailFallback = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try server-side screenshot generation if available
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }
      
      // Use current time as the timestamp for the screenshot
      const timestamp = Math.floor(currentTime);
      
      const response = await fetch(`${API_BASE_URL}/videos/${videoId}/screenshot?timestamp=${timestamp}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to generate screenshot from server");
      }
      
      // Get the blob from response
      const blob = await response.blob();
      
      // Create File object from Blob
      const fileName = `thumbnail-${videoId}-${Date.now()}.png`;
      const thumbnailFile = new File([blob], fileName, { type: "image/png" });
      
      // Set thumbnail data
      setThumbnailFile(thumbnailFile);
      const thumbnailUrl = URL.createObjectURL(blob);
      setThumbnailUrl(thumbnailUrl);
      
      // Notify parent component
      onThumbnailSelect(thumbnailFile, thumbnailUrl);
      
      setIsLoading(false);
      
      toast({
        title: "Thumbnail captured",
        description: "Frame captured successfully using server-side processing."
      });
    } catch (err) {
      console.error("Error in fallback capture:", err);
      toast({
        title: "Capture failed",
        description: "Both client and server-side capture methods failed. Please try uploading an image instead.",
        variant: "destructive"
      });
      setError("Thumbnail capture failed. Please try the 'Upload Image' option.");
      setIsLoading(false);
      // Switch to upload tab as fallback
      setTab("upload");
    }
  };
  
  // Enhanced capture function with fallback
  const handleCaptureThumbnail = async () => {
    // First try canvas capture
    try {
      captureThumbnail();
    } catch (err) {
      console.error("Primary capture method failed, trying fallback:", err);
      // If there's an error in the main capture, try the fallback
      if (error) {
        captureThumbnailFallback().catch(fallbackErr => {
          console.error("Even fallback capture failed:", fallbackErr);
        });
      }
    }
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      
      setIsLoading(true);
      
      // Validate file is an image
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        setIsLoading(false);
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        setIsLoading(false);
        return;
      }
      
      // Clear any previous errors
      setError(null);
      
      // Load the image to check dimensions and validity
      const img = new Image();
      img.onload = () => {
        // Image loaded successfully
        setThumbnailFile(file);
        const thumbnailUrl = URL.createObjectURL(file);
        setThumbnailUrl(thumbnailUrl);
        onThumbnailSelect(file, thumbnailUrl);
        setIsLoading(false);
        
        toast({
          title: "Thumbnail uploaded",
          description: "Image uploaded successfully. Click Save to apply it to your video."
        });
      };
      
      img.onerror = () => {
        setError("Invalid image file. Please try another.");
        setIsLoading(false);
      };
      
      img.src = URL.createObjectURL(file);
    } catch (err) {
      console.error("Error uploading thumbnail:", err);
      setError("Failed to upload thumbnail. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Handle seek on video
  const handleSeek = (value: number[]) => {
    const time = value[0];
    setSeekBarValue(value);
    setCurrentTime(time);
    
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };
  
  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      if (fileInputRef.current) {
        // This triggers the onChange handler to process the file
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        
        // Manually trigger the onChange event
        const event = new Event('change', { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };
  
  // Format time (seconds) to MM:SS
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-4xl">
      <h2 className="text-xl font-bold mb-4">Select Thumbnail</h2>
      
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="capture" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span>Capture from Video</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Upload Image</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="capture" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div className="relative aspect-video bg-gray-950 rounded-lg overflow-hidden">
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  </div>
                )}
                
                {videoError ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/10 z-10 p-4">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-2" />
                    <p className="text-center text-red-500">Failed to load video</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.load();
                        }
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    src={`${API_BASE_URL}/videos/${videoId}/stream`}
                    crossOrigin="anonymous"
                    preload="auto"
                    controls={false}
                    playsInline
                    onError={(e) => {
                      console.error("Video error event:", e);
                      setVideoError(true);
                      setIsLoading(false);
                    }}
                  />
                )}
                
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
              </div>
              
              <div className="space-y-2 mt-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>Current Time: {formatTime(currentTime)}</span>
                  <span>Duration: {formatTime(duration)}</span>
                </div>
                
                <Slider
                  value={seekBarValue}
                  max={duration}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="w-full"
                  disabled={duration === 0 || isLoading || videoError}
                />
                
                <div className="flex flex-wrap gap-2 justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (videoRef.current) {
                        const newTime = Math.max(0, currentTime - 10);
                        videoRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                        setSeekBarValue([newTime]);
                      }
                    }}
                    disabled={isLoading || videoError}
                  >
                    -10s
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (videoRef.current) {
                        const newTime = Math.max(0, currentTime - 1);
                        videoRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                        setSeekBarValue([newTime]);
                      }
                    }}
                    disabled={isLoading || videoError}
                  >
                    -1s
                  </Button>
                  
                  <Button
                    variant="default"
                    onClick={handleCaptureThumbnail}
                    className="px-4 bg-opal-600 hover:bg-opal-700"
                    disabled={isLoading || videoError}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Capture Frame
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (videoRef.current) {
                        const newTime = Math.min(duration, currentTime + 1);
                        videoRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                        setSeekBarValue([newTime]);
                      }
                    }}
                    disabled={isLoading || videoError}
                  >
                    +1s
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (videoRef.current) {
                        const newTime = Math.min(duration, currentTime + 10);
                        videoRef.current.currentTime = newTime;
                        setCurrentTime(newTime);
                        setSeekBarValue([newTime]);
                      }
                    }}
                    disabled={isLoading || videoError}
                  >
                    +10s
                  </Button>
                </div>
                
                <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-800/50 rounded-md">
                  <p>Tip: If you're having trouble capturing a frame, please ensure the video has fully loaded. If issues persist, try using the "Upload Image" option to upload a custom thumbnail.</p>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 rounded-md p-3 h-full flex flex-col">
                <h3 className="text-md font-medium mb-3">Preview</h3>
                
                {thumbnailUrl ? (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-gray-700 mb-3">
                    <img
                      src={thumbnailUrl}
                      alt="Selected thumbnail"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video bg-black/40 rounded-lg flex items-center justify-center mb-3 border border-dashed border-gray-700">
                    <p className="text-gray-500 text-sm text-center p-4">
                      No thumbnail selected yet.<br/>
                      Capture a frame from the video or upload an image.
                    </p>
                  </div>
                )}
                
                <div className="mt-auto">
                  <Button
                    className="w-full bg-opal-600 hover:bg-opal-700"
                    disabled={!thumbnailUrl || isLoading}
                    onClick={() => {
                      if (thumbnailUrl) {
                        onThumbnailSelect(thumbnailFile, thumbnailUrl);
                        onClose();
                      }
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Use This Thumbnail"
                    )}
                  </Button>
                  
                  {thumbnailUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setThumbnailUrl(null);
                        setThumbnailFile(null);
                        onThumbnailSelect(null, null);
                      }}
                      className="w-full mt-2"
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                  dragActive 
                    ? "border-opal-500 bg-opal-900/20" 
                    : "border-gray-700 hover:border-gray-600"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <p className="text-lg font-medium mb-2">
                  {dragActive ? "Drop your image here" : "Drag and drop your thumbnail"}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports JPG, PNG and GIF (max 5MB)
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="mx-auto max-w-xs"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-gray-800/50 rounded-md p-3 h-full flex flex-col">
                <h3 className="text-md font-medium mb-3">Preview</h3>
                
                {thumbnailUrl ? (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-gray-700 mb-3">
                    <img
                      src={thumbnailUrl}
                      alt="Selected thumbnail"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="relative aspect-video bg-black/40 rounded-lg flex items-center justify-center mb-3 border border-dashed border-gray-700">
                    <p className="text-gray-500 text-sm text-center p-4">
                      No thumbnail selected yet.<br/>
                      Upload an image or capture a frame from the video.
                    </p>
                  </div>
                )}
                
                <div className="mt-auto">
                  <Button
                    className="w-full bg-opal-600 hover:bg-opal-700"
                    disabled={!thumbnailUrl || isLoading}
                    onClick={() => {
                      if (thumbnailUrl) {
                        onThumbnailSelect(thumbnailFile, thumbnailUrl);
                        onClose();
                      }
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Use This Thumbnail"
                    )}
                  </Button>
                  
                  {thumbnailUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setThumbnailUrl(null);
                        setThumbnailFile(null);
                        onThumbnailSelect(null, null);
                      }}
                      className="w-full mt-2"
                    >
                      Clear Selection
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-md text-red-500 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </div>
  );
} 