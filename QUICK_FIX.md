# 🚨 Quick Fix for Vercel "Server Error"

## The Problem
Your app is showing: **"There is a problem with the server configuration"**

This happens because **NextAuth environment variables are missing** on Vercel.

## The Solution (5 minutes)

### Step 1: Add Environment Variables to Vercel

Go to: https://vercel.com/vedaant-bhatias-projects/calc-ai-pro/settings/environment-variables

Add these 5 variables:

| Variable Name | Value | Where to Get It |
|--------------|-------|-----------------|
| `NEXTAUTH_SECRET` | `+Q9lwXFSwIsT4VxyAhOo81qxc9v2a/ixiQ+pZrGqmaw=` | Use this or generate new with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://calc-ai-pro.vercel.app` | Your production Vercel domain |
| `GOOGLE_CLIENT_ID` | Your Google Client ID | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret | Google Cloud Console |
| `WOLFRAM_APP_ID` | Your Wolfram App ID | Wolfram Alpha Developer Portal |

**Important:** 
- Make sure to select **"Production"** environment for all variables!
- `NEXTAUTH_URL` must be your **production domain**, NOT localhost
- The code now includes `trustHost: true` to handle Vercel's proxy correctly

### Step 2: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, add:
   ```
   https://calc-ai-pro.vercel.app/api/auth/callback/google
   ```
5. Click **Save**

### Step 3: Redeploy

1. Go to your Vercel dashboard
2. Click **Deployments** tab
3. Find the latest deployment
4. Click the three dots (•••) → **Redeploy**

## ✅ Done!

After redeployment completes (~2 minutes), visit:
- https://calc-ai-pro.vercel.app

The error should be gone and you should see the calculator with a "Sign in with Google" button.

## Still Having Issues?

See `VERCEL_DEPLOYMENT.md` for detailed troubleshooting.
