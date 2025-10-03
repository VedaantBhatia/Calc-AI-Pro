import UserProfile from '@/components/UserProfile'
import ServerUserInfo from '@/components/ServerUserInfo'
import AuthButton from '@/components/AuthButton'

/**
 * Demo page showing Steps 4-6 from OAUTH_SETUP.md
 * - Step 4: AuthButton component usage
 * - Step 5: Client-side session usage (UserProfile)
 * - Step 6: Server-side session usage (ServerUserInfo)
 */
export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[#121212] text-white px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#1F1F1F] border border-gray-700 rounded-xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-green-500 mb-6">OAuth Demo Page</h1>
          <p className="text-gray-300 mb-8">
            This page demonstrates Steps 4-6 from the OAUTH_SETUP.md guide
          </p>

          {/* Step 4: Auth Button */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-green-400 mb-4">Step 4: Auth Button</h2>
            <p className="text-gray-400 text-sm mb-4">
              The AuthButton component handles sign in/out functionality
            </p>
            <AuthButton />
          </section>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Step 5: Client Component Session */}
            <section>
              <h2 className="text-xl font-semibold text-green-400 mb-4">Step 5: Client Session</h2>
              <p className="text-gray-400 text-sm mb-4">
                Using <code className="bg-[#2A2A2A] px-2 py-1 rounded">useSession()</code> in a client component
              </p>
              <UserProfile />
            </section>

            {/* Step 6: Server Component Session */}
            <section>
              <h2 className="text-xl font-semibold text-green-400 mb-4">Step 6: Server Session</h2>
              <p className="text-gray-400 text-sm mb-4">
                Using <code className="bg-[#2A2A2A] px-2 py-1 rounded">auth()</code> in a server component
              </p>
              <ServerUserInfo />
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              <strong>Note:</strong> The main calculator page at <code className="bg-[#2A2A2A] px-2 py-1 rounded">/</code> now requires authentication.
              The Wolfram API route is protected and will return 401 Unauthorized if not signed in.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
