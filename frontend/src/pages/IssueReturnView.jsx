import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle, IndianRupee } from 'lucide-react'
import { studentsAPI, booksAPI, issuedBooksAPI } from '../lib/api'
import { Loader2 } from 'lucide-react'

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
              <CardDescription>Process book returns and manage fines</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead>Fine Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issuedBooks.map((issuedBook) => {
                    const dueDate = new Date(issuedBook.due_date);
                    const today = new Date();
                    const daysOverdue = Math.max(0, Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)));
                    const fineAmount = daysOverdue * 5; // ₹5 per day
                    
                    return (
                      <TableRow key={issuedBook.id}>
                        <TableCell>{issuedBook.student?.name}</TableCell>
                        <TableCell>{issuedBook.book?.title}</TableCell>
                        <TableCell>{new Date(issuedBook.issue_date).toLocaleDateString()}</TableCell>
                        <TableCell>{dueDate.toLocaleDateString()}</TableCell>
                        <TableCell>
                          {daysOverdue > 0 ? (
                            <Badge variant="destructive">{daysOverdue} days</Badge>
                          ) : (
                            <Badge variant="outline">On time</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {daysOverdue > 0 ? (
                            <div className="flex items-center gap-1 text-destructive font-medium">
                              <IndianRupee className="h-4 w-4" />
                              {fineAmount.toFixed(2)}
                            </div>
                          ) : (
                            'No fine'
                          )}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" onClick={() => handleReturnBook(issuedBook.id)}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Return
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default IssueReturnView