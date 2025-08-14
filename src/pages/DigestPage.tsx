import React from 'react'
import { Card } from '../components/ui/card'
import { Separator } from '../components/ui/separator'
import { Calendar, Tag, Filter, FileText, Eye } from 'lucide-react'

export function DigestPage() {
  return (
    <div className="h-full flex">
      {/* Left Panel - Filters */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Date Range
              </label>
              <div className="flex items-center gap-2 p-2 border rounded">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">All time</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Source
              </label>
              <div className="flex items-center gap-2 p-2 border rounded">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">All sources</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tags
              </label>
              <div className="flex items-center gap-2 p-2 border rounded">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">All tags</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Center Panel - Theme List */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Themes (5)</h3>
        
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((theme) => (
            <Card key={theme} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
              <h4 className="font-medium text-gray-900 mb-1">
                Theme {theme} Title
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                One-line summary of this theme's key insights and main points...
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Panel - Details */}
      <div className="flex-1 bg-white p-6">
        <div className="text-center text-gray-500 mt-20">
          <Eye className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">
            Select a theme to view details
          </h3>
          <p className="text-gray-400">
            Choose a theme from the center panel to see detailed insights, quotes, and sources
          </p>
        </div>
      </div>
    </div>
  )
}