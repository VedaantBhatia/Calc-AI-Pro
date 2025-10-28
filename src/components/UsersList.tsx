'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

interface User {
  id: string
  name: string
  email: string
  image: string | null
  lastSeen: string
  role: string
}

interface UsersResponse {
  users: User[]
  total: number
  currentUser: string
}

/**
 * Component to display a list of users
 * Requires authentication to view
 */
export default function UsersList() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers()
    }
  }, [status])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/users')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: UsersResponse = await response.json()
      setUsers(data.users)

    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="text-center text-gray-400">Checking authentication...</div>
  }

  if (!session) {
    return (
      <div className="text-center text-red-400">
        <p>You must be signed in to view users</p>
      </div>
    )
  }

  return (
    <div className="bg-[#2A2A2A] border border-gray-700 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-green-400">👥 Users Directory</h2>
        <button
          onClick={fetchUsers}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded p-3 mb-4">
          <p className="text-red-200 text-sm">Error: {error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-8">Loading users...</div>
      ) : (
        <div className="space-y-3">
          {users.map((user: User) => (
            <div
              key={user.id}
              className={`p-4 rounded-lg border ${
                user.id === session.user?.id
                  ? 'bg-green-900/20 border-green-700'
                  : 'bg-[#1F1F1F] border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{user.name}</h3>
                    {user.id === session.user?.id && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                        You
                      </span>
                    )}
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.role === 'admin'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-600 text-gray-300'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{user.email}</p>
                  <p className="text-xs text-gray-500">
                    Last seen: {new Date(user.lastSeen).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-center text-sm text-gray-500">
        Total users: {users.length}
      </div>
    </div>
  )
}
