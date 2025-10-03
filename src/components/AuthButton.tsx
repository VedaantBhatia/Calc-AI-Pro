'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export default function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="text-sm text-gray-500">Loading...</div>
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm">
          Signed in as <strong>{session.user?.email}</strong>
        </span>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
    >
      Sign in with Google
    </button>
  )
}
