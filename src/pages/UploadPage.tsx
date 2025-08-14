import React from 'react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Upload, FileText, Mail } from 'lucide-react'

export function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Newsletter</h1>
        <p className="text-gray-600">
          Upload your newsletter files (.eml or .html) to generate AI-powered insights
        </p>
      </div>

      {/* Upload Dropzone */}
      <Card className="p-8 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <div className="text-center">
          <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Drop your newsletter files here
          </h3>
          <p className="text-gray-600 mb-4">
            or click to browse and select files
          </p>
          <Button>
            Choose Files
          </Button>
        </div>
      </Card>

      {/* Supported Formats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <Mail className="h-8 w-8 text-blue-600" />
            <div>
              <h4 className="font-semibold">.eml files</h4>
              <p className="text-sm text-gray-600">Email message files</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-green-600" />
            <div>
              <h4 className="font-semibold">.html files</h4>
              <p className="text-sm text-gray-600">Newsletter HTML content</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}