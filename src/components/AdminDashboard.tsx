'use client'

import { useState } from 'react'
import UsersList from './UsersList'
import AuthButton from './AuthButton'

type View = 'users' | 'analytics' | 'management' | 'settings'

interface Analytics {
  totalUsers: number
  totalCalculations: number
  calculationsByType: {
    differentiate?: number
    integrate?: number
    arithmetic?: number
  }
}

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<View>('users')
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)

  const loadAnalytics = async () => {
    setLoadingAnalytics(true)
    try {
      const res = await fetch('/api/analytics')
      const data = await res.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoadingAnalytics(false)
    }
  }

  const handleViewChange = (view: View) => {
    setActiveView(view)
    if (view === 'analytics' && !analytics) {
      loadAnalytics()
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0a0a0a] to-gray-900 text-white px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Manage users and view application data</p>
          </div>
          <AuthButton />
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => handleViewChange('users')}
            className={`px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeView === 'users'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                : 'bg-[#1a1a1a] border border-gray-800 text-gray-400 hover:border-green-500/50'
            }`}
          >
            👥 Users Directory
          </button>
          <button
            onClick={() => handleViewChange('analytics')}
            className={`px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeView === 'analytics'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'bg-[#1a1a1a] border border-gray-800 text-gray-400 hover:border-blue-500/50'
            }`}
          >
            📊 Analytics
          </button>
          <button
            onClick={() => handleViewChange('management')}
            className={`px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeView === 'management'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                : 'bg-[#1a1a1a] border border-gray-800 text-gray-400 hover:border-purple-500/50'
            }`}
          >
            ⚙️ User Management
          </button>
          <button
            onClick={() => handleViewChange('settings')}
            className={`px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeView === 'settings'
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                : 'bg-[#1a1a1a] border border-gray-800 text-gray-400 hover:border-orange-500/50'
            }`}
          >
            🔧 Settings
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {activeView === 'users' && (
            <div className="p-6">
              <UsersList />
            </div>
          )}

          {activeView === 'analytics' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-400">📊 Analytics Dashboard</h2>
                <button
                  onClick={loadAnalytics}
                  disabled={loadingAnalytics}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition disabled:opacity-50"
                >
                  {loadingAnalytics ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {loadingAnalytics ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading analytics...</p>
                </div>
              ) : analytics ? (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-5">
                      <div className="text-gray-400 text-sm mb-1">Total Users</div>
                      <div className="text-3xl font-bold text-green-400">{analytics.totalUsers || 0}</div>
                    </div>
                    <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-5">
                      <div className="text-gray-400 text-sm mb-1">Total Calculations</div>
                      <div className="text-3xl font-bold text-blue-400">{analytics.totalCalculations || 0}</div>
                    </div>
                    <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-5">
                      <div className="text-gray-400 text-sm mb-1">Derivatives</div>
                      <div className="text-3xl font-bold text-purple-400">{analytics.calculationsByType?.differentiate || 0}</div>
                    </div>
                    <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-5">
                      <div className="text-gray-400 text-sm mb-1">Integrals</div>
                      <div className="text-3xl font-bold text-pink-400">{analytics.calculationsByType?.integrate || 0}</div>
                    </div>
                  </div>

                  {/* Calculation Types Breakdown */}
                  <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-300 mb-4">Calculations by Type</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Derivatives</span>
                          <span className="text-purple-400">{analytics.calculationsByType?.differentiate || 0}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{ width: `${analytics.totalCalculations > 0 ? ((analytics.calculationsByType?.differentiate || 0) / analytics.totalCalculations * 100) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Integrals</span>
                          <span className="text-blue-400">{analytics.calculationsByType?.integrate || 0}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: `${analytics.totalCalculations > 0 ? ((analytics.calculationsByType?.integrate || 0) / analytics.totalCalculations * 100) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Arithmetic</span>
                          <span className="text-green-400">{analytics.calculationsByType?.arithmetic || 0}</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                            style={{ width: `${analytics.totalCalculations > 0 ? ((analytics.calculationsByType?.arithmetic || 0) / analytics.totalCalculations * 100) : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-4">No analytics data available yet</p>
                  <button
                    onClick={loadAnalytics}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
                  >
                    Load Analytics
                  </button>
                </div>
              )}
            </div>
          )}

          {activeView === 'management' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-purple-400 mb-4">⚙️ User Management</h2>
              <div className="bg-purple-900/20 border border-purple-700/50 rounded-xl p-6">
                <p className="text-gray-300 mb-4">
                  User management features allow you to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-400">
                  <li>Change user roles (admin/user)</li>
                  <li>Suspend or activate user accounts</li>
                  <li>View detailed user activity logs</li>
                  <li>Export user data</li>
                </ul>
                <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    💡 <strong>Coming Soon:</strong> Advanced user management features are currently in development.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeView === 'settings' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-orange-400 mb-4">🔧 Application Settings</h2>
              <div className="space-y-4">
                <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-300 mb-2">API Configuration</h3>
                  <p className="text-gray-400 text-sm mb-3">Manage Wolfram Alpha API settings and rate limits</p>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition">
                    Configure API
                  </button>
                </div>
                
                <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-300 mb-2">Security Settings</h3>
                  <p className="text-gray-400 text-sm mb-3">Configure authentication and access controls</p>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition">
                    Manage Security
                  </button>
                </div>
                
                <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-300 mb-2">Email Notifications</h3>
                  <p className="text-gray-400 text-sm mb-3">Set up email alerts for important events</p>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition">
                    Configure Emails
                  </button>
                </div>

                <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    💡 <strong>Coming Soon:</strong> Full settings configuration will be available in the next update.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
