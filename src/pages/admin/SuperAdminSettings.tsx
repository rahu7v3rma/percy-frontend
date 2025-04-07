import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Settings, Shield, Mail, Key, Globe, Loader2 } from 'lucide-react';
import { getSettings, updateSettings, testEmailConfiguration, type SecuritySettings, type EmailSettings, type SystemSettings } from '@/services/settingsService';

export default function SuperAdminSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: false,
    loginNotifications: true,
    passwordExpiry: 90,
    sessionTimeout: 24,
  });
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpServer: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: '',
    senderEmail: '',
  });
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maxVideoSize: 1024,
    allowedFileTypes: '.mp4,.mov,.avi',
    maxStoragePerUser: 5120,
    autoDeleteInactiveDays: 30,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettings();
        if (settings.security) setSecuritySettings(settings.security);
        if (settings.email) setEmailSettings(settings.email);
        if (settings.system) setSystemSettings(settings.system);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to fetch settings',
          variant: 'destructive',
        });
      }
    };
    fetchSettings();
  }, [toast]);

  const handleSecuritySettingsChange = (setting: keyof SecuritySettings, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleEmailSettingsChange = (setting: keyof EmailSettings, value: string) => {
    setEmailSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleSystemSettingsChange = (setting: keyof SystemSettings, value: string | number) => {
    setSystemSettings(prev => ({ ...prev, [setting]: value }));
  };

  const handleSaveSettings = async (settingType: 'security' | 'email' | 'system') => {
    setLoading(true);
    try {
      const settingsMap = {
        security: securitySettings,
        email: emailSettings,
        system: systemSettings,
      };
      
      await updateSettings(settingType, settingsMap[settingType]);
      
      toast({
        title: 'Success',
        description: `${settingType} settings saved successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setLoading(true);
    try {
      await testEmailConfiguration(emailSettings);
      toast({
        title: 'Success',
        description: 'Email configuration test successful',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to test email configuration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Super Admin Settings</h1>
        </div>

        <Tabs defaultValue="security" className="space-y-4">
          <TabsList>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Configuration
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              System Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <div className="text-sm text-muted-foreground">
                      Require 2FA for all admin accounts
                    </div>
                  </div>
                  <Switch
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => 
                      handleSecuritySettingsChange('twoFactorAuth', checked)
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Send email notifications for new login attempts
                    </div>
                  </div>
                  <Switch
                    checked={securitySettings.loginNotifications}
                    onCheckedChange={(checked) => 
                      handleSecuritySettingsChange('loginNotifications', checked)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password Expiry (days)</Label>
                  <Input
                    type="number"
                    value={securitySettings.passwordExpiry}
                    onChange={(e) => 
                      handleSecuritySettingsChange('passwordExpiry', parseInt(e.target.value))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Session Timeout (hours)</Label>
                  <Input
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => 
                      handleSecuritySettingsChange('sessionTimeout', parseInt(e.target.value))
                    }
                  />
                </div>

                <Button 
                  onClick={() => handleSaveSettings('security')}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Security Settings'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>SMTP Server</Label>
                  <Input
                    value={emailSettings.smtpServer}
                    onChange={(e) => 
                      handleEmailSettingsChange('smtpServer', e.target.value)
                    }
                    placeholder="smtp.example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input
                    value={emailSettings.smtpPort}
                    onChange={(e) => 
                      handleEmailSettingsChange('smtpPort', e.target.value)
                    }
                    placeholder="587"
                  />
                </div>

                <div className="space-y-2">
                  <Label>SMTP Username</Label>
                  <Input
                    value={emailSettings.smtpUsername}
                    onChange={(e) => 
                      handleEmailSettingsChange('smtpUsername', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>SMTP Password</Label>
                  <Input
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) => 
                      handleEmailSettingsChange('smtpPassword', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sender Email</Label>
                  <Input
                    type="email"
                    value={emailSettings.senderEmail}
                    onChange={(e) => 
                      handleEmailSettingsChange('senderEmail', e.target.value)
                    }
                    placeholder="noreply@example.com"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleSaveSettings('email')}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Email Settings'
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleTestEmail}
                    disabled={loading}
                  >
                    Test Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Maximum Video Size (MB)</Label>
                  <Input
                    type="number"
                    value={systemSettings.maxVideoSize}
                    onChange={(e) => 
                      handleSystemSettingsChange('maxVideoSize', parseInt(e.target.value))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Allowed File Types</Label>
                  <Input
                    value={systemSettings.allowedFileTypes}
                    onChange={(e) => 
                      handleSystemSettingsChange('allowedFileTypes', e.target.value)
                    }
                    placeholder=".mp4,.mov,.avi"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Max Storage Per User (MB)</Label>
                  <Input
                    type="number"
                    value={systemSettings.maxStoragePerUser}
                    onChange={(e) => 
                      handleSystemSettingsChange('maxStoragePerUser', parseInt(e.target.value))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Auto-Delete Inactive Videos (days)</Label>
                  <Input
                    type="number"
                    value={systemSettings.autoDeleteInactiveDays}
                    onChange={(e) => 
                      handleSystemSettingsChange('autoDeleteInactiveDays', parseInt(e.target.value))
                    }
                  />
                </div>

                <Button 
                  onClick={() => handleSaveSettings('system')}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save System Settings'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
