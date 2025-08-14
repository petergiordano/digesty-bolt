import React, { useState, useCallback } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Upload, FileText, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface FileUploadProps {
  onUploadComplete?: (newsletterId: string) => void
}

interface UploadedFile {
  file: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  id?: string
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  const validateFile = (file: File): string | null => {
    const validTypes = ['.eml', '.html', '.htm']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!validTypes.includes(fileExtension)) {
      return 'Only .eml and .html files are supported'
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return 'File size must be less than 10MB'
    }
    
    return null
  }

  const processFile = async (uploadedFile: UploadedFile): Promise<void> => {
    const { file } = uploadedFile
    
    try {
      // Update status to uploading
      setFiles(prev => prev.map(f => 
        f.file === file ? { ...f, status: 'uploading' } : f
      ))

      // Read file content
      const content = await file.text()
      
      // Insert into database
      const { data, error } = await supabase
        .from('newsletters')
        .insert({
          filename: file.name,
          file_type: file.type || 'application/octet-stream',
          file_content: content,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Update status to success
      setFiles(prev => prev.map(f => 
        f.file === file ? { ...f, status: 'success', id: data.id } : f
      ))

      // Notify parent component
      if (onUploadComplete && data.id) {
        onUploadComplete(data.id)
      }

    } catch (error) {
      console.error('Upload error:', error)
      setFiles(prev => prev.map(f => 
        f.file === file ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Upload failed'
        } : f
      ))
    }
  }

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadedFile[] = []
    
    Array.from(fileList).forEach(file => {
      const error = validateFile(file)
      if (error) {
        newFiles.push({ file, status: 'error', error })
      } else {
        newFiles.push({ file, status: 'pending' })
      }
    })
    
    setFiles(prev => [...prev, ...newFiles])
    
    // Process valid files
    newFiles
      .filter(f => f.status === 'pending')
      .forEach(processFile)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      <Card 
        className={`p-8 border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="text-center">
          <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Drop your newsletter files here
          </h3>
          <p className="text-gray-600 mb-4">
            or click to browse and select files
          </p>
          <Button type="button">
            Choose Files
          </Button>
          <input
            id="file-input"
            type="file"
            multiple
            accept=".eml,.html,.htm"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Uploaded Files</h3>
          {files.map((uploadedFile, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(uploadedFile.status)}
                  <div>
                    <p className="font-medium text-gray-900">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(uploadedFile.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getStatusColor(uploadedFile.status)}`}>
                    {uploadedFile.status === 'pending' && 'Pending'}
                    {uploadedFile.status === 'uploading' && 'Uploading...'}
                    {uploadedFile.status === 'success' && 'Uploaded'}
                    {uploadedFile.status === 'error' && 'Failed'}
                  </p>
                  {uploadedFile.error && (
                    <p className="text-xs text-red-600 mt-1">
                      {uploadedFile.error}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Supported Formats */}
      <div className="grid grid-cols-2 gap-4">
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