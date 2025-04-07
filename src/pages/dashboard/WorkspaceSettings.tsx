import { useState } from 'react';
// import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, UserPlus, Settings, Trash2 } from 'lucide-react';
import type { Workspace, WorkspaceMember } from '@/types/workspace';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function WorkspaceSettings() {
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState<WorkspaceMember[]>([
    {
      userId: '1',
      role: 'owner',
      joinedAt: new Date().toISOString(),
    },
    {
      userId: '2',
      role: 'admin',
      joinedAt: new Date().toISOString(),
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');

  const handleInviteMember = () => {
    // TODO: Implement invite functionality
    console.log('Inviting:', inviteEmail, 'as', inviteRole);
    setInviteEmail('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase text-gray-500 mb-1">WORKSPACE</div>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="bg-gray-900 border-b border-gray-800 w-full justify-start rounded-none p-0 h-12">
            <TabsTrigger
              value="members"
              className="data-[state=active]:bg-gray-800 rounded-none h-full px-6"
            >
              Members
            </TabsTrigger>
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-gray-800 rounded-none h-full px-6"
            >
              General
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="data-[state=active]:bg-gray-800 rounded-none h-full px-6"
            >
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-6">
            {/* Invite Members Card */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Invite Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
                    className="bg-gray-800 border-gray-700 rounded-md px-3"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <Button
                    onClick={handleInviteMember}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Members List Card */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {member.userId[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">User {member.userId}</div>
                          <div className="text-sm text-gray-500">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <Badge
                          variant={member.role === 'owner' ? 'default' : 'secondary'}
                          className={
                            member.role === 'owner'
                              ? 'bg-purple-500/20 text-purple-500'
                              : 'bg-gray-700'
                          }
                        >
                          {member.role}
                        </Badge>
                        {member.role !== 'owner' && (
                          <Button variant="ghost" size="icon" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Workspace Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Workspace Name</Label>
                  <Input
                    placeholder="Enter workspace name"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea
                    placeholder="Enter workspace description"
                    className="w-full bg-gray-800 border-gray-700 rounded-md p-2 min-h-[100px]"
                  />
                </div>
                <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium">Require Email for Video Access</div>
                      <div className="text-sm text-gray-500">
                        Viewers must provide their email to watch videos
                      </div>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium">Default Share Link Expiry</div>
                      <div className="text-sm text-gray-500">
                        Set how long share links remain valid
                      </div>
                    </div>
                    <select className="bg-gray-700 border-gray-600 rounded-md px-3 py-1">
                      <option value="7">7 days</option>
                      <option value="30">30 days</option>
                      <option value="never">Never</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-red-500/20">
              <CardHeader>
                <CardTitle className="text-red-500">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="bg-red-500/10 text-red-500">
                  Delete Workspace
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
