import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Music, FileAudio, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'analyzing' | 'completed' | 'error';

interface UploadProgress {
  status: UploadStatus;
  progress: number;
  message: string;
  error?: string;
}

interface UploadedFile {
  file: File;
  preview: string;
  metadata: {
    name: string;
    size: string;
    type: string;
    duration?: string;
  };
}

interface SongUploadProps {
  onUploadComplete?: (result: any) => void;
  className?: string;
}

const SongUpload: React.FC<SongUploadProps> = ({ onUploadComplete, className = '' }) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    status: 'idle',
    progress: 0,
    message: 'Drag and drop your audio file here, or click to browse'
  });
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: 'pop',
    isReleased: 'false',
    description: '',
    targetReleaseDate: ''
  });

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: 'File upload failed',
        error: error.message
      });
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      // Validate file
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        setUploadProgress({
          status: 'error',
          progress: 0,
          message: 'File too large',
          error: 'Maximum file size is 50MB'
        });
        return;
      }

      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'audio/flac'];
      if (!allowedTypes.includes(file.type)) {
        setUploadProgress({
          status: 'error',
          progress: 0,
          message: 'Invalid file type',
          error: 'Please upload MP3, WAV, M4A, or FLAC files only'
        });
        return;
      }

      // Create file preview
      const preview = URL.createObjectURL(file);
      const metadata = {
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        duration: undefined as string | undefined
      };

      setUploadedFile({ file, preview, metadata });
      setUploadProgress({
        status: 'idle',
        progress: 0,
        message: 'File ready for upload'
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.flac']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setUploadProgress({
      status: 'uploading',
      progress: 0,
      message: 'Uploading file...'
    });

    try {
      const data = new FormData();
      data.append('audioFile', uploadedFile.file);
      data.append('title', formData.title);
      data.append('artist', formData.artist);
      data.append('genre', formData.genre);
      data.append('isReleased', formData.isReleased);
      if (formData.description) data.append('description', formData.description);
      if (formData.targetReleaseDate) data.append('targetReleaseDate', formData.targetReleaseDate);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev.progress < 90) {
            return {
              ...prev,
              progress: prev.progress + 10,
              message: prev.progress < 30 ? 'Uploading file...' : 
                      prev.progress < 60 ? 'Processing audio...' : 
                      'Analyzing features...'
            };
          }
          return prev;
        });
      }, 200);

      const response = await fetch('/api/songs/upload', {
        method: 'POST',
        body: data
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Upload failed');
      }

      const result = await response.json();

      setUploadProgress({
        status: 'completed',
        progress: 100,
        message: 'Upload completed successfully!'
      });

      onUploadComplete?.(result.data);

    } catch (error) {
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: 'Upload failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadProgress({
      status: 'idle',
      progress: 0,
      message: 'Drag and drop your audio file here, or click to browse'
    });
    setFormData({
      title: '',
      artist: '',
      genre: 'pop',
      isReleased: 'false',
      description: '',
      targetReleaseDate: ''
    });
  };

  const isFormValid = uploadedFile && formData.title && formData.artist;

  return (
    <div className={`song-upload ${className}`}>
      {/* Upload Area */}
      <div className="mb-8">
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
            ${isDragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : isDragReject 
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
            ${uploadedFile ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            {uploadedFile ? (
              <>
                <CheckCircle className="w-12 h-12 text-green-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    File Ready
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {uploadedFile.metadata.name}
                  </p>
                </div>
              </>
            ) : (
              <>
                {isDragActive ? (
                  <Upload className="w-12 h-12 text-blue-500 animate-bounce" />
                ) : (
                  <Music className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {isDragActive ? 'Drop your audio file here' : 'Upload Audio File'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {uploadProgress.message}
                  </p>
                </div>
              </>
            )}
          </div>

          {uploadProgress.error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-300">
                  {uploadProgress.error}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Preview */}
      {uploadedFile && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileAudio className="w-8 h-8 text-blue-500" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {uploadedFile.metadata.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {uploadedFile.metadata.size} • {uploadedFile.metadata.type}
              </p>
            </div>
            <button
              onClick={resetUpload}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress.status === 'uploading' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {uploadProgress.message}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {uploadProgress.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Song Information Form */}
      {uploadedFile && uploadProgress.status !== 'uploading' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Song Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Song Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter song title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Artist *
              </label>
              <input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter artist name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Genre
              </label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="pop">Pop</option>
                <option value="hip_hop">Hip Hop</option>
                <option value="rock">Rock</option>
                <option value="electronic">Electronic</option>
                <option value="r&b">R&B</option>
                <option value="country">Country</option>
                <option value="jazz">Jazz</option>
                <option value="classical">Classical</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Release Status
              </label>
              <select
                name="isReleased"
                value={formData.isReleased}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="false">Unreleased</option>
                <option value="true">Released</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Optional description of your song"
            />
          </div>

          {formData.isReleased === 'false' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Release Date
              </label>
              <input
                type="date"
                name="targetReleaseDate"
                value={formData.targetReleaseDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={resetUpload}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!isFormValid || uploadProgress.status === ('uploading' as UploadStatus)}
              className={`
                px-6 py-2 rounded-md font-medium transition-colors flex items-center space-x-2
                ${isFormValid && uploadProgress.status !== ('uploading' as UploadStatus)
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {uploadProgress.status === ('uploading' as UploadStatus) ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload & Analyze</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Success Message */}
      {uploadProgress.status === 'completed' && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700 dark:text-green-300 font-medium">
              {uploadProgress.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SongUpload; 