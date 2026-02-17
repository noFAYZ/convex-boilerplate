# Setup Guide

This is a Next.js boilerplate with Convex database, authentication, and multi-tenant organization support.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Convex

Initialize your Convex development environment:

```bash
npx convex dev
```

This will:
- Create a Convex account (if you don't have one)
- Create a new project
- Generate your `NEXT_PUBLIC_CONVEX_URL`
- Create the `.env.local` file with your Convex URL
- Deploy your schema and functions

### 3. Start Development Server

In a separate terminal, run:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

---

## 📚 What's Included

### ✅ Authentication
- **Email/Password Registration & Login** powered by Convex Auth
- Secure session management
- Protected routes and layouts
- Auth state management with React hooks

### ✅ Multi-tenant Organizations
- Create and manage organizations
- Role-based access control (Owner, Admin, Member)
- Invite members to organizations
- Organization switcher

### ✅ Database (Convex)
- Real-time data synchronization
- Type-safe queries and mutations
- Automatic TypeScript types generation
- Optimized with indexes and search

### ✅ UI Components (shadcn/ui)
- Modern, accessible components
- Base Mira style theme
- Fully customizable with Tailwind CSS

---

## 🗂️ Project Structure

```
convex-boilerplate/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (protected)/              # Protected pages
│   │   ├── dashboard/
│   │   └── settings/
│   ├── layout.tsx                # Root layout with ConvexProvider
│   └── page.tsx                  # Landing page
│
├── components/
│   ├── auth/                     # Auth components
│   │   ├── login-form.tsx
│   │   ├── register-form.tsx
│   │   ├── auth-button.tsx
│   │   └── protected-layout.tsx
│   ├── organizations/            # Organization components
│   │   ├── org-switcher.tsx
│   │   ├── member-list.tsx
│   │   └── invite-member-dialog.tsx
│   ├── providers/
│   │   └── convex-provider.tsx   # Convex client setup
│   └── ui/                       # shadcn components
│
├── convex/                       # Convex backend
│   ├── _generated/               # Auto-generated types
│   ├── schema.ts                 # Database schema
│   ├── auth.ts                   # Auth configuration
│   ├── http.ts                   # HTTP routes
│   ├── users.ts                  # User functions
│   ├── organizations.ts          # Organization functions
│   ├── members.ts                # Member functions
│   └── lib/
│       └── auth.ts               # Auth helpers
│
├── lib/
│   └── utils.ts                  # Utility functions
│
└── middleware.ts                 # Next.js middleware
```

---

## 🔐 Authentication Flow

### Registration
1. User fills out the registration form at `/register`
2. Convex Auth creates a new user account
3. User is automatically logged in
4. Redirect to `/dashboard`

### Login
1. User enters credentials at `/login`
2. Convex Auth validates and creates a session
3. Redirect to `/dashboard`

### Protected Routes
- Routes in `app/(protected)/` are wrapped with `ProtectedLayout`
- Unauthenticated users are redirected to `/login`
- Uses Convex's `Authenticated` and `Unauthenticated` components

---

## 🏢 Organization Management

### Creating an Organization
1. Navigate to `/settings/organization`
2. Fill in organization name and slug
3. You become the owner automatically

### Roles & Permissions

| Role   | Permissions                                      |
|--------|--------------------------------------------------|
| Owner  | Full access, can delete org, change any role     |
| Admin  | Can invite/remove members, update org settings   |
| Member | Read-only access to organization                 |

### Inviting Members
1. Navigate to organization settings
2. Click "Invite Member"
3. Enter email and select role
4. An invitation token is generated
5. Member can accept via the invitation link

---

## 🛠️ Development

### Available Scripts

```bash
# Start Next.js dev server
npm run dev

# Start Convex dev environment
npx convex dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Convex Dashboard

Access your Convex dashboard at: [https://dashboard.convex.dev](https://dashboard.convex.dev)

Here you can:
- View your database tables and data
- Test queries and mutations
- Monitor function logs
- Manage deployments

---

## 📝 Key Files to Customize

### Database Schema
**File:** `convex/schema.ts`

Add new tables or modify existing ones:

```typescript
// Add a new table
posts: defineTable({
  title: v.string(),
  content: v.string(),
  authorId: v.id("users"),
  createdAt: v.number(),
}).index("by_author", ["authorId"]),
```

### Queries & Mutations
Create new files in `convex/` directory:

```typescript
// convex/posts.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { auth } from "./lib/auth";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("posts").collect();
  },
});
```

### Adding Components
Use shadcn CLI to add more components:

```bash
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add tabs
```

---

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Vercel will auto-detect Next.js
4. Add environment variable: `NEXT_PUBLIC_CONVEX_URL`
5. Deploy!

### Deploy Convex

```bash
npx convex deploy
```

This deploys your Convex backend to production.

**Important:** After deploying to Convex production, update your `.env.local` and Vercel environment variables with the production Convex URL.

---

## 🔧 Troubleshooting

### "NEXT_PUBLIC_CONVEX_URL is not set" Error
- Run `npx convex dev` to generate the URL
- Check that `.env.local` exists and contains the URL
- Restart your Next.js dev server

### Authentication Not Working
- Ensure Convex dev server is running (`npx convex dev`)
- Check browser console for errors
- Verify ConvexProvider is wrapping your app in `app/layout.tsx`

### Organization Features Not Showing
- Make sure you've created an organization first
- Check that you're logged in
- Verify the user is a member of at least one organization

---

## 📚 Learn More

- [Convex Documentation](https://docs.convex.dev)
- [Convex Auth Documentation](https://docs.convex.dev/auth)
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

---

## 🎯 Next Steps

Now that your boilerplate is set up, here are some ideas:

1. **Add OAuth Providers** - Integrate Google, GitHub auth
2. **Email Verification** - Add email verification flow
3. **File Uploads** - Use Convex file storage
4. **Real-time Features** - Leverage Convex subscriptions
5. **Advanced Permissions** - Fine-grained access control
6. **Audit Logs** - Track all changes
7. **Billing Integration** - Add Stripe for subscriptions

Happy coding! 🚀
