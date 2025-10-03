# 👥 User Management Guide

## Current Implementation

### What You Have Now
- ✅ **Basic User List API** (`/api/users`) - Shows current user + mock data
- ✅ **UsersList Component** - Displays users in a nice UI
- ✅ **Admin Page** (`/admin`) - Dedicated admin interface
- ✅ **Authentication Required** - All user management requires login

### Current Features
- View authenticated users
- Display user info (name, email, profile image)
- Show user roles and last seen times
- Refresh user data
- Responsive design

## For Production: Database Integration

### Option 1: Simple File-Based Storage (For Testing)
```typescript
// /src/lib/users.ts
interface User {
  id: string
  name: string
  email: string
  image?: string
  role: 'admin' | 'user'
  createdAt: string
  lastSeen: string
}

class UserStore {
  private users: Map<string, User> = new Map()

  addUser(user: User) {
    this.users.set(user.id, user)
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values())
  }

  getUser(id: string): User | undefined {
    return this.users.get(id)
  }
}
```

### Option 2: Database Integration (Recommended)

**Choose one:**

#### Prisma + PostgreSQL (Recommended)
```bash
npm install prisma @prisma/client
npm install pg # PostgreSQL driver
```

#### Drizzle + SQLite (Simple)
```bash
npm install drizzle-orm better-sqlite3
```

#### MongoDB with Mongoose
```bash
npm install mongoose
```

## Enhanced API Endpoints

### Get All Users (Protected)
```typescript
// /src/app/api/users/route.ts
export async function GET() {
  const session = await auth()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin (you'd implement this)
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const users = await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      lastSeen: true,
    },
    orderBy: { lastSeen: 'desc' }
  })

  return NextResponse.json({ users })
}
```

### Update User Role (Admin Only)
```typescript
// /src/app/api/users/[id]/route.ts
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { role } = await req.json()

  const user = await db.user.update({
    where: { id: params.id },
    data: { role },
  })

  return NextResponse.json({ user })
}
```

## Role-Based Access Control

### Middleware for Protected Routes
```typescript
// /src/middleware.ts
import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Additional logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user has required role
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'admin'
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*']
}
```

### Client-Side Role Checking
```typescript
'use client'

import { useSession } from 'next-auth/react'

export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()

  if (session?.user?.role !== 'admin') {
    return <div>Access denied</div>
  }

  return <>{children}</>
}
```

## Environment Variables for Production

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/calc_ai_pro"

# NextAuth (already configured)
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://yourdomain.com

# OAuth (already configured)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Wolfram (already configured)
WOLFRAM_APP_ID=your-app-id
```

## Next Steps

1. **Choose a database** (Prisma + PostgreSQL recommended)
2. **Create user schema** and migration
3. **Add user registration** during OAuth sign-in
4. **Implement role management** (admin/user)
5. **Add more admin features** (analytics, settings, etc.)

## Current Demo

Visit `/admin` to see the current user management interface in action!

The current implementation shows:
- ✅ Authentication required
- ✅ User listing with mock data
- ✅ Role display
- ✅ Responsive UI
- 🔄 Ready for database integration
