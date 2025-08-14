import React from 'react'
import { Home, Library, Upload, Settings } from 'lucide-react'

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        <a 
          href="#/" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          <Home className="h-5 w-5" />
          <span>Dashboard</span>
        </a>
        <a 
          href="#/library" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          <Library className="h-5 w-5" />
          <span>Library</span>
        </a>
        <a 
          href="#/upload" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
        >
          <Upload className="h-5 w-5" />
          <span>Upload</span>
        </a>
      </nav>
    </aside>
  )
}