'use client'

import { useSession } from 'next-auth/react'

/**
 * Example client component showing how to use session data
 * This demonstrates Step 5 from OAUTH_SETUP.md
 */
export default function UserProfile() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="text-gray-400">Loading...</div>
  }

  if (!session) {
    return <div className="text-gray-400">Please sign in</div>
  }

  return (
    <div className="bg-[#2A2A2A] border border-gray-700 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-green-400 mb-2">User Profile</h3>
      <div className="space-y-2 text-sm">
        <p><strong>Name:</strong> {session.user?.name || 'N/A'}</p>
        <p><strong>Email:</strong> {session.user?.email || 'N/A'}</p>
        <p><strong>Image:</strong> {session.user?.image ? (
          <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full inline ml-2" />
        ) : 'N/A'}</p>
      </div>
    </div>
  )
}
