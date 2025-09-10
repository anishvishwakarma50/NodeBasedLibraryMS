import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Plus, CheckCircle, XCircle } from 'lucide-react'
import { suggestedBooksAPI } from '../lib/api'
import { Loader2 } from 'lucide-react'

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

export default SuggestionsView