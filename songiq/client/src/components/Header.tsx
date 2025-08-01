import { Music, Brain } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Music className="h-8 w-8 text-primary-600" />
              <Brain className="h-6 w-6 text-secondary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">songIQ</h1>
              <p className="text-sm text-gray-600">Music Intelligence Platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <span>Powered by AI</span>
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 