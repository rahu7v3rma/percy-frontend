import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientAdminLayout from '@/components/layout/ClientAdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getClientGroups, type ClientGroup } from '@/services/clientGroupService';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, MoreVertical, Settings, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

export default function ClientGroupsList() {
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAuthenticated, isClientAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !isClientAdmin) {
      navigate('/login');
      return;
    }

    document.title = 'Client Groups Management';
    fetchClientGroups();
  }, [navigate, isAuthenticated, isClientAdmin]);

  const fetchClientGroups = async () => {
    try {
      const data = await getClientGroups();
      // Filter groups where this client admin is listed as a clientAdmin
      const filteredGroups = data.filter(group => 
        group.clientAdmins.some(admin => admin._id === user?._id)
      );
      setClientGroups(filteredGroups);
    } catch (error) {
      console.error('Error fetching client groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch client groups',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ClientAdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </ClientAdminLayout>
    );
  }

  return (
    <ClientAdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Client Groups Management</h1>
            <p className="text-muted-foreground">Manage your client groups</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{clientGroups.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {clientGroups.reduce((acc, group) => acc + group.users.length, 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {clientGroups.filter(group => group.status === 'active').length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Client Groups</CardTitle>
            <CardDescription>
              All client groups you manage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {clientGroups.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="mx-auto h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium">No client groups yet</h3>
                <p className="mt-2">You don't have any client groups assigned to you yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientGroups.map((group) => (
                    <TableRow key={group._id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={group.status === 'active' ? 'default' : 'destructive'}
                          className={
                            group.status === 'active' 
                              ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' 
                              : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                          }
                        >
                          {group.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{group.users.length}</TableCell>
                      <TableCell>
                        {group.createdBy.username}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {group.createdBy.email}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(group.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => navigate(`/admin/client/groups/${group._id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/admin/client/groups/${group._id}`)}
                            >
                              <Settings className="mr-2 h-4 w-4" />
                              Manage Users
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientAdminLayout>
  );
} 