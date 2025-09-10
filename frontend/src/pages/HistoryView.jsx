import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { issuedBooksAPI } from '../lib/api'
import { Loader2 } from 'lucide-react'

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

export default HistoryView