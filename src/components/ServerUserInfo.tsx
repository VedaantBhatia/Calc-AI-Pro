import { auth } from '@/lib/auth'

/**
 * Example server component showing how to use session data
 * This demonstrates Step 6 from OAUTH_SETUP.md
 */
export default async function ServerUserInfo() {
  const session = await auth()

  if (!session) {
    return (
      <div className="bg-[#2A2A2A] border border-gray-700 rounded-lg p-4">
        <p className="text-gray-400">Not authenticated (server-side check)</p>
      </div>
    )
  }

  return (
    <div className="bg-[#2A2A2A] border border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-green-400 mb-2">Server-Side Session</h3>
      <div className="space-y-2 text-sm">
        <p><strong>Authenticated:</strong> Yes</p>
        <p><strong>Email:</strong> {session.user?.email || 'N/A'}</p>
        <p className="text-xs text-gray-500 mt-2">
          This component was rendered on the server
        </p>
      </div>
    </div>
  )
}
