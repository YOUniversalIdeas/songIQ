import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Upload, Music, Calendar, Globe, AlertCircle } from 'lucide-react'
import AudioUpload from '@/components/AudioUpload'
import { UploadFormData } from '@/types'

const UploadPage = () => {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isReleased, setIsReleased] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue
  } = useForm<UploadFormData>()

  const watchedIsReleased = watch('isReleased')

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setValue('audioFile', file)
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setValue('audioFile', undefined)
  }

  const onSubmit = async (data: UploadFormData) => {
    if (!selectedFile) {
      alert('Please select an audio file')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('audioFile', selectedFile)
      formData.append('title', data.title)
      formData.append('artist', data.artist)
      formData.append('isReleased', data.isReleased.toString())
      
      if (data.isReleased && data.releaseDate) {
        formData.append('releaseDate', data.releaseDate.toISOString())
      }
      
      if (data.isReleased && data.platforms) {
        data.platforms.forEach(platform => {
          formData.append('platforms[]', platform)
        })
      }

      // TODO: Replace with actual API call
      // const response = await uploadSong(formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Navigate to analysis page with song ID
      // navigate(`/analysis/${response.data.songId}`)
      navigate('/analysis/demo-song-id')
      
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const platforms = [
    { id: 'spotify', label: 'Spotify' },
    { id: 'apple', label: 'Apple Music' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'soundcloud', label: 'SoundCloud' },
    { id: 'tidal', label: 'Tidal' },
    { id: 'amazon', label: 'Amazon Music' }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 bg-primary-100 rounded-full">
            <Upload className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Your Song</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Upload your audio file and provide song information to get started with your analysis.
          Our AI will analyze your music and provide insights about its potential success.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Audio Upload Section */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Music className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Audio File</h2>
          </div>
          
          <AudioUpload
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onRemoveFile={handleRemoveFile}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
          />
        </div>

        {/* Song Information Section */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Music className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Song Information</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Song Title *
              </label>
              <input
                type="text"
                id="title"
                {...register('title', { 
                  required: 'Song title is required',
                  maxLength: { value: 100, message: 'Title must be less than 100 characters' }
                })}
                className="input-field"
                placeholder="Enter song title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-error-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.title.message}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-2">
                Artist Name *
              </label>
              <input
                type="text"
                id="artist"
                {...register('artist', { 
                  required: 'Artist name is required',
                  maxLength: { value: 100, message: 'Artist name must be less than 100 characters' }
                })}
                className="input-field"
                placeholder="Enter artist name"
              />
              {errors.artist && (
                <p className="mt-1 text-sm text-error-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.artist.message}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Release Status Section */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Globe className="h-5 w-5 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Release Status</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Has this song been released? *
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="false"
                    {...register('isReleased', { required: 'Please select release status' })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="text-gray-900">Not yet released</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value="true"
                    {...register('isReleased', { required: 'Please select release status' })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="text-gray-900">Already released</span>
                </label>
              </div>
              {errors.isReleased && (
                <p className="mt-1 text-sm text-error-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.isReleased.message}</span>
                </p>
              )}
            </div>

            {/* Conditional fields for released songs */}
            {watchedIsReleased === 'true' && (
              <div className="space-y-6 pt-4 border-t border-gray-200">
                <div>
                  <label htmlFor="releaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Release Date
                  </label>
                  <input
                    type="date"
                    id="releaseDate"
                    {...register('releaseDate')}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Platforms (select all that apply)
                  </label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {platforms.map((platform) => (
                      <label key={platform.id} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          value={platform.id}
                          {...register('platforms')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-900">{platform.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting || isUploading || !selectedFile}
            className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Upload className="h-5 w-5" />
            <span>
              {isUploading ? 'Uploading...' : isSubmitting ? 'Processing...' : 'Start Analysis'}
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default UploadPage 