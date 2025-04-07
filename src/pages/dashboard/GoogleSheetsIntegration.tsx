import { useState } from 'react';
import { Navigate } from 'react-router-dom';
// import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSpreadsheet, Clock, Upload, FileJson, Files as FileCsv, FileType } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';

const GoogleSheetsIntegration = () => {
  const { user, isLoading } = useAuth();
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [autoSync, setAutoSync] = useState(false);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  // if (!user) {
  //   return <Navigate to="/login" />;
  // }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase text-gray-500 mb-1">INTEGRATIONS</div>
          <h1 className="text-3xl font-bold">Google Sheets Integration</h1>
          <p className="text-gray-500 mt-2">Connect and sync your Google Sheets data automatically</p>
        </div>

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800">
            <TabsTrigger value="setup" className="data-[state=active]:bg-gray-800">Setup</TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gray-800">Sync History</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            {/* Connection Setup */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Google Sheets Connection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Spreadsheet URL</Label>
                  <Input 
                    placeholder="https://docs.google.com/spreadsheets/d/..." 
                    className="bg-gray-800 border-gray-700 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sheet Name</Label>
                  <Input 
                    placeholder="Sheet1" 
                    className="bg-gray-800 border-gray-700 focus:border-purple-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Export Settings */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileType className="h-5 w-5" />
                  Export Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select 
                    value={selectedFormat} 
                    onValueChange={setSelectedFormat}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      <SelectItem value="json">
                        <div className="flex items-center gap-2">
                          <FileJson className="h-4 w-4" />
                          JSON
                        </div>
                      </SelectItem>
                      <SelectItem value="csv">
                        <div className="flex items-center gap-2">
                          <FileCsv className="h-4 w-4" />
                          CSV
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Sync</Label>
                    <div className="text-sm text-gray-500">Sync data automatically on changes</div>
                  </div>
                  <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                </div>

                {autoSync && (
                  <div className="space-y-2">
                    <Label>Sync Frequency</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-800">
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
                Cancel
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Upload className="h-4 w-4 mr-2" />
                Start Sync
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {/* Sync History */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Syncs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
                    >
                      <div>
                        <div className="font-medium">Sheet1 Sync</div>
                        <div className="text-sm text-gray-500">March {14 - i}, 2025 10:30 AM</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-500">Success</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="hover:bg-gray-800"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default GoogleSheetsIntegration;
