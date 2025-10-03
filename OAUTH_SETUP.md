# OAuth Setup Guide

OAuth authentication has been integrated into your Calc AI Pro app using NextAuth.js v5.

## ✅ What's Been Implemented

1. **NextAuth.js v5** installed and configured
2. **Google OAuth** provider configured
3. **Session management** with SessionProvider
4. **Protected API routes** - Wolfram API now requires authentication
5. **Auth UI component** - Ready-to-use AuthButton component

## 🔧 Setup Steps

### 1. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<paste-the-generated-secret-here>

# Google OAuth (see setup below)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if prompted
6. For Application type, select **Web application**
7. Add authorized redirect URI:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
8. Copy the **Client ID** and **Client Secret** to your `.env.local`

### 4. Add Auth Button to Your UI

✅ **Already implemented!** The AuthButton has been added to the main page.

You can also use it in other pages:

```tsx
import AuthButton from '@/components/AuthButton'

export default function Page() {
  return (
    <div>
      <AuthButton />
      {/* Your other components */}
    </div>
  )
}
```

**See it in action:** The main calculator page (`/`) and demo page (`/demo`) both use the AuthButton.

### 5. Use Session in Client Components

✅ **Already implemented!** See `UserProfile.tsx` component for a working example.

```tsx
'use client'

import { useSession } from 'next-auth/react'

export default function Component() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Please sign in</div>

  return <div>Welcome, {session.user?.name}!</div>
}
```

**Example:** Check out `/src/components/UserProfile.tsx` and view it at `/demo`

### 6. Use Session in Server Components

✅ **Already implemented!** See `ServerUserInfo.tsx` component for a working example.

```tsx
import { auth } from '@/app/api/auth/[...nextauth]/route'

export default async function ServerComponent() {
  const session = await auth()

  if (!session) {
    return <div>Not authenticated</div>
  }

  return <div>Welcome, {session.user?.name}!</div>
}
```

**Example:** Check out `/src/components/ServerUserInfo.tsx` and view it at `/demo`

## 🔒 Protected Routes

The Wolfram API route (`/api/wolfram`) is now protected and requires authentication. Users must sign in before making API calls.

## 🚀 Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000` for the main calculator

3. Or visit `http://localhost:3000/demo` to see all OAuth features in action

4. Click "Sign in with Google"

5. After signing in, you should see your email and a "Sign out" button

6. Try using the calculator - it now requires authentication!

## 📝 Notes

- For production, update `NEXTAUTH_URL` to your production domain
- Update OAuth redirect URIs in Google to include your production URL
- Keep your secrets secure and never commit `.env.local` to version control
- The `env.example` file has been created as a template

## 🔗 Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
