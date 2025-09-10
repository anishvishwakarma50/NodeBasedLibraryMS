import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Calendar, AlertCircle, BookPlus, UserCheck, CheckCircle, Plus, IndianRupee } from 'lucide-react';
import { booksAPI, studentsAPI, issuedBooksAPI, finesAPI } from '../lib/api';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function LibrarianDashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeStudents: 0,
    booksIssued: 0,
    overdueBooks: 0,
    pendingFines: 0,
    totalFinesAmount: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch books
      const booksResponse = await booksAPI.getAll();
      const books = booksResponse.data?.books || [];
      
      // Fetch students
      const studentsResponse = await studentsAPI.getAll();
      const students = studentsResponse.data?.students || [];
      
      // Fetch issued books
      const issuedResponse = await issuedBooksAPI.getAll();
      const issuedBooks = issuedResponse.data || [];
      
      // Fetch overdue books
      const overdueResponse = await issuedBooksAPI.getOverdue();
      const overdueBooks = overdueResponse.data || [];
      
      // Fetch pending fines
      const finesResponse = await finesAPI.getAll({ status: 'pending' });
      const pendingFines = finesResponse.data.fines || [];
      const totalFinesAmount = pendingFines.reduce((sum, fine) => sum + parseFloat(fine.amount), 0);
      
      setStats({
        totalBooks: books.length,
        activeStudents: students.length,
        booksIssued: issuedBooks.filter(book => book.status === 'issued').length,
        overdueBooks: overdueBooks.length,
        pendingFines: pendingFines.length,
        totalFinesAmount: totalFinesAmount
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
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

      {/* Fines Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Fines Overview
          </CardTitle>
          <CardDescription>Manage outstanding fines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{stats.pendingFines}</div>
              <div className="text-sm text-muted-foreground">Pending Fines</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-destructive flex items-center justify-center gap-1">
                <IndianRupee className="h-5 w-5" />
                {stats.totalFinesAmount.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total Amount Due</div>
            </div>
            <div className="flex items-center justify-center">
              <Button onClick={() => navigate('/dashboard/fines')}>
                Manage Fines
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common library management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" onClick={() => navigate('/dashboard/books/add')}>
              <BookPlus className="mr-2 h-4 w-4" />
              Add New Book
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/dashboard/issue-return')}>
              <UserCheck className="mr-2 h-4 w-4" />
              Issue Book
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/dashboard/issue-return?tab=return')}>
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
  );
}

export default LibrarianDashboard;