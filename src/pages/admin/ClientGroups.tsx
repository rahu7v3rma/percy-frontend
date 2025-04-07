import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Plus, Pencil, Trash2, Users, ExternalLink } from "lucide-react";
import {
  getClientGroups,
  createClientGroup,
  updateClientGroup,
  deleteClientGroup,
  type ClientGroup,
  type CreateClientGroupData,
  type UpdateClientGroupData,
} from "@/services/clientGroupService";
import { useAuth } from "@/hooks/useAuth";
import UserSelectMulti from "@/components/UserSelectMulti";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ClientGroups() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ClientGroup | null>(null);
  const [formData, setFormData] = useState<CreateClientGroupData>({
    name: "",
    description: "",
    clientAdmins: [],
    users: [],
  });

  useEffect(() => {
    fetchClientGroups();
  }, []);

  const fetchClientGroups = async () => {
    try {
      const data = await getClientGroups();
      setClientGroups(data);
    } catch (error) {
      console.error("Error fetching client groups:", error);
      toast({
        title: "Error",
        description: "Failed to fetch client groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await updateClientGroup(
          editingGroup._id,
          formData as UpdateClientGroupData
        );
        toast({
          title: "Success",
          description: "Client group updated successfully",
        });
      } else {
        await createClientGroup(formData);
        toast({
          title: "Success",
          description: "Client group created successfully",
        });
      }
      setIsDialogOpen(false);
      setEditingGroup(null);
      setFormData({
        name: "",
        description: "",
        clientAdmins: [],
        users: [],
      });
      fetchClientGroups();
    } catch (error) {
      console.error("Error saving client group:", error);
      toast({
        title: "Error",
        description: "Failed to save client group",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this client group?")) {
      return;
    }

    try {
      await deleteClientGroup(id);
      toast({
        title: "Success",
        description: "Client group deleted successfully",
      });
      fetchClientGroups();
    } catch (error) {
      console.error("Error deleting client group:", error);
      toast({
        title: "Error",
        description: "Failed to delete client group",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (group: ClientGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      clientAdmins: group.clientAdmins.map((admin) => admin._id),
      users: group.users.map((user) => user._id),
    });
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Client Groups</h1>
            <p className="text-muted-foreground">
              Manage client groups and their members
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Client Group
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingGroup ? "Edit Client Group" : "Create Client Group"}
                </DialogTitle>
                <DialogDescription>
                  {editingGroup
                    ? "Update the client group details below."
                    : "Fill in the details to create a new client group."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="admins">Client Admins</TabsTrigger>
                    <TabsTrigger value="users">Users</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="admins" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientAdmins">
                        Client Administrators
                      </Label>
                      <UserSelectMulti
                        selectedUserIds={formData.clientAdmins || []}
                        onChange={(selectedIds) =>
                          setFormData({
                            ...formData,
                            clientAdmins: selectedIds,
                          })
                        }
                        placeholder="Select client admins"
                        filterRole="client-admin"
                      />
                      <p className="text-sm text-muted-foreground pt-2">
                        These users will be able to manage content for this
                        client group.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="users" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="users">Users</Label>
                      <UserSelectMulti
                        selectedUserIds={formData.users || []}
                        onChange={(selectedIds) =>
                          setFormData({ ...formData, users: selectedIds })
                        }
                        placeholder="Select users"
                        filterRole="user"
                      />
                      <p className="text-sm text-muted-foreground pt-2">
                        Regular users who will be part of this client group.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingGroup ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client Groups List</CardTitle>
            <CardDescription>
              View and manage all client groups in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Client Admins</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No client groups found. Create one to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    clientGroups.map((group) => (
                      <TableRow key={group._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Link
                              to={`/admin/client-groups/${group._id}`}
                              className="hover:underline flex items-center"
                            >
                              {group.name}
                              <ExternalLink className="ml-1 h-3 w-3" />
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>
                          {group.description || "No description"}
                        </TableCell>
                        <TableCell>
                          {group.clientAdmins.length > 0 ? (
                            <div className="flex flex-col gap-1">
                              {group.clientAdmins.map((admin) => (
                                <span key={admin._id} className="text-sm">
                                  {admin.username}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "None"
                          )}
                        </TableCell>
                        <TableCell>
                          {group.users.length > 0 ? (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              <span>{group.users.length}</span>
                            </div>
                          ) : (
                            "None"
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              group.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {group.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(group)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(group._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Link to={`/admin/client-groups/${group._id}`}>
                              <Button variant="outline" size="icon">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
