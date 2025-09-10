import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, AlertCircle, Star, IndianRupee } from 'lucide-react';
import { issuedBooksAPI, suggestedBooksAPI, finesAPI } from '../lib/api';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
  const [stats, setStats] = useState({
    borrowedBooks: 0,
    reservedBooks: 0,
    overdueBooks: 0,
    suggestions: 0,
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
      // Fetch student's issued books
      const issuedResponse = await issuedBooksAPI.getAll({ status: 'issued' });
      const issuedBooks = issuedResponse.data || [];
      
      // Fetch suggestions
      const suggestionsResponse = await suggestedBooksAPI.getAll();
      const suggestions = suggestionsResponse.data || [];
      
      // Calculate overdue books
      const now = new Date();
      const overdueBooks = issuedBooks.filter(book => new Date(book.due_date) < now);
      
      // Fetch pending fines
      const finesResponse = await finesAPI.getStudentFines('pending');
      const pendingFines = finesResponse.data.fines || [];
      const totalFinesAmount = pendingFines.reduce((sum, fine) => sum + parseFloat(fine.amount), 0);
      
      setStats({
        borrowedBooks: issuedBooks.length,
        reservedBooks: 0, // TODO: Implement reservations
        overdueBooks: overdueBooks.length,
        suggestions: suggestions.filter(s => s.status === 'pending').length,
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

      {/* Fines Section */}
      {stats.pendingFines > 0 && (
        <Card className="border-destructive">
          <CardHeader className="pb-3">
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Pending Fines
            </CardTitle>
            <CardDescription>You have outstanding fines that need to be paid</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{stats.pendingFines} pending fine(s)</p>
                <p className="text-2xl font-bold text-destructive flex items-center gap-1">
                  <IndianRupee className="h-5 w-5" />
                  {stats.totalFinesAmount.toFixed(2)}
                </p>
              </div>
              <Button 
                variant="default" 
                onClick={() => navigate('/dashboard/fines')}
              >
                View Fines
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default StudentDashboard;