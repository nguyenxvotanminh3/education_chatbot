import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  School, 
  FileText, 
  Users, 
  Upload, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  BarChart3,
  BookOpen,
  GraduationCap,
  MessageSquare,
  HardDrive
} from 'lucide-react';
import { mockSchools, mockDocuments, mockUsers, mockStatistics, standards, subjects } from '../data/mockData';
import { School as SchoolType, Document as DocumentType, AdminUser } from '../types';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [schools] = useState<SchoolType[]>(mockSchools);
  const [documents] = useState<DocumentType[]>(mockDocuments);
  const [users] = useState<AdminUser[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);

  // Statistics
  const stats = mockStatistics;

  // Filter functions
  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Education Chatbot Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                System Online
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Navigation */}
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="schools" className="flex items-center gap-2">
              <School className="w-4 h-4" />
              Schools
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalStudents} students, {stats.totalTeachers} teachers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
                  <School className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSchools}</div>
                  <p className="text-xs text-muted-foreground">
                    Across multiple countries
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Documents</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDocuments.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Master training files
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalChats.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeToday} active today
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Activity & Storage */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Latest user and system activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New document uploaded</p>
                        <p className="text-xs text-muted-foreground">Grade 10 Physics - 2 mins ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New user registered</p>
                        <p className="text-xs text-muted-foreground">Student - Springfield High - 15 mins ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Document indexed successfully</p>
                        <p className="text-xs text-muted-foreground">Grade 7 Math Algebra - 1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5" />
                    Storage Usage
                  </CardTitle>
                  <CardDescription>Document storage and indexing status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Total Storage</span>
                        <span className="text-sm text-muted-foreground">
                          {(stats.storageUsed / 1024).toFixed(2)} GB / 100 GB
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2" 
                          style={{ width: `${(stats.storageUsed / 1024 / 100) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Indexed Documents</span>
                        <span className="font-medium">{documents.filter(d => d.indexed).length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Pending Indexing</span>
                        <span className="font-medium text-orange-500">{documents.filter(d => !d.indexed).length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Files</span>
                        <span className="font-medium">{documents.length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Schools Tab */}
          <TabsContent value="schools" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>School Management</CardTitle>
                    <CardDescription>Manage schools and their information</CardDescription>
                  </div>
                  <Dialog open={isAddSchoolOpen} onOpenChange={setIsAddSchoolOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add School
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New School</DialogTitle>
                        <DialogDescription>Create a new school in the system</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="school-name">School Name</Label>
                          <Input id="school-name" placeholder="Enter school name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="school-address">Address</Label>
                          <Input id="school-address" placeholder="Enter address" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="school-country">Country</Label>
                          <Input id="school-country" placeholder="Enter country" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddSchoolOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => {
                          // Add school logic here
                          setIsAddSchoolOpen(false);
                        }}>
                          Create School
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search schools..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>School Name</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Teachers</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSchools.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No schools found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSchools.map((school) => (
                          <TableRow key={school.id}>
                            <TableCell className="font-medium">{school.name}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{school.country}</div>
                                <div className="text-muted-foreground text-xs">{school.address}</div>
                              </div>
                            </TableCell>
                            <TableCell>{school.totalStudents}</TableCell>
                            <TableCell>{school.totalTeachers}</TableCell>
                            <TableCell>{school.createdAt}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Document Management</CardTitle>
                    <CardDescription>Upload and manage master training files</CardDescription>
                  </div>
                  <Dialog open={isUploadDocOpen} onOpenChange={setIsUploadDocOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Upload Master Training File</DialogTitle>
                        <DialogDescription>
                          Upload educational content that will be indexed for AI responses
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="doc-name">Document Name</Label>
                          <Input id="doc-name" placeholder="Enter document name" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="doc-school">School</Label>
                            <Select>
                              <SelectTrigger id="doc-school">
                                <SelectValue placeholder="Select school" />
                              </SelectTrigger>
                              <SelectContent>
                                {schools.map((school) => (
                                  <SelectItem key={school.id} value={school.id}>
                                    {school.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="doc-standard">Grade/Standard</Label>
                            <Select>
                              <SelectTrigger id="doc-standard">
                                <SelectValue placeholder="Select grade" />
                              </SelectTrigger>
                              <SelectContent>
                                {standards.map((standard) => (
                                  <SelectItem key={standard} value={standard}>
                                    {standard}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="doc-subject">Subject</Label>
                          <Select>
                            <SelectTrigger id="doc-subject">
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="doc-file">File Upload</Label>
                          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PDF, DOC, DOCX up to 50MB
                            </p>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadDocOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => {
                          // Upload logic here
                          setIsUploadDocOpen(false);
                        }}>
                          Upload & Index
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search documents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document Name</TableHead>
                        <TableHead>School</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No documents found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredDocuments.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                {doc.name}
                              </div>
                            </TableCell>
                            <TableCell>{doc.schoolName}</TableCell>
                            <TableCell>{doc.standard}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{doc.subject}</Badge>
                            </TableCell>
                            <TableCell>{doc.fileSize.toFixed(1)} MB</TableCell>
                            <TableCell>
                              {doc.indexed ? (
                                <Badge variant="default" className="bg-green-500">Indexed</Badge>
                              ) : (
                                <Badge variant="secondary">Pending</Badge>
                              )}
                            </TableCell>
                            <TableCell>{doc.uploadedAt}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage system users</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>School</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No users found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  user.role === 'admin' ? 'destructive' : 
                                  user.role === 'teacher' ? 'default' : 
                                  'secondary'
                                }
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.schoolName || '-'}</TableCell>
                            <TableCell>{user.standard || '-'}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={user.status === 'active' ? 'default' : 'secondary'}
                                className={user.status === 'active' ? 'bg-green-500' : ''}
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{user.lastActive}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;
