import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { ArrowLeft, ChevronDown, ChevronRight, Quote, CheckCircle, Calendar, FileText, Loader2, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { parseDigestMarkdown, ParsedDigest } from '../utils/markdownParser'

interface DigestPageProps {
  digestId: string
}

interface DigestData {
  id: string
  title: string
  source_name: string
  cleaned_content: string
  processed_at: string
  newsletter_id: string
}

export function DigestPage({ digestId }: DigestPageProps) {
  const [digest, setDigest] = useState<DigestData | null>(null)
  const [parsedDigest, setParsedDigest] = useState<ParsedDigest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedThemes, setExpandedThemes] = useState<{[key: number]: boolean}>({})

  useEffect(() => {
    fetchDigest()
  }, [digestId])

  const fetchDigest = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('digests')
        .select('*')
        .eq('id', digestId)
        .single()

      if (fetchError) throw fetchError
      if (!data) throw new Error('Digest not found')

      setDigest(data)
      
      // Parse the markdown content
      const parsed = parseDigestMarkdown(data.cleaned_content)
      setParsedDigest(parsed)

    } catch (err) {
      console.error('Error fetching digest:', err)
      setError(err instanceof Error ? err.message : 'Failed to load digest')
    } finally {
      setLoading(false)
    }
  }

  const toggleTheme = (index: number) => {
    setExpandedThemes(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading digest...</p>
        </div>
      </div>
    )
  }

  if (error || !digest || !parsedDigest) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Digest</h2>
          <p className="text-gray-400 mb-4">{error || 'Digest not found'}</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.hash = '/library'}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => window.location.hash = '/library'}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Library
            </Button>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(digest.processed_at)}
              </div>
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {digest.source_name || 'Unknown Source'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {parsedDigest.title}
          </h1>
        </div>

        {/* Executive Summary */}
        {parsedDigest.executiveSummary && (
          <Card className="mb-8 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 leading-relaxed">
                {parsedDigest.executiveSummary}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Key Themes */}
        {parsedDigest.themes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Key Themes
            </h2>
            <div className="grid gap-4">
              {parsedDigest.themes.map((theme, index) => (
                <Card 
                  key={index} 
                  className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
                  onClick={() => toggleTheme(index)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white">
                        {theme.title}
                      </CardTitle>
                      {expandedThemes[index] ? (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {theme.summary}
                    </p>
                  </CardHeader>
                  {expandedThemes[index] && (
                    <CardContent className="pt-0">
                      <div className="border-t border-gray-700 pt-4">
                        <ul className="space-y-2">
                          {theme.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start gap-2 text-gray-300">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Notable Quotes */}
          {parsedDigest.notableQuotes.length > 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Quote className="h-5 w-5 text-purple-400" />
                  Notable Quotes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {parsedDigest.notableQuotes.map((quote, index) => (
                    <blockquote key={index} className="border-l-4 border-purple-400 pl-4 italic text-gray-300">
                      "{quote}"
                    </blockquote>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Items */}
          {parsedDigest.actionItems.length > 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Action Items & Takeaways
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {parsedDigest.actionItems.map((item, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Source Information */}
        {parsedDigest.sourceInfo && (
          <Card className="mt-8 bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-400">
                <div dangerouslySetInnerHTML={{ __html: parsedDigest.sourceInfo.replace(/\n/g, '<br>') }} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}