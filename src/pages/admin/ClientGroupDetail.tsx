import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { 
  ArrowLeft, 
  UserPlus, 
  Users, 
  TrashIcon, 
  MoreHorizontal,
  BadgeCheck,
  Loader2
} from "lucide-react";
import {
  getClientGroup,
  updateClientGroup,
  type ClientGroup,
  type UpdateClientGroupData,
} from "@/services/clientGroupService";
import { useAuth } from "@/hooks/useAuth";
import UserSelectMulti from "@/components/UserSelectMulti";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { createUser } from "@/services/userManagementService";

export default function ClientGroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clientGroup, setClientGroup] = useState<ClientGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddUsersDialogOpen, setIsAddUsersDialogOpen] = useState(false);
  const [isAddAdminsDialogOpen, setIsAddAdminsDialogOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedAdminIds, setSelectedAdminIds] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedAdmins, setSelectedAdmins] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'users' | 'admins'>('users');
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  console.log('client group detail')

  useEffect(() => {
    if (groupId) {
      fetchClientGroup();
    }
  }, [groupId]);

  const fetchClientGroup = async () => {
    try {
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      setLoading(true);
      const data = await getClientGroup(groupId!);
      setClientGroup(data);
    } catch (error: unknown) {
      console.error("Error fetching client group:", error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message && (
        error.message.includes('session has expired') || 
        error.message.includes('Authentication token is missing') ||
        error.message.includes('not authenticated')
      )) {
        toast({
          title: "Authentication Error",
          description: error.message || "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch client group",
          variant: "destructive",
        });
        // Navigate back to client groups list if there's an error
        navigate("/admin/client-groups");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddUsers = async () => {
    if (!selectedUserIds.length || !clientGroup) return;

    try {
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      const updatedData: UpdateClientGroupData = {
        users: [...(clientGroup.users.map(u => u._id)), ...selectedUserIds]
      };
      
      await updateClientGroup(clientGroup._id, updatedData);
      
      toast({
        title: "Success",
        description: "Users added to client group successfully",
      });
      
      setIsAddUsersDialogOpen(false);
      setSelectedUserIds([]);
      fetchClientGroup();
    } catch (error: unknown) {
      console.error("Error adding users:", error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message && (
        error.message.includes('session has expired') || 
        error.message.includes('Authentication token is missing')
      )) {
        toast({
          title: "Authentication Error",
          description: error.message || "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        toast({
          title: "Error",
          description: "Failed to add users to client group",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddAdmins = async () => {
    if (!selectedAdminIds.length || !clientGroup) return;
    
    try {
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      const updatedData: UpdateClientGroupData = {
        clientAdmins: [...(clientGroup.clientAdmins.map(a => a._id)), ...selectedAdminIds]
      };
      
      await updateClientGroup(clientGroup._id, updatedData);
      
      toast({
        title: "Success",
        description: "Client admins added to client group successfully",
      });
      
      setIsAddAdminsDialogOpen(false);
      setSelectedAdminIds([]);
      fetchClientGroup();
    } catch (error: unknown) {
      console.error("Error adding client admins:", error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message && (
        error.message.includes('session has expired') || 
        error.message.includes('Authentication token is missing')
      )) {
        toast({
          title: "Authentication Error",
          description: error.message || "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        toast({
          title: "Error",
          description: "Failed to add client admins to client group",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!clientGroup) return;
    
    if (!window.confirm("Are you sure you want to remove this user from the client group?")) {
      return;
    }
    
    try {
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      const updatedData: UpdateClientGroupData = {
        users: clientGroup.users.filter(u => u._id !== userId).map(u => u._id)
      };
      
      await updateClientGroup(clientGroup._id, updatedData);
      
      toast({
        title: "Success",
        description: "User removed from client group",
      });
      
      fetchClientGroup();
    } catch (error: unknown) {
      console.error("Error removing user:", error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message && (
        error.message.includes('session has expired') || 
        error.message.includes('Authentication token is missing')
      )) {
        toast({
          title: "Authentication Error",
          description: error.message || "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        toast({
          title: "Error",
          description: "Failed to remove user from client group",
          variant: "destructive",
        });
      }
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (!clientGroup) return;
    
    if (!window.confirm("Are you sure you want to remove this client admin from the client group?")) {
      return;
    }
    
    try {
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      const updatedData: UpdateClientGroupData = {
        clientAdmins: clientGroup.clientAdmins.filter(a => a._id !== adminId).map(a => a._id)
      };
      
      await updateClientGroup(clientGroup._id, updatedData);
      
      toast({
        title: "Success",
        description: "Client admin removed from client group",
      });
      
      fetchClientGroup();
    } catch (error: unknown) {
      console.error("Error removing client admin:", error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message && (
        error.message.includes('session has expired') || 
        error.message.includes('Authentication token is missing')
      )) {
        toast({
          title: "Authentication Error",
          description: error.message || "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        toast({
          title: "Error",
          description: "Failed to remove client admin from client group",
          variant: "destructive",
        });
      }
    }
  };

  const handleBatchDelete = async () => {
    if (!clientGroup) return;
    
    try {
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }
      
      let updatedData: UpdateClientGroupData = {};
      
      if (deleteType === 'users') {
        if (selectedUsers.length === 0) return;
        
        updatedData = {
          users: clientGroup.users
            .filter(u => !selectedUsers.includes(u._id))
            .map(u => u._id)
        };
      } else {
        if (selectedAdmins.length === 0) return;
        
        updatedData = {
          clientAdmins: clientGroup.clientAdmins
            .filter(a => !selectedAdmins.includes(a._id))
            .map(a => a._id)
        };
      }
      
      await updateClientGroup(clientGroup._id, updatedData);
      
      toast({
        title: "Success",
        description: deleteType === 'users' 
          ? `${selectedUsers.length} users removed from client group`
          : `${selectedAdmins.length} client admins removed from client group`,
      });
      
      // Clear selections and close dialog
      if (deleteType === 'users') {
        setSelectedUsers([]);
      } else {
        setSelectedAdmins([]);
      }
      setIsDeleteDialogOpen(false);
      fetchClientGroup();
    } catch (error: unknown) {
      console.error("Error removing items:", error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message && (
        error.message.includes('session has expired') || 
        error.message.includes('Authentication token is missing')
      )) {
        toast({
          title: "Authentication Error",
          description: error.message || "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        navigate('/login');
      } else {
        toast({
          title: "Error",
          description: `Failed to remove ${deleteType}`,
          variant: "destructive",
        });
      }
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  const toggleAdminSelection = (adminId: string) => {
    setSelectedAdmins(prev => 
      prev.includes(adminId) 
        ? prev.filter(id => id !== adminId) 
        : [...prev, adminId]
    );
  };

  const selectAllUsers = () => {
    if (clientGroup) {
      if (selectedUsers.length === clientGroup.users.length) {
        setSelectedUsers([]);
      } else {
        setSelectedUsers(clientGroup.users.map(u => u._id));
      }
    }
  };

  const selectAllAdmins = () => {
    if (clientGroup) {
      if (selectedAdmins.length === clientGroup.clientAdmins.length) {
        setSelectedAdmins([]);
      } else {
        setSelectedAdmins(clientGroup.clientAdmins.map(a => a._id));
      }
    }
  };

  const handleCreateUser = async () => {
    // Validate input
    if (!newUserData.username || !newUserData.email || !newUserData.password) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    // Validate password length
    if (newUserData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    // Validate password match
    if (newUserData.password !== newUserData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setPasswordError("");
    setIsCreatingUser(true);

    try {
      // First, create the user
      const newUser = await createUser({
        username: newUserData.username,
        email: newUserData.email,
        password: newUserData.password
      });
      
      console.log("User created successfully:", newUser);
      
      // Success message for user creation
      toast({
        title: "Success",
        description: "User created successfully. Adding to client group...",
      });
      
      // Close the dialog and reset form immediately for better UX
      setIsCreateUserDialogOpen(false);
      setNewUserData({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
      });
      
      // Refresh the client group to get fresh data
      await fetchClientGroup();
      
      // Now add the user to the client group in a separate operation
      if (groupId && clientGroup) {
        // Create a clean array of valid user IDs
        const cleanUserIds = [];
        
        // Only add IDs that are valid strings
        if (clientGroup.users && Array.isArray(clientGroup.users)) {
          for (const user of clientGroup.users) {
            if (user && typeof user._id === 'string' && user._id.length > 0) {
              cleanUserIds.push(user._id);
            }
          }
        }
        
        // Add the new user ID
        if (newUser && newUser._id) {
          cleanUserIds.push(newUser._id);
        }
        
        // Update the client group with the clean array
        const updateResponse = await updateClientGroup(groupId, {
          users: cleanUserIds
        });
        
        console.log("Client group updated:", updateResponse);
        
        // Final success message
        toast({
          title: "Success",
          description: "User added to client group successfully",
        });
        
        // Refresh the client group data again
        fetchClientGroup();
      }
    } catch (error: unknown) {
      console.error("Error in user creation process:", error);
      
      // Generic error handling
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user or add to client group",
        variant: "destructive",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear password error when user starts typing again
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!clientGroup) {
    return (
      <AdminLayout>
        <div className="container mx-auto py-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Client Group Not Found</h2>
            <p className="mt-2">The client group you are looking for does not exist or has been deleted.</p>
            <Button className="mt-4" onClick={() => navigate("/admin/client-groups")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Client Groups
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={() => navigate("/admin/client-groups")} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{clientGroup.name}</h1>
            <p className="text-muted-foreground">{clientGroup.description || "No description"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Group Info</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                  <dd className="mt-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        clientGroup.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {clientGroup.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created By</dt>
                  <dd className="mt-1">{clientGroup.createdBy.username}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created On</dt>
                  <dd className="mt-1">{new Date(clientGroup.createdAt).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                  <dd className="mt-1">{new Date(clientGroup.updatedAt).toLocaleDateString()}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Client Admins</CardTitle>
              <Dialog open={isAddAdminsDialogOpen} onOpenChange={setIsAddAdminsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Admins
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Client Admins</DialogTitle>
                    <DialogDescription>
                      Select client admins to add to this client group.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Client Admins</Label>
                      <UserSelectMulti
                        selectedUserIds={selectedAdminIds}
                        onChange={setSelectedAdminIds}
                        placeholder="Select client admins"
                        filterRole="client-admin"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsAddAdminsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddAdmins} disabled={!selectedAdminIds.length}>
                        Add Selected Admins
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {clientGroup.clientAdmins.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <BadgeCheck className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No client admins assigned yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setIsAddAdminsDialogOpen(true)}
                  >
                    Add Client Admins
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {clientGroup.clientAdmins.map((admin) => (
                    <div key={admin._id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                      <div>
                        <p className="font-medium">{admin.username}</p>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveAdmin(admin._id)}
                      >
                        <TrashIcon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Users</CardTitle>
                <CardDescription>
                  {clientGroup.users.length} total users
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Dialog open={isAddUsersDialogOpen} onOpenChange={setIsAddUsersDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add Users
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Users</DialogTitle>
                      <DialogDescription>
                        Select users to add to this client group.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Users</Label>
                        <UserSelectMulti
                          selectedUserIds={selectedUserIds}
                          onChange={setSelectedUserIds}
                          placeholder="Select users"
                          filterRole="user"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button variant="outline" onClick={() => setIsAddUsersDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddUsers} disabled={!selectedUserIds.length}>
                          Add Selected Users
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create User</DialogTitle>
                      <DialogDescription>
                        Enter user details to create a new user and add them to this client group.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Username</Label>
                        <Input
                          name="username"
                          value={newUserData.username}
                          onChange={handleInputChange}
                          placeholder="Enter username"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          name="email"
                          value={newUserData.email}
                          onChange={handleInputChange}
                          placeholder="Enter email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                          type="password"
                          name="password"
                          value={newUserData.password}
                          onChange={handleInputChange}
                          placeholder="Enter password"
                        />
                        {passwordError && (
                          <p className="text-sm text-red-500 mt-1">{passwordError}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm Password</Label>
                        <Input
                          type="password"
                          name="confirmPassword"
                          value={newUserData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Enter password again"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setIsCreateUserDialogOpen(false)}
                          disabled={isCreatingUser}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateUser} 
                          disabled={isCreatingUser || !newUserData.username || !newUserData.email || !newUserData.password}
                        >
                          {isCreatingUser ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create User'
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {clientGroup.users.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Users className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>No users assigned yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setIsAddUsersDialogOpen(true)}
                  >
                    Add Users
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {clientGroup.users.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemoveUser(user._id)}
                      >
                        <TrashIcon className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Users in Client Group</CardTitle>
            <CardDescription>
              Manage all users associated with this client group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="users">
              <TabsList className="mb-4">
                <TabsTrigger value="users">Regular Users</TabsTrigger>
                <TabsTrigger value="admins">Client Admins</TabsTrigger>
              </TabsList>
              
              <TabsContent value="users">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="selectAllUsers" 
                      checked={clientGroup.users.length > 0 && selectedUsers.length === clientGroup.users.length} 
                      onClick={selectAllUsers}
                    />
                    <label htmlFor="selectAllUsers" className="text-sm cursor-pointer">Select All</label>
                    
                    {selectedUsers.length > 0 && (
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => {
                          setDeleteType('users');
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <TrashIcon className="mr-2 h-4 w-4" />
                        Delete Selected ({selectedUsers.length})
                      </Button>
                    )}
                  </div>
                  
                  <Button onClick={() => setIsAddUsersDialogOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Users
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">Select</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientGroup.users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No users in this client group
                        </TableCell>
                      </TableRow>
                    ) : (
                      clientGroup.users.map((user) => (
                        <TableRow key={user._id} className={selectedUsers.includes(user._id) ? "bg-muted" : ""}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedUsers.includes(user._id)} 
                              onClick={() => toggleUserSelection(user._id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleRemoveUser(user._id)}
                                >
                                  <TrashIcon className="mr-2 h-4 w-4" />
                                  Remove from group
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="admins">
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setIsAddAdminsDialogOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Client Admins
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientGroup.clientAdmins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center">
                          No client admins in this client group
                        </TableCell>
                      </TableRow>
                    ) : (
                      clientGroup.clientAdmins.map((admin) => (
                        <TableRow key={admin._id}>
                          <TableCell className="font-medium">{admin.username}</TableCell>
                          <TableCell>{admin.email}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleRemoveAdmin(admin._id)}
                                >
                                  <TrashIcon className="mr-2 h-4 w-4" />
                                  Remove from group
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              {deleteType === 'users' 
                ? `Are you sure you want to remove ${selectedUsers.length} users from this client group?` 
                : `Are you sure you want to remove ${selectedAdmins.length} client admins from this client group?`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBatchDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
} 