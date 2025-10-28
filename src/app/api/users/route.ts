import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Simple file-based user storage (for demo purposes)
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json')

function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readUsers() {
  try {
    ensureDataDir()
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading users:', error)
  }
  return []
}

function writeUsers(users: any[]) {
  try {
    ensureDataDir()
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
  } catch (error) {
    console.error('Error writing users:', error)
  }
}

/**
 * API endpoint to view authenticated users
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update current user's last seen
    const users = readUsers()
    const currentUserEmail = session.user?.email
    const ADMIN_EMAIL = 'bhatiav0909@gmail.com'
    
    let userIndex = users.findIndex((u: any) => u.email === currentUserEmail)
    
    if (userIndex === -1) {
      // Add new user
      users.push({
        id: session.user?.id || `user-${Date.now()}`,
        name: session.user?.name || 'Unknown',
        email: currentUserEmail,
        image: session.user?.image || null,
        lastSeen: new Date().toISOString(),
        role: currentUserEmail === ADMIN_EMAIL ? 'admin' : 'user',
        createdAt: new Date().toISOString()
      })
    } else {
      // Update existing user
      users[userIndex].lastSeen = new Date().toISOString()
      users[userIndex].name = session.user?.name || users[userIndex].name
      users[userIndex].image = session.user?.image || users[userIndex].image
    }
    
    writeUsers(users)

    return NextResponse.json({
      users: users,
      total: users.length,
      currentUser: session.user?.email
    })

  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
