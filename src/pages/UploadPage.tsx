import React from 'react'
import { FileUpload } from '../components/FileUpload'

export function UploadPage() {
  const handleUploadComplete = (newsletterId: string) => {
    console.log('Upload completed for newsletter:', newsletterId)
    // TODO: Navigate to digest page or show success message
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Newsletter</h1>
        <p className="text-gray-600">
          Upload your newsletter files (.eml or .html) to generate AI-powered insights
        </p>
      </div>

      <FileUpload onUploadComplete={handleUploadComplete} />
    </div>
  )
}