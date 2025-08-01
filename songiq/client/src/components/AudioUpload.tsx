import { useState, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Play, Pause, Volume2, AlertCircle, CheckCircle } from 'lucide-react'
import { UploadFormData } from '@/types'

interface AudioUploadProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onRemoveFile: () => void
  isUploading?: boolean
  uploadProgress?: number
}

const AudioUpload = ({ 
  onFileSelect, 
  selectedFile, 
  onRemoveFile, 
  isUploading = false, 
  uploadProgress = 0 
}: AudioUploadProps) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      onFileSelect(file)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.m4a']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false
  })

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileType = (filename: string) => {
    return filename.split('.').pop()?.toUpperCase() || 'Unknown'
  }

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      {!selectedFile && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200
            ${isDragActive && !isDragReject 
              ? 'border-primary-500 bg-primary-50' 
              : isDragReject 
                ? 'border-error-500 bg-error-50' 
                : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
            }
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className={`
                p-4 rounded-full
                ${isDragActive && !isDragReject 
                  ? 'bg-primary-100 text-primary-600' 
                  : isDragReject 
                    ? 'bg-error-100 text-error-600' 
                    : 'bg-gray-100 text-gray-600'
                }
              `}>
                <Upload className="h-8 w-8" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {isDragActive 
                  ? isDragReject 
                    ? 'Invalid file type' 
                    : 'Drop your audio file here'
                  : 'Upload your song'
                }
              </h3>
              <p className="text-gray-600">
                {isDragReject 
                  ? 'Please upload a valid audio file (MP3, WAV, FLAC, M4A)'
                  : 'Drag & drop your audio file here, or click to browse'
                }
              </p>
            </div>

            <div className="text-sm text-gray-500 space-y-1">
              <p>Supported formats: MP3, WAV, FLAC, M4A</p>
              <p>Maximum file size: 50MB</p>
            </div>
          </div>
        </div>
      )}

      {/* Selected File Display */}
      {selectedFile && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Volume2 className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedFile.name}</h3>
                <p className="text-sm text-gray-600">
                  {getFileType(selectedFile.name)} • {getFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            
            <button
              onClick={onRemoveFile}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isUploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Audio Player */}
          <div className="space-y-3">
            <audio
              ref={audioRef}
              src={URL.createObjectURL(selectedFile)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
            />
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePlayPause}
                className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                disabled={isUploading}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Uploading...</span>
                <span className="text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* File Validation Status */}
          <div className="flex items-center space-x-2 text-sm">
            <CheckCircle className="h-4 w-4 text-success-600" />
            <span className="text-success-600">File validated successfully</span>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {isDragReject && (
        <div className="flex items-center space-x-2 text-error-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Please upload a valid audio file (MP3, WAV, FLAC, M4A)</span>
        </div>
      )}
    </div>
  )
}

export default AudioUpload 