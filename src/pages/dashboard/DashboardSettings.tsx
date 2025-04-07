
import { useEffect, useState } from 'react';
// import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/layout/DashboardLayout';

const DashboardSettings = () => {
  const [firstViewEnabled, setFirstViewEnabled] = useState(false);
  
  useEffect(() => {
    document.title = 'Settings | Percy';
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase text-gray-500 mb-1">PERSONAL</div>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        
        <div className="max-w-3xl space-y-8">
          {/* Video Sharing Settings */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Video Sharing Settings</h2>
            <p className="text-sm text-gray-400 mb-6">
              Enabling this feature will send you notifications when someone watched your video for the first time. 
              This feature can help during client outreach.
            </p>
            
            <div className="flex flex-wrap gap-6 mb-6">
              {/* Theme options - showing three theme cards */}
              <div className="w-40 h-32 p-3 bg-white rounded-lg border border-gray-300 flex items-center justify-center">
                <div className="w-full h-full bg-gray-200 rounded flex flex-col">
                  <div className="h-1/3 border-b border-gray-300 flex items-center">
                    <div className="flex gap-1 px-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="flex flex-1">
                    <div className="w-1/3 p-2">
                      <div className="w-full h-3 bg-gray-300 rounded mb-1"></div>
                      <div className="w-full h-3 bg-gray-300 rounded mb-1"></div>
                      <div className="w-full h-3 bg-gray-300 rounded mb-1"></div>
                      <div className="w-full h-3 bg-gray-300 rounded"></div>
                    </div>
                    <div className="w-2/3 p-2">
                      <div className="w-full h-4 bg-gray-300 rounded mb-1"></div>
                      <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-40 h-32 p-3 bg-white rounded-lg border border-gray-300 flex items-center justify-center">
                <div className="w-full h-full bg-gray-200 rounded flex flex-col">
                  <div className="h-1/3 border-b border-gray-300 flex items-center">
                    <div className="flex gap-1 px-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="flex flex-1">
                    <div className="w-1/3 p-2">
                      <div className="w-full h-3 bg-gray-300 rounded mb-1"></div>
                      <div className="w-full h-3 bg-gray-300 rounded mb-1"></div>
                      <div className="w-full h-3 bg-gray-300 rounded mb-1"></div>
                      <div className="w-full h-3 bg-gray-300 rounded"></div>
                    </div>
                    <div className="w-2/3 p-2">
                      <div className="w-full h-4 bg-gray-300 rounded mb-1"></div>
                      <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-40 h-32 p-3 bg-black rounded-lg border border-purple-600 flex items-center justify-center">
                <div className="w-full h-full bg-gray-900 rounded flex flex-col">
                  <div className="h-1/3 border-b border-gray-800 flex items-center">
                    <div className="flex gap-1 px-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="flex flex-1">
                    <div className="w-1/3 p-2">
                      <div className="w-full h-3 bg-gray-800 rounded mb-1"></div>
                      <div className="w-full h-3 bg-gray-800 rounded mb-1"></div>
                      <div className="w-full h-3 bg-gray-800 rounded mb-1"></div>
                      <div className="w-full h-3 bg-gray-800 rounded"></div>
                    </div>
                    <div className="w-2/3 p-2">
                      <div className="w-full h-4 bg-gray-800 rounded mb-1"></div>
                      <div className="w-3/4 h-4 bg-gray-800 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="first-view" 
                checked={firstViewEnabled} 
                onCheckedChange={setFirstViewEnabled}
              />
              <Label htmlFor="first-view">Enable First View</Label>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSettings;
