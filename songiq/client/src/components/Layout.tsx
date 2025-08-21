import React from 'react'
import Header from './Header'
import Navigation from './Navigation'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <Navigation />
      <main className="w-full max-w-full px-4 py-8">
        {children}
      </main>
    </div>
  )
}

export default Layout 