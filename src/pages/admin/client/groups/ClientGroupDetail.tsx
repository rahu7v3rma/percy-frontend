import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientAdminLayout from '@/components/layout/ClientAdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  getClientGroup,
  updateClientGroup,
  type ClientGroup,
} from '@/services/clientGroupService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Trash2, UserPlus, Users } from 'lucide-react';
import { getUsers, type User } from '@/services/userManagementService';
import { Badge } from '@/components/ui/badge';
import { getVideos, type Video, associateVideoWithGroup } from '@/services/videoService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ClientGroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const [clientGroup, setClientGroup] = useState<ClientGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [groupVideos, setGroupVideos] = useState<Video[]>([]);
  const [availableVideos, setAvailableVideos] = useState<Video[]>([]);
  const [addVideoDialogOpen, setAddVideoDialogOpen] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const { toast } = useToast();
  const { user, isAuthenticated, isClientAdmin } = useAuth();
  const navigate = useNavigate();


  console.log('inside client group detail')

  // useEffect(() => {
  //   if (!isAuthenticated || !isClientAdmin || !groupId) {
  //     navigate('/login');
  //     return;
  //   }

  //   fetchData();
  // }, [groupId, navigate, isAuthenticated, isClientAdmin]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch client group details
      const groupData = await getClientGroup(groupId as string);
      setClientGroup(groupData);
      document.title = `Client Group: ${groupData.name}`;

      // Fetch all users for adding to the group
      const usersData = await getUsers();
      setAvailableUsers(usersData.filter(u => 
        u.role === 'user' && !groupData.users.some(gu => gu._id === u._id)
      ));

      // Fetch videos
      const allVideos = await getVideos();
      setVideos(allVideos);

      // Filter videos that belong to this group's users
      const userIds = groupData.users.map(u => u._id);
      const groupVids = allVideos.filter(v => 
        typeof v.userId === 'object' && userIds.includes(v.userId._id)
      );
      setGroupVideos(groupVids);

      // Videos available to add (belonging to client admin but not assigned to this group)
      const adminVideos = allVideos.filter(v => 
        typeof v.userId === 'object' && v.userId._id === user?._id
      );
      const videosNotInGroup = adminVideos.filter(v => 
        !groupVids.some(gv => gv._id === v._id)
      );
      setAvailableVideos(videosNotInGroup);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch client group data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUsers = async () => {
    if (!clientGroup || selectedUsers.length === 0) return;
    setProcessing(true);

    try {
      // Filter out selected users from the group
      const updatedUserIds = clientGroup.users
        .filter(user => !selectedUsers.includes(user._id))
        .map(user => user._id);

      await updateClientGroup(clientGroup._id, {
        users: updatedUserIds,
      });

      // Update local state
      setClientGroup(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.filter(user => !selectedUsers.includes(user._id)),
        };
      });

      setSelectedUsers([]);
      toast({
        title: 'Success',
        description: `${selectedUsers.length} users removed from group`,
      });
    } catch (error) {
      console.error('Error removing users:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove users from group',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleAddUsers = async (userIds: string[]) => {
    if (!clientGroup || userIds.length === 0) return;
    setProcessing(true);

    try {
      // Combine existing and new user IDs
      const currentUserIds = clientGroup.users.map(user => user._id);
      const updatedUserIds = [...new Set([...currentUserIds, ...userIds])];

      const updatedGroup = await updateClientGroup(clientGroup._id, {
        users: updatedUserIds,
      });

      // Update local state
      setClientGroup(updatedGroup);
      setAddUserDialogOpen(false);

      // Refresh available users list
      const usersData = await getUsers();
      setAvailableUsers(usersData.filter(u => 
        u.role === 'user' && !updatedGroup.users.some(gu => gu._id === u._id)
      ));

      toast({
        title: 'Success',
        description: `${userIds.length} users added to group`,
      });
    } catch (error) {
      console.error('Error adding users:', error);
      toast({
        title: 'Error',
        description: 'Failed to add users to group',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAddVideos = async () => {
    if (!clientGroup || selectedVideos.length === 0) return;
    setProcessing(true);

    try {
      // Associate each selected video with the group
      const promises = selectedVideos.map(videoId => 
        associateVideoWithGroup(videoId, clientGroup._id)
      );
      await Promise.all(promises);

      // Refresh data
      await fetchData();
      setSelectedVideos([]);
      setAddVideoDialogOpen(false);

      toast({
        title: 'Success',
        description: `${selectedVideos.length} videos added to group`,
      });
    } catch (error) {
      console.error('Error adding videos:', error);
      toast({
        title: 'Error',
        description: 'Failed to add videos to group',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos(prev =>
      prev.includes(videoId)
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const toggleSelectAllUsers = () => {
    if (clientGroup) {
      if (selectedUsers.length === clientGroup.users.length) {
        setSelectedUsers([]);
      } else {
        setSelectedUsers(clientGroup.users.map(user => user._id));
      }
    }
  };

  const toggleSelectAllVideos = () => {
    if (availableVideos.length > 0) {
      if (selectedVideos.length === availableVideos.length) {
        setSelectedVideos([]);
      } else {
        setSelectedVideos(availableVideos.map(video => video._id));
      }
    }
  };

  const filteredAvailableUsers = availableUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <ClientAdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </ClientAdminLayout>
    );
  }

  if (!clientGroup) {
    return (
      <ClientAdminLayout>
        <div className="p-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <h3 className="text-lg font-medium">Client group not found</h3>
                <p className="mt-2">The requested client group does not exist or you don't have access</p>
                <Button className="mt-4" onClick={() => navigate('/admin/client/groups')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Groups
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ClientAdminLayout>
    );
  }

  return (
    <ClientAdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/client/groups')}
              className="mb-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Groups
            </Button>
            <h1 className="text-2xl font-bold">{clientGroup.name}</h1>
            <p className="text-muted-foreground">{clientGroup.description || 'No description'}</p>
          </div>
          <Badge
            variant={clientGroup.status === 'active' ? 'default' : 'destructive'}
            className={
              clientGroup.status === 'active'
                ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
            }
          >
            {clientGroup.status}
          </Badge>
        </div>

        {/* Tabs for Users and Videos */}
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Users in Group</CardTitle>
                  <div className="flex gap-2">
                    {selectedUsers.length > 0 && (
                      <Button
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                        disabled={processing}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove Selected ({selectedUsers.length})
                      </Button>
                    )}
                    <Button onClick={() => setAddUserDialogOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Users
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {clientGroup.users.length} users in this group
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clientGroup.users.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="mx-auto h-12 w-12 mb-4" />
                    <h3 className="text-lg font-medium">No users yet</h3>
                    <p className="mt-2">Add users to this client group to get started</p>
                    <Button className="mt-4" onClick={() => setAddUserDialogOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Users
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={selectedUsers.length === clientGroup.users.length && clientGroup.users.length > 0}
                            onCheckedChange={toggleSelectAllUsers}
                            aria-label="Select all users"
                          />
                        </TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clientGroup.users.map((user) => (
                        <TableRow
                          key={user._id}
                          className={selectedUsers.includes(user._id) ? "bg-muted/30" : ""}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.includes(user._id)}
                              onCheckedChange={() => toggleUserSelection(user._id)}
                              aria-label={`Select ${user.username}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Videos Available to Group</CardTitle>
                  <Button 
                    onClick={() => setAddVideoDialogOpen(true)}
                    disabled={availableVideos.length === 0}
                  >
                    Add Videos to Group
                  </Button>
                </div>
                <CardDescription>
                  {groupVideos.length} videos available to this group
                </CardDescription>
              </CardHeader>
              <CardContent>
                {groupVideos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <h3 className="text-lg font-medium">No videos yet</h3>
                    <p className="mt-2">Add videos to this client group to allow access</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Uploader</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Added At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupVideos.map((video) => (
                        <TableRow key={video._id}>
                          <TableCell className="font-medium">{video.title}</TableCell>
                          <TableCell>
                            {video.uploader?.username || 'Unknown'}
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {video.uploader?.email || ''}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={video.status === 'ready' ? 'default' : 'secondary'}
                              className={
                                video.status === 'ready'
                                  ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                  : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                              }
                            >
                              {video.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(video.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add User Dialog */}
        <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Users to Group</DialogTitle>
              <DialogDescription>
                Select users to add to this client group
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4"
              />
              <div className="max-h-[300px] overflow-y-auto border rounded-md">
                {filteredAvailableUsers.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p>No users available to add</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAvailableUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <Checkbox
                              id={`user-${user._id}`}
                              checked={selectedUsers.includes(user._id)}
                              onCheckedChange={() => toggleUserSelection(user._id)}
                            />
                          </TableCell>
                          <TableCell>
                            <label
                              htmlFor={`user-${user._id}`}
                              className="font-medium cursor-pointer"
                            >
                              {user.username}
                            </label>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => handleAddUsers(selectedUsers)}
                disabled={selectedUsers.length === 0 || processing}
              >
                {processing ? 'Adding...' : `Add Users (${selectedUsers.length})`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Users Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Users</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {selectedUsers.length} users from this group?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={processing}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRemoveUsers} disabled={processing}>
                {processing ? 'Removing...' : 'Remove Users'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Videos Dialog */}
        <Dialog open={addVideoDialogOpen} onOpenChange={setAddVideoDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Videos to Group</DialogTitle>
              <DialogDescription>
                Select videos to add to this client group
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="max-h-[300px] overflow-y-auto border rounded-md">
                {availableVideos.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p>No videos available to add</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={selectedVideos.length === availableVideos.length && availableVideos.length > 0}
                            onCheckedChange={toggleSelectAllVideos}
                            aria-label="Select all videos"
                          />
                        </TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableVideos.map((video) => (
                        <TableRow 
                          key={video._id}
                          className={selectedVideos.includes(video._id) ? "bg-muted/30" : ""}
                        >
                          <TableCell>
                            <Checkbox
                              id={`video-${video._id}`}
                              checked={selectedVideos.includes(video._id)}
                              onCheckedChange={() => toggleVideoSelection(video._id)}
                            />
                          </TableCell>
                          <TableCell>
                            <label
                              htmlFor={`video-${video._id}`}
                              className="font-medium cursor-pointer"
                            >
                              {video.title}
                            </label>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={video.status === 'ready' ? 'default' : 'secondary'}
                              className={
                                video.status === 'ready'
                                  ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                                  : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
                              }
                            >
                              {video.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddVideoDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddVideos}
                disabled={selectedVideos.length === 0 || processing}
              >
                {processing ? 'Adding...' : `Add Videos (${selectedVideos.length})`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ClientAdminLayout>
  );
} 