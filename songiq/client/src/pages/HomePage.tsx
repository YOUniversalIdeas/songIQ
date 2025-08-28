import { Link } from 'react-router-dom'
import { Upload, BarChart3, TrendingUp, Zap, Target, Users, BarChart } from 'lucide-react'
import RealTimeStats from '../components/RealTimeStats'

const HomePage = () => {
  const features = [
    {
      icon: Upload,
      title: 'Upload & Analyze',
      description: 'Upload your songs and get instant AI-powered analysis of musical features, genre classification, and success predictions.'
    },
    {
      icon: BarChart3,
      title: 'Detailed Insights',
      description: 'Get comprehensive breakdowns of tempo, key, energy, mood, and vocal characteristics with professional-grade accuracy.'
    },
    {
      icon: TrendingUp,
      title: 'Success Prediction',
      description: 'Our AI compares your song to successful tracks and provides predictions about potential chart performance and streaming success.'
    },
    {
      icon: Target,
      title: 'Market Intelligence',
      description: 'Understand current music trends, compare to similar artists, and get actionable insights to improve your hit potential.'
    },
    {
      icon: Users,
      title: 'Performance Tracking',
      description: 'For released songs, track streaming numbers, chart positions, and social media engagement in real-time.'
    },
    {
      icon: Zap,
      title: 'Instant Results',
      description: 'Get your analysis results in minutes, not days. Our advanced AI processes your music quickly and accurately.'
    }
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-100">
            Unlock Your Song's
            <span className="text-primary-600"> Potential</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            songIQ uses advanced AI to analyze your music and predict its success. 
            Get professional insights, market comparisons, and actionable recommendations.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/upload"
            className="btn-primary text-lg px-8 py-3 flex items-center justify-center space-x-2"
          >
            <Upload className="h-5 w-5" />
            <span>Upload Your Song</span>
          </Link>
          <Link
            to="/dashboard"
            className="btn-secondary text-lg px-8 py-3 flex items-center justify-center space-x-2"
          >
            <BarChart className="h-5 w-5" />
            <span>View Dashboard</span>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our comprehensive platform provides all the tools and insights you need 
            to understand your music's potential and make informed decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="card space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Stats Section */}
      <section>
        <RealTimeStats />
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Ready to Discover Your Song's Potential?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Join thousands of artists who are already using songIQ to make better 
            music decisions and increase their chances of success.
          </p>
        </div>
        
        <Link
          to="/upload"
          className="btn-primary text-lg px-8 py-3 inline-flex items-center space-x-2"
        >
          <Upload className="h-5 w-5" />
          <span>Start Your Analysis</span>
        </Link>
      </section>
    </div>
  )
}

export default HomePage 