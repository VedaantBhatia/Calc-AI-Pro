# Vercel Deployment Guide

## 🚨 Fix for "Server error - There is a problem with the server configuration"

This error occurs when NextAuth environment variables are missing on Vercel.

## Required Environment Variables on Vercel

You need to add these environment variables in your Vercel project settings:

### 1. Go to Vercel Dashboard
1. Navigate to your project: https://vercel.com/vedaant-bhatias-projects/calc-ai-pro
2. Click **Settings** → **Environment Variables**

### 2. Add These Variables

#### NEXTAUTH_SECRET (Required)
```
NEXTAUTH_SECRET=+Q9lwXFSwIsT4VxyAhOo81qxc9v2a/ixiQ+pZrGqmaw=
```
Or generate a new one:
```bash
openssl rand -base64 32
```

#### NEXTAUTH_URL (Required for Production)
```
NEXTAUTH_URL=https://calc-ai-pro.vercel.app
```
**Critical:** This MUST be your production domain, NOT `http://localhost:3000`. This prevents redirect loops to localhost after OAuth login.

#### GOOGLE_CLIENT_ID (Required)
```
GOOGLE_CLIENT_ID=your-google-client-id-here
```

#### GOOGLE_CLIENT_SECRET (Required)
```
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
```

#### WOLFRAM_APP_ID (Required)
```
WOLFRAM_APP_ID=your-wolfram-app-id-here
```

### 3. Update Google OAuth Redirect URIs

In your Google Cloud Console, add the production callback URL:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   ```
   https://calc-ai-pro.vercel.app/api/auth/callback/google
   ```

### 4. Redeploy

After adding the environment variables:
1. Go to **Deployments** tab in Vercel
2. Click the three dots on the latest deployment
3. Click **Redeploy**

Or push a new commit to trigger a deployment.

## Environment Variable Checklist

- [ ] `NEXTAUTH_SECRET` - Added to Vercel
- [ ] `NEXTAUTH_URL` - Set to `https://calc-ai-pro.vercel.app`
- [ ] `GOOGLE_CLIENT_ID` - Added to Vercel
- [ ] `GOOGLE_CLIENT_SECRET` - Added to Vercel
- [ ] `WOLFRAM_APP_ID` - Added to Vercel
- [ ] Google OAuth redirect URI updated with production URL
- [ ] Redeployed after adding variables

## Testing After Deployment

1. Visit: https://calc-ai-pro.vercel.app
2. You should see the calculator page without errors
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. Try using the calculator

## Common Issues

### Issue: Still getting 500 errors after adding variables
**Solution:** Make sure to redeploy after adding environment variables. Vercel doesn't automatically apply them to existing deployments.

### Issue: OAuth redirect error or redirecting to localhost
**Solution:** 
1. Make sure `NEXTAUTH_URL` is set to your production domain: `https://calc-ai-pro.vercel.app`
2. Verify the Google OAuth redirect URI exactly matches:
   ```
   https://calc-ai-pro.vercel.app/api/auth/callback/google
   ```
3. The code includes `trustHost: true` to handle Vercel's proxy correctly

### Issue: "Configuration" error
**Solution:** Verify `NEXTAUTH_SECRET` is set and is a valid base64 string (at least 32 characters).

## Quick Fix Commands

If you have Vercel CLI installed:

```bash
# Set environment variables via CLI
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add WOLFRAM_APP_ID

# Redeploy
vercel --prod
```

## Support

If issues persist, check:
1. Vercel deployment logs for specific error messages
2. Ensure all environment variables are set for "Production" environment
3. Verify Google OAuth credentials are correct
