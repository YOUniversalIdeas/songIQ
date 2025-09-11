import React from 'react'
import Header from './Header'
import Navigation from './Navigation'
import Footer from './Footer'

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      <Header />
      <Navigation />
      <main className="w-full max-w-full px-4 flex-1" style={{paddingTop: '0px', paddingBottom: '0px'}}>
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout 