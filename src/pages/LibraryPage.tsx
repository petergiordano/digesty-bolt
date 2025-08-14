import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Search, Calendar, Tag, FileText, Mail, Clock, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Newsletter {
  id: string
  filename: string
  file_type: string
  uploaded_at: string
  file_content: string
}

export function LibraryPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchNewsletters()
  }, [])

  const fetchNewsletters = async () => {
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setNewsletters(data || [])
    } catch (error) {
      console.error('Error fetching newsletters:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNewsletters = newsletters.filter(newsletter =>
    newsletter.filename.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileSize = (content: string) => {
    const bytes = new Blob([content]).size
    return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`
  }

  const handleProcessNewsletter = (newsletterId: string) => {
    // TODO: Implement processing logic
    console.log('Processing newsletter:', newsletterId)
    // This will eventually trigger AI processing and create digest entries
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Newsletter Library</h1>
          <p className="text-gray-600">Loading your uploaded newsletters...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Newsletter Library</h1>
        <p className="text-gray-600">Browse and process your uploaded newsletters</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search newsletters..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-2 border rounded-lg">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Date Range</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 border rounded-lg">
            <Tag className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Tags</span>
          </div>
        </div>
      </div>

      {/* Newsletter List */}
      {filteredNewsletters.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Mail className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {newsletters.length === 0 ? 'No newsletters uploaded yet' : 'No newsletters match your search'}
          </h3>
          <p className="text-gray-600 mb-4">
            {newsletters.length === 0 
              ? 'Upload your first newsletter to get started with AI-powered insights'
              : 'Try adjusting your search terms'
            }
          </p>
          {newsletters.length === 0 && (
            <Button onClick={() => window.location.hash = '/upload'}>
              Upload Newsletter
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredNewsletters.map((newsletter) => (
            <Card key={newsletter.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                      {newsletter.filename.replace('.eml', '')}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(newsletter.uploaded_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {getFileSize(newsletter.file_content)}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm">
                      Raw newsletter content ready for AI processing
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleProcessNewsletter(newsletter.id)}
                  >
                    Process with AI
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {newsletters.length > 0 && (
        <div className="mt-8 grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{newsletters.length}</div>
            <div className="text-sm text-gray-600">Total Newsletters</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Processed Digests</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {newsletters.reduce((total, n) => total + new Blob([n.file_content]).size, 0) > 1024 
                ? `${(newsletters.reduce((total, n) => total + new Blob([n.file_content]).size, 0) / 1024).toFixed(1)} KB`
                : `${newsletters.reduce((total, n) => total + new Blob([n.file_content]).size, 0)} B`
              }
            </div>
            <div className="text-sm text-gray-600">Total Content</div>
          </Card>
        </div>
      )}
    </div>
  )
}