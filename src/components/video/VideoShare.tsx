import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Copy, Mail, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createShareLink, sendShareEmail } from "@/services/shareService";
import { API_BASE_URL } from "@/config/api";

interface VideoShareProps {
  videoId: string;
  videoUrl: string;
  title: string;
}

export function VideoShare({ videoId, videoUrl, title }: VideoShareProps) {
  const [expiryDays, setExpiryDays] = useState(7);
  const [requireEmail, setRequireEmail] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateEmbedCode = () => {
    return `<iframe 
  src="${window.location.origin}/embed/${videoId}"
  width="100%"
  height="400"
  frameborder="0"
  allow="autoplay; fullscreen"
  allowfullscreen
></iframe>`;
  };

  const handleCreateShareLink = async () => {
    try {
      setLoading(true);
      const expiryDate =
        expiryDays > 0
          ? Date.now() + expiryDays * 24 * 60 * 60 * 1000
          : undefined;

      const { shareUrl } = await createShareLink({
        videoId,
        expiryDate,
        requireEmail,
      });
      setShareLink(shareUrl);
      toast({
        title: "Share link created",
        description: "The share link has been generated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create share link",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) {
      toast({
        title: "Error",
        description: "Please enter recipient email",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const expiryDate =
        expiryDays > 0
          ? Date.now() + expiryDays * 24 * 60 * 60 * 1000
          : undefined;
      await sendShareEmail({
        videoId,
        recipientEmail,
        message,
        expiryDate,
        requireEmail,
      });

      toast({
        title: "Email sent",
        description: `Share link has been sent to ${recipientEmail}`,
      });
      setRecipientEmail("");
      setMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The content has been copied to your clipboard.",
    });
  };

  return (
    <Card className="bg-gray-900 border-gray-800 p-4">
      <Tabs defaultValue="link" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="link">Share Link</TabsTrigger>
          <TabsTrigger value="embed">Embed</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>

        <TabsContent value="link" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Share Link</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (shareLink) {
                    copyToClipboard(shareLink);
                  } else {
                    handleCreateShareLink();
                  }
                }}
                disabled={loading}
              >
                {shareLink ? (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                ) : (
                  <>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Generate Link
                  </>
                )}
              </Button>
            </div>
            {shareLink && (
              <Input
                value={shareLink}
                readOnly
                className="bg-gray-800 border-gray-700"
              />
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="require-email"
                checked={requireEmail}
                onCheckedChange={setRequireEmail}
              />
              <Label htmlFor="require-email">Require email to view</Label>
            </div>

            <div className="space-y-2">
              <Label>Link expires in</Label>
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                className="w-full bg-gray-800 border-gray-700 rounded-md p-2"
              >
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={365}>1 year</option>
                <option value={0}>Never</option>
              </select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="embed" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Embed Code</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(generateEmbedCode())}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
            <textarea
              value={generateEmbedCode()}
              readOnly
              rows={4}
              className="w-full bg-gray-800 border-gray-700 rounded-md p-2 font-mono text-sm"
            />

            <div className="rounded-lg overflow-hidden border border-gray-800">
              <div className="bg-gray-800 p-2 text-sm font-medium">Preview</div>
              <div className="aspect-video bg-gray-950 p-4">
                <iframe
                  src={`${API_BASE_URL}/videos/${videoId}/stream`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <Label>Recipient Email</Label>
              <div className="flex space-x-2 mt-1.5">
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Message (optional)</Label>
              <textarea
                placeholder="Add a personal message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full bg-gray-800 border-gray-700 rounded-md p-2"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="email-require-email"
                checked={requireEmail}
                onCheckedChange={setRequireEmail}
              />
              <Label htmlFor="email-require-email">Require email to view</Label>
            </div>

            <div className="space-y-2">
              <Label>Link expires in</Label>
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                className="w-full bg-gray-800 border-gray-700 rounded-md p-2"
              >
                <option value={1}>1 day</option>
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={365}>1 year</option>
                <option value={0}>Never</option>
              </select>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
