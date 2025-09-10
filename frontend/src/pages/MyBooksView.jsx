import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen } from 'lucide-react'
import { issuedBooksAPI } from '../lib/api'
import { Loader2 } from 'lucide-react'

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

export default MyBooksView