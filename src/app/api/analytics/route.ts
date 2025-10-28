import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const ANALYTICS_FILE = path.join(process.cwd(), 'data', 'analytics.json')

function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

function readAnalytics() {
  try {
    ensureDataDir()
    if (fs.existsSync(ANALYTICS_FILE)) {
      const data = fs.readFileSync(ANALYTICS_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading analytics:', error)
  }
  return {
    totalCalculations: 0,
    calculationsByType: {
      differentiate: 0,
      integrate: 0,
      arithmetic: 0
    },
    calculationsByDay: []
  }
}

export async function GET() {
  try {
    const session = await auth()
    const ADMIN_EMAIL = 'bhatiav0909@gmail.com'

    if (!session || session.user?.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const analytics = readAnalytics()
    
    // Get user count
    const usersFile = path.join(process.cwd(), 'data', 'users.json')
    let userCount = 0
    if (fs.existsSync(usersFile)) {
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'))
      userCount = users.length
    }

    return NextResponse.json({
      ...analytics,
      totalUsers: userCount
    })

  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
