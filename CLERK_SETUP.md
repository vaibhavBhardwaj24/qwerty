# Clerk Authentication Setup Guide

## ✅ What's Been Set Up

I've created custom sign-in and sign-up pages for your Next.js app with Clerk authentication. Here's what's been configured:

### Files Created/Modified:

1. **`middleware.ts`** - Route protection middleware
2. **`app/(auth)/sign-in/[[...sign-in]]/page.tsx`** - Custom sign-in page
3. **`app/(auth)/sign-up/[[...sign-up]]/page.tsx`** - Custom sign-up page
4. **`app/layout.tsx`** - Updated to remove redundant buttons

---

## 🚀 Next Steps to Complete Setup

### Step 1: Get Your Clerk API Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application or select your existing one
3. Navigate to **API Keys** in the sidebar
4. Copy your keys

### Step 2: Add Environment Variables

Add these to your `.env` file (create it if it doesn't exist):

```env
# Clerk API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx

# Clerk Routes
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

**Important:** Replace the placeholder keys with your actual keys from the Clerk Dashboard.

### Step 3: Configure Clerk Dashboard Settings

1. In your Clerk Dashboard, go to **Paths** (under User & Authentication)
2. Set the following paths:
   - **Sign-in path:** `/sign-in`
   - **Sign-up path:** `/sign-up`
   - **After sign-in:** `/` (or your preferred redirect)
   - **After sign-up:** `/` (or your preferred redirect)

### Step 4: Test Your Setup

1. Make sure your dev server is running:

   ```bash
   npm run dev
   ```

2. Visit these URLs to test:
   - Sign In: http://localhost:3000/sign-in
   - Sign Up: http://localhost:3000/sign-up

---

## 🎨 Customization Options

### Styling the Auth Components

The sign-in and sign-up pages use Clerk's `appearance` prop for customization. You can modify:

- **Colors:** Change gradient colors in the background and buttons
- **Layout:** Adjust the container width, padding, and spacing
- **Typography:** Modify font sizes and weights
- **Effects:** Add or remove glassmorphism, shadows, and animations

### Example: Change Button Colors

In `sign-in/[[...sign-in]]/page.tsx`, find:

```tsx
formButtonPrimary: "bg-gradient-to-r from-purple-600 to-blue-600 ...";
```

Change to your brand colors:

```tsx
formButtonPrimary: "bg-gradient-to-r from-green-600 to-teal-600 ...";
```

### Social Login Providers

To enable social logins (Google, GitHub, etc.):

1. Go to Clerk Dashboard → **Social Connections**
2. Enable the providers you want
3. Configure OAuth credentials for each provider
4. The buttons will automatically appear in your sign-in/sign-up forms

---

## 🔒 Route Protection

The `middleware.ts` file protects all routes except:

- `/sign-in`
- `/sign-up`
- `/` (home page)

### To Protect Additional Routes:

Modify the `isPublicRoute` matcher in `middleware.ts`:

```typescript
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/",
  "/about", // Add public routes here
  "/pricing",
]);
```

### To Make Routes Public:

Add them to the `isPublicRoute` array above.

---

## 🛠️ Common Use Cases

### 1. Get Current User in Server Components

```tsx
import { currentUser } from "@clerk/nextjs/server";

export default async function Page() {
  const user = await currentUser();

  if (!user) return <div>Not signed in</div>;

  return <div>Hello {user.firstName}!</div>;
}
```

### 2. Get Current User in Client Components

```tsx
"use client";
import { useUser } from "@clerk/nextjs";

export default function Page() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <div>Not signed in</div>;

  return <div>Hello {user.firstName}!</div>;
}
```

### 3. Protect API Routes

```typescript
// app/api/protected/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ message: "Protected data" });
}
```

### 4. Sign Out Programmatically

```tsx
"use client";
import { useClerk } from "@clerk/nextjs";

export default function SignOutButton() {
  const { signOut } = useClerk();

  return <button onClick={() => signOut()}>Sign Out</button>;
}
```

---

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Next.js App Router Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Customization Options](https://clerk.com/docs/components/customization/overview)
- [User Management](https://clerk.com/docs/users/overview)

---

## 🐛 Troubleshooting

### Issue: "Clerk: Missing publishableKey"

**Solution:** Make sure your `.env` file has `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and restart your dev server.

### Issue: Infinite redirect loop

**Solution:** Check that your middleware's `isPublicRoute` includes `/sign-in` and `/sign-up`.

### Issue: Styles not showing correctly

**Solution:** Ensure Tailwind CSS is properly configured and your `globals.css` is imported in `layout.tsx`.

### Issue: "Cannot find module '@clerk/nextjs/server'"

**Solution:** The package is already installed. Try restarting your TypeScript server or IDE.

---

## ✨ What Makes This Setup Special

1. **Beautiful UI:** Custom glassmorphism design with gradient backgrounds
2. **Fully Responsive:** Works perfectly on mobile, tablet, and desktop
3. **Type-Safe:** Full TypeScript support
4. **Production-Ready:** Includes middleware for route protection
5. **Customizable:** Easy to modify colors, layout, and behavior
6. **SEO-Friendly:** Proper meta tags and semantic HTML

---

**Need help?** Check the Clerk documentation or ask me any questions!
