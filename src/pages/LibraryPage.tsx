import React from 'react'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Search, Calendar, Tag } from 'lucide-react'

export function LibraryPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Digest Library</h1>
        <p className="text-gray-600">Browse and search your processed newsletters</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search digests..." 
            className="pl-10"
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

      {/* Empty State */}
      <Card className="p-12 text-center">
        <div className="text-gray-400 mb-4">
          <Search className="h-16 w-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No digests yet</h3>
        <p className="text-gray-600 mb-4">
          Upload your first newsletter to get started with AI-powered insights
        </p>
      </Card>
    </div>
  )
}