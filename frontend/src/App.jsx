import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { 
  BookOpen, 
  Users, 
  Search, 
  Bell, 
  Menu, 
  Moon, 
  Sun, 
  Library, 
  UserCheck, 
  BookPlus,
  BarChart3,
  Settings,
  LogOut,
  Home,
  Calendar,
  Clock,
  Star,
  Download,
  Upload,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { booksAPI, coursesAPI, issuedBooksAPI, suggestedBooksAPI, studentsAPI, librariansAPI } from './lib/api'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth()
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <LoginPage darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? 
            <Navigate to="/dashboard" replace /> : 
            <RegisterPage darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? 
            <Dashboard darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} /> : 
            <Navigate to="/login" replace />
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </div>
  )
}

function LoginPage({ darkMode, toggleDarkMode }) {
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData)
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Library className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">LBManage</span>
          </div>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="librarian">Librarian</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
            
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Button variant="link" className="p-0 h-auto" onClick={() => window.location.href = '/register'}>
                Register as Student
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function RegisterPage({ darkMode, toggleDarkMode }) {
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    student_id: '',
    course_id: '',
    semester: '',
    phone: '',
    address: ''
  })
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await coursesAPI.getAll()
        setCourses(response.data)
      } catch (error) {
        console.error('Failed to fetch courses:', error)
      }
    }
    fetchCourses()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await register({
      ...formData,
      course_id: parseInt(formData.course_id)
    })
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Library className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">LBManage</span>
          </div>
          <CardTitle>Student Registration</CardTitle>
          <CardDescription>Create your student account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID</Label>
                <Input
                  id="student_id"
                  name="student_id"
                  placeholder="Student ID"
                  value={formData.student_id}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course_id">Course</Label>
                <Select value={formData.course_id} onValueChange={(value) => setFormData({...formData, course_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  name="semester"
                  placeholder="e.g., 1st"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Register
            </Button>
            
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Button variant="link" className="p-0 h-auto" onClick={() => window.location.href = '/login'}>
                Sign In
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

function Dashboard({ darkMode, toggleDarkMode }) {
  const { user, userRole, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Library className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">LBManage</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-card border-r transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-4 pt-20 md:pt-4">
              <nav className="space-y-2">
                {userRole === 'student' ? (
                  <>
                    <NavItem icon={Home} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
                    <NavItem icon={BookOpen} label="Browse Books" active={currentView === 'books'} onClick={() => setCurrentView('books')} />
                    <NavItem icon={Calendar} label="My Books" active={currentView === 'my-books'} onClick={() => setCurrentView('my-books')} />
                    <NavItem icon={Clock} label="History" active={currentView === 'history'} onClick={() => setCurrentView('history')} />
                    <NavItem icon={Star} label="Suggestions" active={currentView === 'suggestions'} onClick={() => setCurrentView('suggestions')} />
                    <NavItem icon={Settings} label="Profile" active={currentView === 'profile'} onClick={() => setCurrentView('profile')} />
                  </>
                ) : (
                  <>
                    <NavItem icon={Home} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
                    <NavItem icon={BookOpen} label="Manage Books" active={currentView === 'books'} onClick={() => setCurrentView('books')} />
                    <NavItem icon={Users} label="Manage Students" active={currentView === 'students'} onClick={() => setCurrentView('students')} />
                    <NavItem icon={UserCheck} label="Issue/Return" active={currentView === 'issue-return'} onClick={() => setCurrentView('issue-return')} />
                    <NavItem icon={BarChart3} label="Reports" active={currentView === 'reports'} onClick={() => setCurrentView('reports')} />
                    <NavItem icon={Star} label="Suggestions" active={currentView === 'suggestions'} onClick={() => setCurrentView('suggestions')} />
                    <NavItem icon={Settings} label="Settings" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
                  </>
                )}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {currentView === 'dashboard' && (
            userRole === 'student' ? 
            <StudentDashboard /> : 
            <LibrarianDashboard />
          )}
          {currentView === 'books' && <BooksView userRole={userRole} />}
          {currentView === 'my-books' && userRole === 'student' && <MyBooksView />}
          {currentView === 'students' && userRole === 'librarian' && <StudentsView />}
          {currentView === 'issue-return' && userRole === 'librarian' && <IssueReturnView />}
          {currentView === 'suggestions' && <SuggestionsView userRole={userRole} />}
          {currentView === 'history' && userRole === 'student' && <HistoryView />}
          {currentView === 'reports' && userRole === 'librarian' && <ReportsView />}
          {currentView === 'profile' && <ProfileView />}
          {currentView === 'settings' && userRole === 'librarian' && <SettingsView />}
        </main>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/50 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  )
}

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <Button 
      variant={active ? "secondary" : "ghost"} 
      className="w-full justify-start"
      onClick={onClick}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}

function StudentDashboard() {
  const [stats, setStats] = useState({
    borrowedBooks: 0,
    reservedBooks: 0,
    overdueBooks: 0,
    suggestions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch student's issued books
      const issuedResponse = await issuedBooksAPI.getAll({ status: 'issued' })
      const issuedBooks = issuedResponse.data || []
      
      // Fetch suggestions
      const suggestionsResponse = await suggestedBooksAPI.getAll()
      const suggestions = suggestionsResponse.data || []
      
      // Calculate overdue books
      const now = new Date()
      const overdueBooks = issuedBooks.filter(book => new Date(book.due_date) < now)
      
      setStats({
        borrowedBooks: issuedBooks.length,
        reservedBooks: 0, // TODO: Implement reservations
        overdueBooks: overdueBooks.length,
        suggestions: suggestions.filter(s => s.status === 'pending').length
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your library overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books Borrowed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.borrowedBooks}</div>
            <p className="text-xs text-muted-foreground">Active loans</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserved Books</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reservedBooks}</div>
            <p className="text-xs text-muted-foreground">Waiting for pickup</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdueBooks}</div>
            <p className="text-xs text-muted-foreground">Return immediately</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suggestions</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suggestions}</div>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LibrarianDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeStudents: 0,
    booksIssued: 0,
    overdueBooks: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch books
      const booksResponse = await booksAPI.getAll()
      const books = booksResponse.data?.books || []
      
      // Fetch students
      const studentsResponse = await studentsAPI.getAll()
      const students = studentsResponse.data?.students || []
      
      // Fetch issued books
      const issuedResponse = await issuedBooksAPI.getAll()
      const issuedBooks = issuedResponse.data || []
      
      // Fetch overdue books
      const overdueResponse = await issuedBooksAPI.getOverdue()
      const overdueBooks = overdueResponse.data || []
      
      setStats({
        totalBooks: books.length,
        activeStudents: students.length,
        booksIssued: issuedBooks.filter(book => book.status === 'issued').length,
        overdueBooks: overdueBooks.length
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Librarian Dashboard</h1>
        <p className="text-muted-foreground">Manage your library efficiently.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
            <p className="text-xs text-muted-foreground">In collection</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeStudents}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Books Issued</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.booksIssued}</div>
            <p className="text-xs text-muted-foreground">Currently out</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdueBooks}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common library management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <BookPlus className="mr-2 h-4 w-4" />
              Add New Book
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <UserCheck className="mr-2 h-4 w-4" />
              Issue Book
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CheckCircle className="mr-2 h-4 w-4" />
              Return Book
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Register Student
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest library transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Book Returned</p>
                    <p className="text-xs text-muted-foreground">Student returned a book</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">2h ago</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Book Issued</p>
                    <p className="text-xs text-muted-foreground">New book issued to student</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">4h ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BooksView({ userRole }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [courses, setCourses] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)

  useEffect(() => {
    fetchBooks()
    fetchCourses()
  }, [searchQuery, selectedCourse])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const params = {}
      if (searchQuery) params.search = searchQuery
      if (selectedCourse !== 'all') params.course_id = selectedCourse
      
      const response = await booksAPI.getAll(params)
      setBooks(response.data.books || [])
    } catch (error) {
      console.error('Failed to fetch books:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll()
      setCourses(response.data)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {userRole === 'student' ? 'Browse Books' : 'Manage Books'}
        </h1>
        <p className="text-muted-foreground">
          {userRole === 'student' ? 'Find and borrow books from our collection' : 'Add, edit, and manage library books'}
        </p>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search books by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {userRole === 'librarian' && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Book
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Card key={book.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight">{book.title}</CardTitle>
                    <CardDescription className="mt-1">by {book.author}</CardDescription>
                  </div>
                  <Badge variant={book.available_copies > 0 ? "default" : "secondary"}>
                    {book.available_copies > 0 ? "Available" : "Issued"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span>{book.category}</span>
                  <span>{book.course?.code || 'General'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Copies: {book.available_copies}/{book.total_copies}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    {userRole === 'student' ? (
                      <Button size="sm" disabled={book.available_copies === 0}>
                        {book.available_copies > 0 ? "Borrow" : "Reserve"}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setEditingBook(book)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Book Dialog */}
      <BookFormDialog 
        open={showAddForm || !!editingBook}
        onClose={() => {
          setShowAddForm(false)
          setEditingBook(null)
        }}
        book={editingBook}
        courses={courses}
        onSuccess={() => {
          fetchBooks()
          setShowAddForm(false)
          setEditingBook(null)
        }}
      />
    </div>
  )
}

function BookFormDialog({ open, onClose, book, courses, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    category: '',
    total_copies: 1,
    course_id: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        publisher: book.publisher || '',
        category: book.category || '',
        total_copies: book.total_copies || 1,
        course_id: book.course_id?.toString() || '',
        description: book.description || ''
      })
    } else {
      setFormData({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        category: '',
        total_copies: 1,
        course_id: '',
        description: ''
      })
    }
  }, [book])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        ...formData,
        total_copies: parseInt(formData.total_copies),
        course_id: formData.course_id ? parseInt(formData.course_id) : null
      }

      if (book) {
        await booksAPI.update(book.id, data)
      } else {
        await booksAPI.create(data)
      }

      onSuccess()
    } catch (error) {
      console.error('Failed to save book:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{book ? 'Edit Book' : 'Add New Book'}</DialogTitle>
          <DialogDescription>
            {book ? 'Update book information' : 'Add a new book to the library collection'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({...formData, author: e.target.value})}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn}
                onChange={(e) => setFormData({...formData, isbn: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_copies">Copies</Label>
              <Input
                id="total_copies"
                type="number"
                min="1"
                value={formData.total_copies}
                onChange={(e) => setFormData({...formData, total_copies: e.target.value})}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course_id">Course</Label>
              <Select value={formData.course_id} onValueChange={(value) => setFormData({...formData, course_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">General</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="publisher">Publisher</Label>
            <Input
              id="publisher"
              value={formData.publisher}
              onChange={(e) => setFormData({...formData, publisher: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {book ? 'Update' : 'Add'} Book
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function MyBooksView() {
  const [issuedBooks, setIssuedBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyBooks()
  }, [])

  const fetchMyBooks = async () => {
    try {
      setLoading(true)
      const response = await issuedBooksAPI.getAll({ status: 'issued' })
      setIssuedBooks(response.data || [])
    } catch (error) {
      console.error('Failed to fetch issued books:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Books</h1>
        <p className="text-muted-foreground">Books currently borrowed by you</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : issuedBooks.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No books borrowed</h3>
            <p className="text-muted-foreground">You haven't borrowed any books yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {issuedBooks.map((issuedBook) => (
            <Card key={issuedBook.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{issuedBook.book?.title}</h3>
                    <p className="text-sm text-muted-foreground">by {issuedBook.book?.author}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      <span>Issue Date: {new Date(issuedBook.issue_date).toLocaleDateString()}</span>
                      <span>Due Date: {new Date(issuedBook.due_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Badge variant={new Date(issuedBook.due_date) < new Date() ? "destructive" : "default"}>
                    {new Date(issuedBook.due_date) < new Date() ? "Overdue" : "Active"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function StudentsView() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchStudents()
  }, [searchQuery])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const params = {}
      if (searchQuery) params.search = searchQuery
      
      const response = await studentsAPI.getAll(params)
      setStudents(response.data.students || [])
    } catch (error) {
      console.error('Failed to fetch students:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Students</h1>
        <p className="text-muted-foreground">View and manage registered students</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Books Borrowed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.student_id}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{student.course?.code || 'N/A'}</TableCell>
                    <TableCell>{student.semester}</TableCell>
                    <TableCell>{student.borrowed_books_count || 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function IssueReturnView() {
  const [activeTab, setActiveTab] = useState('issue')
  const [students, setStudents] = useState([])
  const [books, setBooks] = useState([])
  const [issuedBooks, setIssuedBooks] = useState([])
  const [loading, setLoading] = useState(false)

  const [issueForm, setIssueForm] = useState({
    student_id: '',
    book_id: '',
    due_date: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [studentsRes, booksRes, issuedRes] = await Promise.all([
        studentsAPI.getAll(),
        booksAPI.getAll(),
        issuedBooksAPI.getAll({ status: 'issued' })
      ])
      
      setStudents(studentsRes.data.students || [])
      setBooks(booksRes.data.books || [])
      setIssuedBooks(issuedRes.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const handleIssueBook = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await issuedBooksAPI.issue({
        ...issueForm,
        student_id: parseInt(issueForm.student_id),
        book_id: parseInt(issueForm.book_id)
      })
      
      setIssueForm({ student_id: '', book_id: '', due_date: '' })
      fetchData()
    } catch (error) {
      console.error('Failed to issue book:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReturnBook = async (issuedBookId) => {
    try {
      await issuedBooksAPI.return(issuedBookId, {
        return_date: new Date().toISOString().split('T')[0]
      })
      fetchData()
    } catch (error) {
      console.error('Failed to return book:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Issue & Return Books</h1>
        <p className="text-muted-foreground">Manage book transactions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="issue">Issue Book</TabsTrigger>
          <TabsTrigger value="return">Return Book</TabsTrigger>
        </TabsList>

        <TabsContent value="issue">
          <Card>
            <CardHeader>
              <CardTitle>Issue New Book</CardTitle>
              <CardDescription>Issue a book to a student</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleIssueBook} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student_id">Student</Label>
                    <Select value={issueForm.student_id} onValueChange={(value) => setIssueForm({...issueForm, student_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id.toString()}>
                            {student.name} ({student.student_id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="book_id">Book</Label>
                    <Select value={issueForm.book_id} onValueChange={(value) => setIssueForm({...issueForm, book_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select book" />
                      </SelectTrigger>
                      <SelectContent>
                        {books.filter(book => book.available_copies > 0).map((book) => (
                          <SelectItem key={book.id} value={book.id.toString()}>
                            {book.title} by {book.author}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={issueForm.due_date}
                    onChange={(e) => setIssueForm({...issueForm, due_date: e.target.value})}
                    required
                  />
                </div>
                
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Issue Book
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="return">
          <Card>
            <CardHeader>
              <CardTitle>Return Books</CardTitle>
              <CardDescription>Process book returns</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issuedBooks.map((issuedBook) => (
                    <TableRow key={issuedBook.id}>
                      <TableCell>{issuedBook.student?.name}</TableCell>
                      <TableCell>{issuedBook.book?.title}</TableCell>
                      <TableCell>{new Date(issuedBook.issue_date).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(issuedBook.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={new Date(issuedBook.due_date) < new Date() ? "destructive" : "default"}>
                          {new Date(issuedBook.due_date) < new Date() ? "Overdue" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" onClick={() => handleReturnBook(issuedBook.id)}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Return
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SuggestionsView({ userRole }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    category: '',
    reason: ''
  })

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    try {
      setLoading(true)
      const response = await suggestedBooksAPI.getAll()
      setSuggestions(response.data || [])
    } catch (error) {
      console.error('Failed to fetch suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await suggestedBooksAPI.create(formData)
      setFormData({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        category: '',
        reason: ''
      })
      setShowForm(false)
      fetchSuggestions()
    } catch (error) {
      console.error('Failed to submit suggestion:', error)
    }
  }

  const handleReview = async (id, status, notes = '') => {
    try {
      await suggestedBooksAPI.review(id, { status, review_notes: notes })
      fetchSuggestions()
    } catch (error) {
      console.error('Failed to review suggestion:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Book Suggestions</h1>
          <p className="text-muted-foreground">
            {userRole === 'student' ? 'Suggest books for the library' : 'Review student book suggestions'}
          </p>
        </div>
        {userRole === 'student' && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Suggest Book
          </Button>
        )}
      </div>

      {/* Suggestion Form */}
      {showForm && userRole === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle>Suggest a New Book</CardTitle>
            <CardDescription>Help us improve our library collection</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Book Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN (Optional)</Label>
                  <Input
                    id="isbn"
                    value={formData.isbn}
                    onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publisher">Publisher (Optional)</Label>
                  <Input
                    id="publisher"
                    value={formData.publisher}
                    onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Suggestion</Label>
                <Textarea
                  id="reason"
                  placeholder="Why should we add this book to our collection?"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  required
                />
              </div>
              
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Submit Suggestion
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Suggestions List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{suggestion.title}</h3>
                    <p className="text-sm text-muted-foreground">by {suggestion.author}</p>
                    <p className="text-sm mt-2">{suggestion.reason}</p>
                    {suggestion.review_notes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <strong>Review:</strong> {suggestion.review_notes}
                      </p>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Suggested by: {suggestion.student?.name}</span>
                      <span>Date: {new Date(suggestion.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      suggestion.status === 'approved' ? 'default' :
                      suggestion.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {suggestion.status}
                    </Badge>
                    {userRole === 'librarian' && suggestion.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleReview(suggestion.id, 'approved')}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleReview(suggestion.id, 'rejected')}>
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function HistoryView() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await issuedBooksAPI.getAll()
      setHistory(response.data || [])
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Borrowing History</h1>
        <p className="text-muted-foreground">Your complete book borrowing history</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Return Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.book?.title}</TableCell>
                    <TableCell>{record.book?.author}</TableCell>
                    <TableCell>{new Date(record.issue_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(record.due_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {record.return_date ? new Date(record.return_date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        record.status === 'returned' ? 'default' :
                        new Date(record.due_date) < new Date() ? 'destructive' : 'secondary'
                      }>
                        {record.status === 'returned' ? 'Returned' :
                         new Date(record.due_date) < new Date() ? 'Overdue' : 'Active'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function ReportsView() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalStudents: 0,
    activeLoans: 0,
    overdueBooks: 0,
    popularBooks: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      // Fetch various statistics
      const [booksRes, studentsRes, issuedRes, overdueRes] = await Promise.all([
        booksAPI.getAll(),
        studentsAPI.getAll(),
        issuedBooksAPI.getAll({ status: 'issued' }),
        issuedBooksAPI.getOverdue()
      ])

      setStats({
        totalBooks: booksRes.data.books?.length || 0,
        totalStudents: studentsRes.data.students?.length || 0,
        activeLoans: issuedRes.data?.length || 0,
        overdueBooks: overdueRes.data?.length || 0,
        popularBooks: [], // TODO: Implement popular books logic
        recentActivity: issuedRes.data?.slice(0, 10) || []
      })
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Library statistics and insights</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeLoans}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdueBooks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest book transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentActivity.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>{activity.student?.name}</TableCell>
                  <TableCell>{activity.book?.title}</TableCell>
                  <TableCell>
                    <Badge variant={activity.status === 'returned' ? 'default' : 'secondary'}>
                      {activity.status === 'returned' ? 'Returned' : 'Issued'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(activity.status === 'returned' ? activity.return_date : activity.issue_date).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function ProfileView() {
  const { user, userRole } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      if (userRole === 'librarian') {
        const response = await librariansAPI.getProfile()
        setProfile(response.data)
        setFormData(response.data)
      } else {
        // For students, use the user data from auth context
        setProfile(user)
        setFormData(user)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      if (userRole === 'librarian') {
        await librariansAPI.updateProfile(formData)
      } else {
        await studentsAPI.update(user.id, formData)
      }
      setProfile(formData)
      setEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setEditing(!editing)}>
              {editing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              
              {userRole === 'student' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="student_id">Student ID</Label>
                      <Input
                        id="student_id"
                        value={formData.student_id || ''}
                        onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="semester">Semester</Label>
                      <Input
                        id="semester"
                        value={formData.semester || ''}
                        onChange={(e) => setFormData({...formData, semester: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </>
              )}
              
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-muted-foreground">{profile?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{profile?.email}</p>
                </div>
              </div>
              
              {userRole === 'student' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Student ID</Label>
                      <p className="text-sm text-muted-foreground">{profile?.student_id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Course</Label>
                      <p className="text-sm text-muted-foreground">{profile?.course?.name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Semester</Label>
                      <p className="text-sm text-muted-foreground">{profile?.semester}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm text-muted-foreground">{profile?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage library settings and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Library Settings</CardTitle>
          <CardDescription>Configure library parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Settings functionality coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default App

