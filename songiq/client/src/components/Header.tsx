import { Logo } from '../assets'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Logo size={80} className="drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 songiq-logo">songIQ</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Music Intelligence Platform</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
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