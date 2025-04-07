import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Users } from "lucide-react"
import { DataTable } from "./components/DataTable"
import { columns } from "./components/Columns"
import { UserForm } from "./components/UserForm"
import { useState, useEffect } from "react"
import DashboardLayout from "@/components/layout/DashboardLayout"
// import DashboardLayout from "@/components/DashboardLayout"

const data = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "User",
    status: "Active",
  },
]

export default function AdminDashboard() {
  const [userFormOpen, setUserFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<typeof data[0] | undefined>()

  useEffect(() => {
    document.title = 'Admin Dashboard | Percy';
  }, []);

  const handleEditUser = (user: typeof data[0]) => {
    setSelectedUser(user)
    setUserFormOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase text-gray-500 mb-1">ADMIN</div>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">User Management</h1>
            <Button 
              onClick={() => {
                setSelectedUser(undefined)
                setUserFormOpen(true)
              }}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add New User
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">245</div>
              <div className="text-xs text-gray-500">+12% from last month</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">189</div>
              <div className="text-xs text-gray-500">Active in last 30 days</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">12</div>
              <div className="text-xs text-gray-500">Manage platform</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">2</div>
              <div className="text-xs text-gray-500">Full access</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <Tabs defaultValue="all-users" className="space-y-4">
                <TabsList className="bg-gray-800 border-gray-700">
                  <TabsTrigger value="all-users" className="data-[state=active]:bg-gray-700">All Users</TabsTrigger>
                  <TabsTrigger value="admins" className="data-[state=active]:bg-gray-700">Admins</TabsTrigger>
                  <TabsTrigger value="super-admins" className="data-[state=active]:bg-gray-700">Super Admins</TabsTrigger>
                </TabsList>
                <TabsContent value="all-users" className="space-y-4">
                  <div className="rounded-md border border-gray-800">
                    <DataTable columns={columns} data={data} />
                  </div>
                </TabsContent>
                <TabsContent value="admins" className="space-y-4">
                  <div className="rounded-md border border-gray-800">
                    <DataTable columns={columns} data={data.filter(user => user.role === "Admin")} />
                  </div>
                </TabsContent>
                <TabsContent value="super-admins" className="space-y-4">
                  <div className="rounded-md border border-gray-800">
                    <DataTable columns={columns} data={data.filter(user => user.role === "Super Admin")} />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <UserForm 
          open={userFormOpen}
          onOpenChange={setUserFormOpen}
          user={selectedUser}
        />
      </div>
    </DashboardLayout>
  )
}
