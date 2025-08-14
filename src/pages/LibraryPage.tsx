import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { Search, Calendar, Tag, FileText, Mail, Clock, ArrowRight, Loader2, CheckCircle, Download } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Newsletter {
  id: string
  filename: string
  file_type: string
  uploaded_at: string
  file_content: string
}

interface ProcessingState {
  [key: string]: {
    status: 'idle' | 'processing' | 'success' | 'error'
    message?: string
  }
}

export function LibraryPage() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [processingState, setProcessingState] = useState<ProcessingState>({})
  const [processedDigests, setProcessedDigests] = useState<{[key: string]: any}>({})
  const [digestCount, setDigestCount] = useState(0)

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
      
      // Fetch digest count
      const { count } = await supabase
        .from('digests')
        .select('*', { count: 'exact', head: true })
      
      setDigestCount(count || 0)
      
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

  const handleProcessNewsletter = async (newsletterId: string) => {
    setProcessingState(prev => ({ ...prev, [newsletterId]: { status: 'processing' } }))
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-newsletter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newsletterId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.details || errorData.error || 'Processing failed'
        throw new Error(errorMessage)
      }

      const result = await response.json()
      
      setProcessingState(prev => ({ ...prev, [newsletterId]: { status: 'success' } }))
      setProcessedDigests(prev => ({ ...prev, [newsletterId]: result }))
      setDigestCount(prev => prev + 1)
      
    } catch (error) {
      console.error('Processing error:', error)
      setProcessingState(prev => ({ 
        ...prev, 
        [newsletterId]: { 
          status: 'error', 
          message: error instanceof Error ? error.message : 'Processing failed' 
        } 
      }))
    }
  }

  const handleDownloadDigest = (newsletterId: string) => {
    const digest = processedDigests[newsletterId]
    if (!digest) return

    const newsletter = newsletters.find(n => n.id === newsletterId)
    const filename = newsletter ? newsletter.filename.replace('.eml', '_digest.md') : 'digest.md'
    
    const blob = new Blob([digest.markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getProcessingButton = (newsletterId: string) => {
    const state = processingState[newsletterId] || { status: 'idle' }
    
    switch (state.status) {
      case 'processing':
        return (
          <Button variant="outline" size="sm" disabled>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Processing...
          </Button>
        )
      case 'success':
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Processed
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleDownloadDigest(newsletterId)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        )
      case 'error':
        return (
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleProcessNewsletter(newsletterId)}
              className="text-red-600"
            >
              Retry Processing
            </Button>
            {state.message && (
              <div className="text-xs text-red-600 max-w-xs">
                {state.message}
              </div>
            )}
          </div>
        )
      default:
        return (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleProcessNewsletter(newsletterId)}
          >
            Process with AI
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )
    }
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
                  {getProcessingButton(newsletter.id)}
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
            <div className="text-2xl font-bold text-green-600">{digestCount}</div>
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