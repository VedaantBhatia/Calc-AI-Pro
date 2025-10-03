import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API endpoint to view authenticated users
 * This is a basic example - in production, you'd store users in a database
 */
export async function GET(req: NextRequest) {
  try {
    // Check if the current user is authenticated and authorized
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For demo purposes, we'll just return the current user's info
    // In a real app, you'd query a database for all users
    const currentUser = {
      id: (session.user as any)?.id || 'unknown',
      name: session.user?.name || 'Unknown',
      email: session.user?.email || 'No email',
      image: session.user?.image || null,
      lastSeen: new Date().toISOString(),
      role: 'user' // In real app, this would come from database
    }

    // Simulate a list of users (in real app, query database)
    const mockUsers = [
      currentUser,
      {
        id: 'user-2',
        name: 'Demo User 2',
        email: 'user2@example.com',
        image: null,
        lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        role: 'user'
      }
    ]

    return NextResponse.json({
      users: mockUsers,
      total: mockUsers.length,
      currentUser: currentUser.id
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
