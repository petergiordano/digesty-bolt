import React from 'react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { BookOpen, Upload, Search } from 'lucide-react'

export function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Digesty
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Transform your newsletters into themed, layered insights with our interactive reader
        </p>
        <Button size="lg" className="mr-4" onClick={() => window.location.hash = '/upload'}>
          <Upload className="h-5 w-5 mr-2" />
          Upload Newsletter
        </Button>
        <Button variant="outline" size="lg" onClick={() => window.location.hash = '/library'}>
          <Search className="h-5 w-5 mr-2" />
          Browse Library
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <Upload className="h-12 w-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upload</h3>
          <p className="text-gray-600">
            Upload your newsletter files (.eml or .html) for AI-powered summarization
          </p>
        </Card>

        <Card className="p-6">
          <BookOpen className="h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Read</h3>
          <p className="text-gray-600">
            Explore insights through our three-layer reader: themes, details, and full content
          </p>
        </Card>

        <Card className="p-6">
          <Search className="h-12 w-12 text-purple-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Export</h3>
          <p className="text-gray-600">
            Export your digests to Markdown for sharing and archiving
          </p>
        </Card>
      </div>
    </div>
  )
}