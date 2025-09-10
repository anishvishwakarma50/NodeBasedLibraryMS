import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Plus, Edit, Eye } from 'lucide-react'
import { booksAPI, coursesAPI } from '../lib/api'
import { Loader2 } from 'lucide-react'
import BookFormDialog from './BookFormDialog'
import { useNavigate } from 'react-router-dom'

function BooksView({ userRole }) {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [courses, setCourses] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const navigate = useNavigate()
  
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
                <Button onClick={() => navigate('/dashboard/books/add')}>
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

export default BooksView