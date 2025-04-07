import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB in bytes (matches backend limit)
const ALLOWED_TYPES = ["video/mp4"];

interface VideoUploadProps {
  onUpload: (
    videoFile: File,
    thumbnailFile: File | null,
    onProgress: (progress: number) => void
  ) => Promise<void>;
  onSuccess?: (videoId: string) => void;
  onError?: (error: string) => void;
}

export function VideoUpload({
  onUpload,
  onSuccess,
  onError,
}: VideoUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File, isVideo: boolean): boolean => {
    setError(null);

    if (isVideo) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Only MP4 format is supported for videos");
        return false;
      }

      if (file.size > MAX_FILE_SIZE) {
        setError("Video size must be less than 500MB");
        return false;
      }
    } else {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are supported for thumbnails");
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit for thumbnails
        setError("Thumbnail size must be less than 5MB");
        return false;
      }
    }

    return true;
  };

  const handleThumbnailChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    event.stopPropagation(); // Prevent card click event

    const file = event.target.files?.[0];
    if (!file) return;

    if (validateFile(file, false)) {
      setSelectedThumbnail(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedVideo) return;
    try {
      setIsUploading(true);
      setError(null);
      await onUpload(selectedVideo, selectedThumbnail, (progress) => {
        setUploadProgress(progress);
        if (progress === 100) {
          setIsUploading(false);
          setSelectedVideo(null);
          setSelectedThumbnail(null);
          setUploadProgress(0);
          onSuccess?.("temp-id"); // Replace with actual video ID from response
        }
      });
    } catch (error) {
      setIsUploading(false);
      console.error("Video upload failed:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("Dropped files:", acceptedFiles);
    if (acceptedFiles.length === 0) return;
  
    const file = acceptedFiles[0];
    if (validateFile(file, true)) {
      setSelectedVideo(file);
      setError(null);
      setUploadProgress(0);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive, open, fileRejections } = useDropzone({
    onDrop,
    accept: { "video/mp4": [".mp4"] },
    maxFiles: 1,
    multiple: false,
    maxSize: MAX_FILE_SIZE,
    noClick: true,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8
          transition-colors duration-200 ease-in-out
          flex flex-col items-center justify-center
          ${
            isDragActive
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-700 hover:border-gray-600"
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-gray-400 mb-4" />
        <div className="text-center">
          {isDragActive ? (
            <p className="text-blue-500">Drop the video here</p>
          ) : (
            <>
              <p className="text-lg font-medium">
                Drag and drop your video here
              </p>
              <Button
                type="button"
                variant="ghost"
                className="mt-2 text-sm text-gray-400 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
              >
                or click to select a file
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Supports MP4 format only
              </p>
            </>
          )}
        </div>
      </div>

      {fileRejections.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Rejected File</AlertTitle>
          <AlertDescription>
            {fileRejections[0].errors[0].message}
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(selectedVideo || selectedThumbnail) && (
        <div className="bg-gray-900 rounded-lg p-4 space-y-4">
          {selectedVideo && (
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Selected Video</Label>
                <div className="text-sm text-gray-500">
                  {selectedVideo.name} ({formatFileSize(selectedVideo.size)})
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSelectedVideo(null)}
                className="px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="thumbnail">Custom Thumbnail (Optional)</Label>
              <Input
                id="thumbnail"
                type="file"
                ref={thumbnailInputRef}
                accept="image/*"
                onChange={handleThumbnailChange}
                className="mt-2"
              />
            </div>

            {selectedThumbnail && (
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">
                    Selected Thumbnail
                  </Label>
                  <div className="text-sm text-gray-500">
                    {selectedThumbnail.name} (
                    {formatFileSize(selectedThumbnail.size)})
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setSelectedThumbnail(null)}
                  className="px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {uploadProgress > 0 && (
            <Progress value={uploadProgress} className="w-full" />
          )}

          <Button
            type="button"
            onClick={handleUpload}
            disabled={!selectedVideo || isUploading}
            className="w-full"
          >
            {isUploading ? "Uploading..." : "Upload Video"}
          </Button>
        </div>
      )}
    </div>
  );
}
