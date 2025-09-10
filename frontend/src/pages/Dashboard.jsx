import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Moon, Sun, Bell, Menu, LogOut, Library, AlertCircle } from 'lucide-react'
import NavItem from '../components/NavItem'
import StudentDashboard from './StudentDashboard'
import LibrarianDashboard from './LibrarianDashboard'
import BooksView from './BooksView'
import MyBooksView from './MyBooksView'
import StudentsView from './StudentsView'
import IssueReturnView from './IssueReturnView'
import SuggestionsView from './SuggestionsView'
import HistoryView from './HistoryView'
import ReportsView from './ReportsView'
import ProfileView from './ProfileView'
import SettingsView from './SettingsView'
import AddBookPage from './AddBookPage'
import FinesView from './FinesView' // Import FinesView
import { finesAPI } from '../lib/api' // Import finesAPI

function Dashboard({ darkMode, toggleDarkMode }) {
  const { user, userRole, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const [pendingFinesCount, setPendingFinesCount] = useState(0)

  useEffect(() => {
    if (userRole === 'student') {
      fetchStudentFines();
    } else if (userRole === 'librarian') {
      fetchPendingFinesCount();
    }
  }, [userRole]);

  const fetchStudentFines = async () => {
    try {
      const response = await finesAPI.getStudentFines(user.id, 'pending');
      setPendingFinesCount(response.data.fines.length);
    } catch (error) {
      console.error('Failed to fetch student fines:', error);
    }
  };

  const fetchPendingFinesCount = async () => {
    try {
      const response = await finesAPI.getAll({ status: 'pending' });
      setPendingFinesCount(response.data.fines.length);
    } catch (error) {
      console.error('Failed to fetch pending fines count:', error);
    }
  };

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
            
            {/* Fine Notification Badge */}
            {pendingFinesCount > 0 && (
              <div className="relative">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                  {pendingFinesCount}
                </span>
              </div>
            )}
            
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
                    <NavItem icon="Home" label="Dashboard" to="/dashboard" />
                    <NavItem icon="BookOpen" label="Browse Books" to="/dashboard/books" />
                    <NavItem icon="Calendar" label="My Books" to="/dashboard/my-books" />
                    <NavItem icon="Clock" label="History" to="/dashboard/history" />
                    <NavItem icon="Star" label="Suggestions" to="/dashboard/suggestions" />
                    {/* Add Fines navigation for students */}
                    {pendingFinesCount > 0 && (
                      <NavItem 
                        icon="AlertCircle" 
                        label={
                          <span className="flex items-center gap-2">
                            Fines
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                              {pendingFinesCount}
                            </span>
                          </span>
                        } 
                        to="/dashboard/fines" 
                      />
                    )}
                    <NavItem icon="Settings" label="Profile" to="/dashboard/profile" />
                  </>
                ) : (
                  <>
                    <NavItem icon="Home" label="Dashboard" to="/dashboard" />
                    <NavItem icon="BookOpen" label="Manage Books" to="/dashboard/books" />
                    <NavItem icon="Users" label="Manage Students" to="/dashboard/students" />
                    <NavItem icon="UserCheck" label="Issue/Return" to="/dashboard/issue-return" />
                    <NavItem icon="BarChart3" label="Reports" to="/dashboard/reports" />
                    {/* Add Fines navigation for librarians */}
                    <NavItem 
                      icon="AlertCircle" 
                      label={
                        <span className="flex items-center gap-2">
                          Fines
                          {pendingFinesCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                              {pendingFinesCount}
                            </span>
                          )}
                        </span>
                      } 
                      to="/dashboard/fines" 
                    />
                    <NavItem icon="Star" label="Suggestions" to="/dashboard/suggestions" />
                    <NavItem icon="Settings" label="Settings" to="/dashboard/settings" />
                  </>
                )}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Routes>
            <Route index element={userRole === 'student' ? <StudentDashboard /> : <LibrarianDashboard />} />
            <Route path="books" element={<BooksView userRole={userRole} />} />
            <Route path="books/add" element={<AddBookPage />} />
            <Route path="my-books" element={<MyBooksView />} />
            <Route path="students" element={<StudentsView userRole={userRole} />} />
            <Route path="issue-return" element={<IssueReturnView />} />
            <Route path="suggestions" element={<SuggestionsView userRole={userRole} />} />
            <Route path="history" element={<HistoryView />} />
            <Route path="reports" element={<ReportsView />} />
            <Route path="profile" element={<ProfileView />} />
            <Route path="settings" element={<SettingsView />} />
            {/* Add Fines route */}
            <Route path="fines" element={<FinesView />} />
          </Routes>
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

export default Dashboard