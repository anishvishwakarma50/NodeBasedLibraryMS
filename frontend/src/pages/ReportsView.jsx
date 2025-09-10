import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Users, Calendar, AlertCircle } from 'lucide-react'
import { booksAPI, studentsAPI, issuedBooksAPI } from '../lib/api'
import { Loader2 } from 'lucide-react'

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

export default ReportsView