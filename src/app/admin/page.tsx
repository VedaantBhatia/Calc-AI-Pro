import UsersList from '@/components/UsersList'
import AuthButton from '@/components/AuthButton'

/**
 * Admin page to view users and manage the application
 * Requires authentication to access
 */
export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#121212] text-white px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#1F1F1F] border border-gray-700 rounded-xl p-8 shadow-lg">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-green-500 mb-2">Admin Dashboard</h1>
              <p className="text-gray-300">
                Manage users and view application data
              </p>
            </div>
            <AuthButton />
          </div>

          {/* Users Section */}
          <section>
            <UsersList />
          </section>

          {/* Future Admin Features */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-green-400 mb-4">Future Features</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-[#2A2A2A] p-4 rounded-lg">
                <h4 className="font-semibold text-blue-400 mb-2">📊 Analytics</h4>
                <p className="text-gray-400">View usage statistics and trends</p>
              </div>
              <div className="bg-[#2A2A2A] p-4 rounded-lg">
                <h4 className="font-semibold text-purple-400 mb-2">👥 User Management</h4>
                <p className="text-gray-400">Edit user roles and permissions</p>
              </div>
              <div className="bg-[#2A2A2A] p-4 rounded-lg">
                <h4 className="font-semibold text-orange-400 mb-2">🔧 Settings</h4>
                <p className="text-gray-400">Configure application settings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
