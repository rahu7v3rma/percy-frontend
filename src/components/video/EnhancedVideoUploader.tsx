import { useState, useRef, useEffect } from 'react';
import { FileVideo, Upload, XCircle, AlertCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface VideoUploaderProps {
  onUpload: (file: File) => void;
  onFileSelect?: (file: File) => void;
  maxSizeMB?: number;
  className?: string;
  acceptedTypes?: string[];
}

export function EnhancedVideoUploader({
  onUpload,
  onFileSelect,
  maxSizeMB = 500, // Default to 500MB max size
  className = '',
  acceptedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
}: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Prevent default behavior for drag events
  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e);
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    setErrorMessage('');
    
    // Check if file type is accepted
    if (!acceptedTypes.includes(file.type)) {
      setErrorMessage(`Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`);
      toast({
        title: "Invalid File Type",
        description: `Please upload a supported video format (${acceptedTypes.map(t => t.split('/')[1]).join(', ')})`,
        variant: "destructive"
      });
      return;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setErrorMessage(`File is too large. Maximum size is ${maxSizeMB}MB.`);
      toast({
        title: "File Too Large",
        description: `Maximum file size is ${maxSizeMB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    
    // Notify parent component about file selection without starting upload
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCancelClick = () => {
    setSelectedFile(null);
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // Notify parent that file selection was canceled
    if (onFileSelect) {
      onFileSelect(null as unknown as File);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  // Add global drop handlers to prevent browser default behavior
  useEffect(() => {
    const dragOverHandler = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener('dragover', dragOverHandler);
    window.addEventListener('drop', (e) => {
      e.preventDefault();
    });

    return () => {
      window.removeEventListener('dragover', dragOverHandler);
      window.removeEventListener('drop', (e) => {
        e.preventDefault();
      });
    };
  }, []);

  return (
    <div 
      className={`w-full ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragEvents}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      ref={dropZoneRef}
    >
      <div 
        className={`
          border-2 ${isDragging ? 'border-purple-500 bg-purple-500/10' : 'border-dashed border-gray-700 bg-gray-800/50'} 
          rounded-lg p-8 transition-colors duration-200 ease-in-out
          flex flex-col items-center justify-center w-full h-full
          ${selectedFile ? 'border-solid border-green-500/50' : ''}
        `}
      >
        {!selectedFile ? (
          <>
            <div className="mb-4 w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">
              {isDragging ? 'Drop your video here' : 'Drag & drop your video'}
            </h3>
            <p className="text-gray-400 text-center mb-6">
              Supported formats: MP4, WebM, QuickTime, AVI
            </p>
            <p className="text-gray-500 text-sm text-center mb-6">
              Maximum file size: {maxSizeMB}MB
            </p>
            <Button 
              type="button" 
              onClick={handleBrowseClick} 
              className="bg-purple-600 hover:bg-purple-700"
            >
              <FileVideo className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
            {errorMessage && (
              <div className="mt-4 text-red-500 text-sm flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                {errorMessage}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept={acceptedTypes.join(',')}
              className="hidden"
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
              <FileVideo className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">
              File Selected
            </h3>
            <p className="text-gray-300 text-center mb-1 font-medium">
              {selectedFile.name}
            </p>
            <p className="text-gray-500 text-sm text-center mb-4">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* <Button 
                type="button" 
                onClick={handleUploadClick}
                className="bg-opal-600 hover:bg-opal-700 px-6 font-medium"
                size="lg"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Now
              </Button> */}
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancelClick}
                className="border-red-500/50 text-red-500 hover:bg-red-500/10"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 