import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ThumbnailGenerator } from "./ThumbnailGenerator";
import { ColorPicker } from "@/components/ui/color-picker";
import { AlertCircle, Image, Sliders, CreditCard, Play, Maximize, ExternalLink, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { CallToAction, VideoSettings } from "@/models/VideoSettings";
import { API_BASE_URL, getFullUrl } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface VideoEditorProps {
  videoId: string;
  initialData: {
    title: string;
    description?: string;
    thumbnail?: string;
    thumbnailUrl?: string;
    settings?: VideoSettings;
  };
  initialTab?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export function VideoEditor({
  videoId,
  initialData,
  initialTab = "details",
  open,
  onOpenChange,
  onSave,
}: VideoEditorProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Video details state
  const [title, setTitle] = useState(initialData.title);
  const [description, setDescription] = useState(initialData.description || "");
  
  // Thumbnail state - prioritize thumbnailUrl if available
  const [thumbnail, setThumbnail] = useState<string | null>(initialData.thumbnailUrl || initialData.thumbnail || null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [showThumbnailEditor, setShowThumbnailEditor] = useState(false);
  
  // Player settings state
  const [playerColor, setPlayerColor] = useState<string>(
    initialData.settings?.playerColor || "#E11D48"
  );
  const [secondaryColor, setSecondaryColor] = useState<string>(
    initialData.settings?.secondaryColor || "#581C87"
  );
  const [autoPlay, setAutoPlay] = useState<boolean>(
    initialData.settings?.autoPlay || false
  );
  
  // Call to action state
  const [ctaEnabled, setCtaEnabled] = useState<boolean>(
    initialData.settings?.callToAction?.enabled || false
  );
  const [ctaTitle, setCtaTitle] = useState<string>(
    initialData.settings?.callToAction?.title || "Want to learn more?"
  );
  const [ctaDescription, setCtaDescription] = useState<string>(
    initialData.settings?.callToAction?.description || ""
  );
  const [ctaButtonText, setCtaButtonText] = useState<string>(
    initialData.settings?.callToAction?.buttonText || "Visit Website"
  );
  const [ctaButtonLink, setCtaButtonLink] = useState<string>(
    initialData.settings?.callToAction?.buttonLink || ""
  );
  const [ctaDisplayTime, setCtaDisplayTime] = useState<number>(
    initialData.settings?.callToAction?.displayTime || 0
  );
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      // Prioritize thumbnailUrl if available
      setThumbnail(initialData.thumbnailUrl || initialData.thumbnail || null);
      setThumbnailFile(null);
      setThumbnailPreview(null);
      setPlayerColor(initialData.settings?.playerColor || "#E11D48");
      setSecondaryColor(initialData.settings?.secondaryColor || "#581C87");
      setAutoPlay(initialData.settings?.autoPlay || false);
      setCtaEnabled(initialData.settings?.callToAction?.enabled || false);
      setCtaTitle(initialData.settings?.callToAction?.title || "Want to learn more?");
      setCtaDescription(initialData.settings?.callToAction?.description || "");
      setCtaButtonText(initialData.settings?.callToAction?.buttonText || "Visit Website");
      setCtaButtonLink(initialData.settings?.callToAction?.buttonLink || "");
      setCtaDisplayTime(initialData.settings?.callToAction?.displayTime || 0);
      setActiveTab(initialTab);
    }
  }, [open, initialData, initialTab]);
  
  const handleThumbnailSelect = (file: File | null, url: string | null) => {
    setThumbnailFile(file);
    setThumbnail(url);
    setThumbnailPreview(url);
    
    // Show success toast
    if (url) {
      toast({
        title: "Thumbnail selected",
        description: "Your new thumbnail has been selected. Click Save Changes to apply it."
      });
    }
  };
  
  const handleSave = async () => {
    try {
      // Show loading toast
      toast({
        title: "Saving changes...",
        description: "Please wait while your changes are being saved.",
      });
      
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      
      // Append thumbnail if changed
      if (thumbnailFile) {
        formData.append("thumbnail", thumbnailFile);
        console.log("Appending thumbnail file to form data:", thumbnailFile.name);
      }
      
      // Create settings object
      const callToAction: CallToAction | undefined = ctaEnabled
        ? {
            enabled: ctaEnabled,
            title: ctaTitle,
            description: ctaDescription,
            buttonText: ctaButtonText,
            buttonLink: ctaButtonLink,
            displayTime: ctaDisplayTime,
          }
        : undefined;
      
      const settings: VideoSettings = {
        playerColor,
        secondaryColor,
        autoPlay,
        callToAction,
      };
      
      formData.append("settings", JSON.stringify(settings));
      
      console.log(`Updating video ${videoId} with settings:`, settings);
      
      // Send update request
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_BASE_URL}/videos/${videoId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        throw new Error(errorData.message || "Failed to update video");
      }
      
      const updatedVideo = await response.json();
      console.log("Video updated successfully:", updatedVideo);
      
      toast({
        title: "Video updated",
        description: "Your changes have been saved successfully.",
      });
      
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating video:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update video. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const AppearanceTab = ({
    videoSettings,
    setVideoSettings,
  }: {
    videoSettings: VideoSettings;
    setVideoSettings: (settings: VideoSettings) => void;
  }) => {
    const [primaryColor, setPrimaryColor] = useState(videoSettings.playerColor || "#F59E0B");
    const [secondaryColor, setSecondaryColor] = useState(videoSettings.secondaryColor || "#EF4444");
    const [autoPlay, setAutoPlay] = useState(videoSettings.autoPlay || false);

    useEffect(() => {
      // Update the settings state whenever the colors change
      setVideoSettings({
        ...videoSettings,
        playerColor: primaryColor,
        secondaryColor: secondaryColor,
        autoPlay: autoPlay,
      });
    }, [primaryColor, secondaryColor, autoPlay]);

    const gradientStyle = {
      background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
    };

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="primaryColor">Theme Colors</Label>
            <div className="grid gap-4 mt-2">
              <div>
                <Label htmlFor="primaryColor" className="text-sm">Primary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: primaryColor }} />
                  <Input
                    id="primaryColor"
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                  <ColorPicker
                    color={primaryColor}
                    onChange={setPrimaryColor}
                    className="w-10 h-10 rounded-md flex-shrink-0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondaryColor" className="text-sm">Secondary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: secondaryColor }} />
                  <Input
                    id="secondaryColor"
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1"
                  />
                  <ColorPicker
                    color={secondaryColor}
                    onChange={setSecondaryColor}
                    className="w-10 h-10 rounded-md flex-shrink-0"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="autoPlay">Player Options</Label>
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="autoPlay"
                checked={autoPlay}
                onCheckedChange={(checked) =>
                  setAutoPlay(checked === true)
                }
              />
              <Label htmlFor="autoPlay" className="text-sm">Enable Autoplay</Label>
            </div>
          </div>
        </div>

        {/* Preview section */}
        <div className="mt-8 border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Color Theme Preview</h3>
          <div className="space-y-6">
            {/* Gradient preview */}
            <div>
              <Label className="text-sm mb-2 block">Theme Gradient</Label>
              <div className="h-10 rounded-lg" style={gradientStyle}></div>
            </div>
            
            {/* Player controls preview */}
            <div>
              <Label className="text-sm mb-2 block">Player Controls</Label>
              <div className="bg-black p-4 rounded-lg">
                {/* Progress bar preview */}
                <div className="relative h-10 flex items-center">
                  <div className="absolute inset-0 h-2 top-1/2 -translate-y-1/2 bg-gray-700/50 rounded-full overflow-hidden">
                    <div 
                      className="absolute h-full w-3/4" 
                      style={gradientStyle}
                    ></div>
                  </div>
                  
                  <div 
                    className="absolute h-5 w-5 rounded-full bg-white shadow-md top-1/2 -translate-y-1/2"
                    style={{ left: "75%", transform: "translateX(-50%) translateY(-50%)" }}
                  ></div>
                </div>
                
                {/* Controls preview */}
                <div className="flex items-center gap-3 text-white mt-3">
                  <button className="hover:opacity-80" style={{ color: primaryColor }}>
                    <Play className="h-5 w-5" />
                  </button>
                  <button className="hover:opacity-80 ml-2" style={{ color: primaryColor }}>
                    <SkipBack className="h-4 w-4" />
                  </button>
                  <button className="hover:opacity-80" style={{ color: primaryColor }}>
                    <SkipForward className="h-4 w-4" />
                  </button>
                  <button className="hover:opacity-80 ml-2" style={{ color: primaryColor }}>
                    <Volume2 className="h-4 w-4" />
                  </button>
                  <span className="text-xs ml-2">00:45 / 02:30</span>
                  <div className="ml-auto">
                    <button className="hover:opacity-80" style={{ color: primaryColor }}>
                      <Maximize className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA Button preview */}
            <div>
              <Label className="text-sm mb-2 block">Call to Action Button</Label>
              <div className="bg-black p-6 rounded-lg flex justify-center">
                <button 
                  className="px-4 py-2 rounded-full text-white font-medium flex items-center gap-2 transition-all hover:brightness-110"
                  style={gradientStyle}
                >
                  Watch More
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Details</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <span>Player Settings</span>
              </TabsTrigger>
              <TabsTrigger value="cta" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Call to Action</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Video Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter video title"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter video description"
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Thumbnail</Label>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start">
                      <div className="aspect-video w-full md:w-64 bg-gray-800 rounded-md overflow-hidden relative">
                        {thumbnail || thumbnailPreview ? (
                          <img
                            src={thumbnailPreview || thumbnail}
                            alt="Video thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500">
                            <Image className="w-8 h-8" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                          <Button
                            type="button"
                            variant="secondary"
                            className="bg-black/50 hover:bg-black/70 text-white"
                            onClick={() => setShowThumbnailEditor(true)}
                          >
                            Change Thumbnail
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full md:w-auto flex items-center gap-2"
                          onClick={() => setShowThumbnailEditor(true)}
                        >
                          <Image className="h-4 w-4" />
                          Change Thumbnail
                        </Button>
                        <p className="text-xs text-gray-500">
                          Choose a frame from your video or upload a custom image to represent your video.
                          <br />
                          Recommended size: 1280x720 pixels (16:9 ratio)
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>
                    Customize how your video player looks
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <AppearanceTab
                    videoSettings={{
                      playerColor: playerColor,
                      secondaryColor: secondaryColor,
                      autoPlay: autoPlay,
                    }}
                    setVideoSettings={(settings) => {
                      setPlayerColor(settings.playerColor || "#F59E0B");
                      setSecondaryColor(settings.secondaryColor || "#EF4444");
                      setAutoPlay(settings.autoPlay || false);
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="cta" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Call to Action</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="cta-enabled">Enable Call to Action</Label>
                      <p className="text-sm text-gray-500">
                        Show a call-to-action overlay at the end of your video
                      </p>
                    </div>
                    <Switch
                      id="cta-enabled"
                      checked={ctaEnabled}
                      onCheckedChange={setCtaEnabled}
                    />
                  </div>
                  
                  {ctaEnabled && (
                    <div className="space-y-4 pt-4 border-t border-gray-800">
                      <div className="space-y-2">
                        <Label htmlFor="cta-title">Title</Label>
                        <Input
                          id="cta-title"
                          value={ctaTitle}
                          onChange={(e) => setCtaTitle(e.target.value)}
                          placeholder="Enter CTA title"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cta-description">Description (Optional)</Label>
                        <Textarea
                          id="cta-description"
                          value={ctaDescription}
                          onChange={(e) => setCtaDescription(e.target.value)}
                          placeholder="Enter CTA description"
                          rows={2}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cta-button">Button Text</Label>
                        <Input
                          id="cta-button"
                          value={ctaButtonText}
                          onChange={(e) => setCtaButtonText(e.target.value)}
                          placeholder="Enter button text"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cta-link">Button Link</Label>
                        <Input
                          id="cta-link"
                          value={ctaButtonLink}
                          onChange={(e) => setCtaButtonLink(e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cta-display-time">
                          Display Time Before End (seconds)
                        </Label>
                        <Input
                          id="cta-display-time"
                          type="number"
                          min="0"
                          value={ctaDisplayTime.toString()}
                          onChange={(e) => setCtaDisplayTime(Number(e.target.value))}
                          placeholder="0"
                        />
                        <p className="text-sm text-gray-500">
                          Set to 0 to display only after video ends
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {showThumbnailEditor && (
        <Dialog open={showThumbnailEditor} onOpenChange={setShowThumbnailEditor}>
          <DialogContent className="sm:max-w-4xl bg-transparent border-0 p-0">
            <ThumbnailGenerator
              videoId={videoId}
              initialThumbnail={thumbnail || undefined}
              onThumbnailSelect={handleThumbnailSelect}
              onClose={() => setShowThumbnailEditor(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
} 