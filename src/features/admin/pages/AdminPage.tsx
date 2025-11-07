import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  HardDrive,
  CreditCard,
  RefreshCcw,
  UserCircle,
  ClipboardList,
  Globe,
  Settings2,
  ShieldCheck,
  Home,
} from 'lucide-react';
import {
  mockSchools,
  mockDocuments,
  mockUsers,
  mockStatistics,
  mockOrders,
  mockHomeContent,
  standards,
  subjects,
} from '../data/mockData';
import {
  School as SchoolType,
  Document as DocumentType,
  AdminUser,
  Order,
  HomePageContent,
} from '../types';

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [schools] = useState<SchoolType[]>(mockSchools);
  const [documents] = useState<DocumentType[]>(mockDocuments);
  const [users] = useState<AdminUser[]>(mockUsers);
  const [orders] = useState<Order[]>(mockOrders);
  const [homeContent, setHomeContent] = useState<HomePageContent>(mockHomeContent);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(mockUsers[0] ?? null);
  const [schoolSearch, setSchoolSearch] = useState('');
  const [documentSearch, setDocumentSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [announcementsInput, setAnnouncementsInput] = useState(
    mockHomeContent.announcements.join('\n')
  );
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);
  const [isUploadDocOpen, setIsUploadDocOpen] = useState(false);

  // Statistics
  const stats = mockStatistics;

  const userIndex = useMemo(() => {
    const map = new Map<string, AdminUser>();
    users.forEach((user) => map.set(user.id, user));
    return map;
  }, [users]);

  // Filter functions
  const filteredSchools = useMemo(
    () =>
      schools.filter((school) =>
        [school.name, school.country, school.address]
          .join(' ')
          .toLowerCase()
          .includes(schoolSearch.toLowerCase())
      ),
    [schools, schoolSearch]
  );

  const filteredDocuments = useMemo(
    () =>
      documents.filter((doc) =>
        [doc.name, doc.schoolName, doc.subject, doc.standard]
          .join(' ')
          .toLowerCase()
          .includes(documentSearch.toLowerCase())
      ),
    [documents, documentSearch]
  );

  const filteredUsers = useMemo(
    () =>
      users.filter((user) =>
        [user.name, user.email, user.role, user.location, user.plan, user.subscriptionStatus]
          .join(' ')
          .toLowerCase()
          .includes(userSearch.toLowerCase())
      ),
    [users, userSearch]
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) =>
        [order.id, order.userName, order.userEmail, order.plan, order.status]
          .join(' ')
          .toLowerCase()
          .includes(orderSearch.toLowerCase())
      ),
    [orders, orderSearch]
  );

  const activePaidOrders = useMemo(
    () => orders.filter((order) => order.status === 'paid' && order.isActive),
    [orders]
  );

  const refundedAmount = useMemo(
    () =>
      orders
        .filter((order) => order.status === 'refunded')
        .reduce((total, order) => total + order.amount, 0),
    [orders]
  );

  const pastDueSubscriptions = useMemo(
    () => users.filter((user) => user.subscriptionStatus === 'past_due').length,
    [users]
  );

  const trialingUsers = useMemo(
    () => users.filter((user) => user.subscriptionStatus === 'trialing').length,
    [users]
  );

  const locationSummary = useMemo(() => {
    const counts = new Map<string, number>();
    users.forEach((user) => {
      const parts = user.location.split(',');
      const country = parts[parts.length - 1].trim();
      counts.set(country, (counts.get(country) ?? 0) + 1);
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [users]);

  const updateHeroContent = (field: keyof HomePageContent['hero'], value: string) => {
    setHomeContent((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value,
      },
    }));
  };

  const updatePlaceholder = (
    field: keyof HomePageContent['placeholders'],
    value: string
  ) => {
    setHomeContent((prev) => ({
      ...prev,
      placeholders: {
        ...prev.placeholders,
        [field]: value,
      },
    }));
  };

  const updateHighlight = (
    id: string,
    field: 'title' | 'description',
    value: string
  ) => {
    setHomeContent((prev) => ({
      ...prev,
      highlights: prev.highlights.map((highlight) =>
        highlight.id === id
          ? {
              ...highlight,
              [field]: value,
            }
          : highlight
      ),
    }));
  };

  const handleAnnouncementsChange = (value: string) => {
    setAnnouncementsInput(value);
    setHomeContent((prev) => ({
      ...prev,
      announcements: value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    }));
  };

  const resetHomeContent = () => {
    setHomeContent(mockHomeContent);
    setAnnouncementsInput(mockHomeContent.announcements.join('\n'));
  };

  const handleOrderAction = (orderId: string, action: 'refund' | 'cancel') => {
    console.log(`[Admin] ${action.toUpperCase()} requested for order ${orderId}`);
  };

  const handleSaveContent = () => {
    console.log('[Admin] Home content saved', homeContent);
  };

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
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => navigate('/home')}
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
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
          <TabsList className="flex flex-wrap gap-2 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Orders & Billing
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="schools" className="flex items-center gap-2">
              <School className="w-4 h-4" />
              Schools
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Settings2 className="w-4 h-4" />
              Home Content
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
                  <CardTitle className="text-sm font-medium">MRR</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.monthlyRecurringRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
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
                  <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeSubscriptions.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{activePaidOrders.length} active institutional orders</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Billing Snapshot
                  </CardTitle>
                  <CardDescription>Quick overview of billing health</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Refunded (last 30d)</span>
                    <span className="font-semibold">${refundedAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Past due accounts</span>
                    <span className="font-semibold text-orange-500">{pastDueSubscriptions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Trialing users</span>
                    <span className="font-semibold">{trialingUsers}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Top Regions
                  </CardTitle>
                  <CardDescription>Active users by country</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {locationSummary.map(([country, count]) => (
                      <div key={country} className="flex items-center justify-between">
                        <span>{country}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    Subscription Health
                  </CardTitle>
                  <CardDescription>Live insight into user plans</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Enterprise</span>
                    <span className="font-semibold">{users.filter((u) => u.plan === 'Enterprise').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pro</span>
                    <span className="font-semibold">{users.filter((u) => u.plan === 'Pro').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Starter</span>
                    <span className="font-semibold">{users.filter((u) => u.plan === 'Starter').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Free</span>
                    <span className="font-semibold">{users.filter((u) => u.plan === 'Free').length}</span>
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
                      value={schoolSearch}
                      onChange={(e) => setSchoolSearch(e.target.value)}
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
                      value={documentSearch}
                      onChange={(e) => setDocumentSearch(e.target.value)}
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
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <Card className="xl:col-span-2">
                <CardHeader>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>View, audit, and manage every account</CardDescription>
                    </div>
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search by name, email, role or location..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Plan</TableHead>
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
                            <TableRow
                              key={user.id}
                              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                                selectedUser?.id === user.id ? 'bg-muted/70' : ''
                              }`}
                              onClick={() => setSelectedUser(user)}
                            >
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    user.role === 'admin'
                                      ? 'destructive'
                                      : user.role === 'teacher'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                >
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>{user.location}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{user.plan}</Badge>
                              </TableCell>
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

              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCircle className="w-5 h-5" />
                    {selectedUser ? selectedUser.name : 'Select a user'}
                  </CardTitle>
                  <CardDescription>Profile, usage, and recent activity</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedUser ? (
                    <>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span>Email</span>
                          <span className="font-medium">{selectedUser.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Location</span>
                          <span className="font-medium">{selectedUser.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>School / Grade</span>
                          <span className="font-medium text-right">
                            {selectedUser.schoolName || '—'}
                            {selectedUser.standard ? ` • ${selectedUser.standard}` : ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Status</span>
                          <div className="flex gap-2 items-center">
                            <Badge
                              variant={selectedUser.status === 'active' ? 'default' : 'secondary'}
                              className={selectedUser.status === 'active' ? 'bg-green-500' : ''}
                            >
                              {selectedUser.status}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              {selectedUser.subscriptionStatus}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span>Billing</span>
                          <span className="font-medium">
                            {selectedUser.plan} · {selectedUser.billingCycle}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Spend</span>
                          <span className="font-medium">${selectedUser.totalSpendUsd.toLocaleString()}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Usage snapshot
                        </h4>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Messages this month</p>
                            <p className="text-lg font-semibold">{selectedUser.usage.messagesThisMonth}</p>
                          </div>
                          <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Documents uploaded</p>
                            <p className="text-lg font-semibold">{selectedUser.usage.documentsUploaded}</p>
                          </div>
                          <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Storage used</p>
                            <p className="text-lg font-semibold">{selectedUser.usage.storageUsedMb.toFixed(1)} MB</p>
                          </div>
                          <div className="rounded-lg border p-3">
                            <p className="text-xs text-muted-foreground">Avg response time</p>
                            <p className="text-lg font-semibold">{selectedUser.usage.avgResponseTimeMs} ms</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Recent activity
                        </h4>
                        <div className="mt-3 space-y-3 max-h-52 overflow-y-auto pr-1">
                          {selectedUser.logs.map((log) => (
                            <div key={log.id} className="border rounded-lg p-3 text-sm space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium capitalize">{log.type}</span>
                                <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                              </div>
                              <p>{log.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {log.device ? `${log.device} · ` : ''}{log.location}
                                {log.ipAddress ? ` · ${log.ipAddress}` : ''}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <Button variant="outline" className="flex items-center gap-2">
                          <Settings2 className="w-4 h-4" />
                          Manage roles
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                          <RefreshCcw className="w-4 h-4" />
                          Reset password
                        </Button>
                        <Button variant="destructive">Deactivate user</Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Select a user to inspect their profile.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>Orders & Subscriptions</CardTitle>
                    <CardDescription>Refund, cancel, and audit billing activity</CardDescription>
                  </div>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search orders, users, plans..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Renews</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            No orders found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredOrders.map((order) => {
                          const orderUser = userIndex.get(order.userId);
                          return (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.id}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">{order.userName}</div>
                                  <div className="text-xs text-muted-foreground">{order.userEmail}</div>
                                </div>
                              </TableCell>
                              <TableCell>{order.plan}</TableCell>
                              <TableCell>
                                ${order.amount.toLocaleString()} {order.currency}
                                {order.couponApplied ? (
                                  <div className="text-xs text-muted-foreground">
                                    Coupon: {order.couponApplied}
                                  </div>
                                ) : null}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    order.status === 'paid'
                                      ? 'default'
                                      : order.status === 'pending'
                                      ? 'secondary'
                                      : 'destructive'
                                  }
                                >
                                  {order.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{order.renewsAt}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {order.billingCycle} · {order.seats} seats
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {orderUser ? (
                                  <div className="space-y-1 text-sm">
                                    <Badge
                                      variant={orderUser.status === 'active' ? 'default' : 'secondary'}
                                      className={orderUser.status === 'active' ? 'bg-green-500' : ''}
                                    >
                                      {orderUser.status}
                                    </Badge>
                                    <div className="text-xs text-muted-foreground">
                                      {orderUser.subscriptionStatus}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">User archived</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOrderAction(order.id, 'refund')}
                                  >
                                    Refund
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleOrderAction(order.id, 'cancel')}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Hero Section</CardTitle>
                  <CardDescription>Fine-tune the messaging shown on the home page hero</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero-title">Title</Label>
                    <Input
                      id="hero-title"
                      value={homeContent.hero.title}
                      onChange={(e) => updateHeroContent('title', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-subtitle">Subtitle</Label>
                    <Textarea
                      id="hero-subtitle"
                      value={homeContent.hero.subtitle}
                      onChange={(e) => updateHeroContent('subtitle', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hero-primary-cta">Primary CTA</Label>
                      <Input
                        id="hero-primary-cta"
                        value={homeContent.hero.primaryCta}
                        onChange={(e) => updateHeroContent('primaryCta', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero-secondary-cta">Secondary CTA</Label>
                      <Input
                        id="hero-secondary-cta"
                        value={homeContent.hero.secondaryCta}
                        onChange={(e) => updateHeroContent('secondaryCta', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Placeholders & Prompts</CardTitle>
                  <CardDescription>Keep UI hints up-to-date across experiences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="placeholder-chat">Chat input placeholder</Label>
                    <Input
                      id="placeholder-chat"
                      value={homeContent.placeholders.chatInput}
                      onChange={(e) => updatePlaceholder('chatInput', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="placeholder-signup">Signup input placeholder</Label>
                    <Input
                      id="placeholder-signup"
                      value={homeContent.placeholders.signupEmail}
                      onChange={(e) => updatePlaceholder('signupEmail', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="placeholder-search">Search bar placeholder</Label>
                    <Input
                      id="placeholder-search"
                      value={homeContent.placeholders.searchBar}
                      onChange={(e) => updatePlaceholder('searchBar', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>Feature Highlights</CardTitle>
                  <CardDescription>Update the cards displayed under the hero section</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {homeContent.highlights.map((highlight) => (
                    <div key={highlight.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${highlight.id}-title`}>Title</Label>
                        <Input
                          id={`${highlight.id}-title`}
                          value={highlight.title}
                          onChange={(e) => updateHighlight(highlight.id, 'title', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2 md:col-span-1">
                        <Label htmlFor={`${highlight.id}-description`}>Description</Label>
                        <Textarea
                          id={`${highlight.id}-description`}
                          value={highlight.description}
                          onChange={(e) => updateHighlight(highlight.id, 'description', e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle>Announcements</CardTitle>
                  <CardDescription>Surface timely updates on the dashboard banner</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="announcements">Announcements (one per line)</Label>
                    <Textarea
                      id="announcements"
                      value={announcementsInput}
                      onChange={(e) => handleAnnouncementsChange(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button className="flex items-center gap-2" onClick={handleSaveContent}>
                      <Upload className="w-4 h-4" />
                      Save content changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={resetHomeContent}
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Reset to defaults
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;
