import React from 'react'
import { BookOpen } from 'lucide-react'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Digesty</h1>
        </div>
      </div>
    </header>
  )
}