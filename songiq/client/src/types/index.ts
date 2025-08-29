// Local types to avoid import issues
export * from './local'

// Client-specific types
export interface AudioAnalysisState {
  isAnalyzing: boolean
  progress: number
  currentStep: string
  error?: string
}

export interface UploadState {
  isUploading: boolean
  progress: number
  error?: string
}

export interface AnalysisProgress {
  step: string
  progress: number
  description: string
}

// Form validation types
export interface FormErrors {
  [key: string]: string
}

// UI state types
export interface LoadingState {
  isLoading: boolean
  message?: string
}

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
} 