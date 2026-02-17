# 🚀 Convex Boilerplate - Feature Documentation

A production-ready Next.js 16 + Convex + Cloudflare R2 boilerplate with multi-tenant authentication, team management, and file uploads.

## ✨ Implemented Features

### 1. 🔐 Authentication & Onboarding
- **Email/Password Authentication** via @convex-dev/auth
- **Multi-step Onboarding Flow**
  - Welcome screen
  - Profile setup
  - Organization creation with auto-generated slugs
  - Completion screen
- **Protected Routes** with automatic onboarding checks
- **Session Management** with reactive Convex queries

### 2. 👥 Team Management
**Backend (`convex/members.ts`):**
- Invite members via email
- Accept invitations with token validation
- Update member roles (owner/admin/member)
- Remove members with permission checks
- List members and pending invitations
- Activity logging for all team actions

**Frontend:**
- **Team Page** (`/team`) - Manage all team members
- **Invite Member Modal** - Send invitations with role selection
- **Members List** - View, edit roles, remove members
- **Pending Invitations** - Track invitation status
- **Role-based Permissions** - Owner/Admin/Member access control

### 3. 👤 User Profile & Settings
**Profile Settings** (`/settings/profile`):
- Update name and profile picture
- Avatar upload to Cloudflare R2
- Email display (read-only)
- Account deletion with safety checks

**Password Settings** (`/settings/password`):
- Change password (placeholder for Convex Auth integration)
- Password strength requirements
- Confirmation validation

### 4. 🏢 Organization Settings
**Organization Management** (`/settings/organization`):
- Update organization name and slug
- Organization logo upload to R2
- Owner-only permissions for critical actions
- Delete organization with multi-step confirmation

### 5. 📁 File Upload (Cloudflare R2)
**Backend (`app/api/upload/route.ts`):**
- S3-compatible uploads to Cloudflare R2
- File type validation (images for avatars/logos)
- File size limits (5MB for avatars/logos, 10MB for documents)
- Unique filename generation

**Frontend (`components/upload/file-upload.tsx`):**
- Image preview before upload
- Progress indicators
- Error handling
- Reusable component for avatars, logos, documents

**Configuration:**
```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### 6. 📊 Activity Log & Audit Trail
**Backend (`convex/activity.ts`):**
- Automatic logging of all team actions
- Organization-scoped activity queries
- User activity across all organizations
- Metadata for detailed audit trails

**Tracked Actions:**
- Member invitations sent
- New members joining
- Member removals
- Role changes
- Organization updates

**Frontend (`components/activity/activity-feed.tsx`):**
- Beautiful activity timeline
- Action icons and descriptions
- Timestamp display
- Organization context

**Activity Page** (`/activity`):
- View recent activity across all organizations
- Customizable limit

## 🗄️ Database Schema

### Organizations Table
```typescript
{
  name: string,
  slug: string,           // URL-friendly identifier
  logo: string?,
  createdBy: Id<"users">,
  createdAt: number,
  updatedAt: number,
  metadata: any?
}
```

### Members Table
```typescript
{
  organizationId: Id<"organizations">,
  userId: Id<"users">,
  role: "owner" | "admin" | "member",
  invitedBy: Id<"users">?,
  joinedAt: number
}
```

### Invitations Table
```typescript
{
  organizationId: Id<"organizations">,
  email: string,
  role: "admin" | "member",
  invitedBy: Id<"users">,
  token: string,
  expiresAt: number,
  status: "pending" | "accepted" | "expired",
  createdAt: number
}
```

### Activity Log Table
```typescript
{
  organizationId: Id<"organizations">,
  userId: Id<"users">,
  action: string,           // e.g., "member.invited", "member.joined"
  entityType: string?,      // e.g., "member", "organization"
  entityId: string?,
  metadata: any?,           // Additional context
  timestamp: number
}
```

## 📂 Project Structure

```
convex-boilerplate/
├── app/
│   ├── (auth)/                    # Auth pages (login, register)
│   ├── (onboarding)/              # Onboarding flow
│   │   └── onboarding/
│   └── (protected)/               # Protected routes
│       ├── dashboard/
│       ├── team/                  # Team management
│       ├── activity/              # Activity log
│       └── settings/
│           ├── profile/           # User profile
│           ├── password/          # Password settings
│           └── organization/      # Org settings
├── components/
│   ├── auth/                      # Auth components
│   ├── onboarding/                # Onboarding steps
│   ├── team/                      # Team management UI
│   ├── activity/                  # Activity feed
│   ├── upload/                    # File upload components
│   └── organizations/             # Org context & switcher
├── convex/
│   ├── schema.ts                  # Database schema
│   ├── auth.ts                    # Auth configuration
│   ├── users.ts                   # User queries/mutations
│   ├── members.ts                 # Team management
│   ├── organizations.ts           # Organization CRUD
│   ├── onboarding.ts              # Onboarding flow
│   ├── activity.ts                # Activity logging
│   ├── profile.ts                 # User profile updates
│   └── password.ts                # Password management
└── lib/
    └── r2-config.ts               # Cloudflare R2 configuration
```

## 🚀 Setup Instructions

### 1. Convex Setup
```bash
# Install dependencies
npm install

# Start Convex dev server
npx convex dev

# Configure auth (generates JWT keys)
npx @convex-dev/auth
```

### 2. Cloudflare R2 Setup
1. Create R2 bucket at https://dash.cloudflare.com
2. Generate API tokens
3. Add credentials to `.env.local`:
```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

### 3. Run Development Server
```bash
# Terminal 1: Convex dev server
npx convex dev

# Terminal 2: Next.js dev server
npm run dev
```

## 🎯 User Flows

### New User Registration
1. Register at `/register`
2. Redirected to `/onboarding`
3. Complete profile setup
4. Create first organization
5. Redirected to `/dashboard`

### Team Collaboration
1. Owner/Admin invites member at `/team`
2. Invitation email sent (placeholder)
3. Member accepts invitation via token
4. Member joins organization
5. Activity logged automatically

### File Uploads
1. User navigates to profile/settings
2. Clicks "Change Avatar" or "Change Logo"
3. Selects file
4. Uploads to Cloudflare R2
5. URL saved in Convex database

## 🔒 Security Features

- **JWT-based Authentication** with Convex Auth
- **Role-based Access Control** (Owner/Admin/Member)
- **Permission Checks** on all mutations
- **Activity Logging** for audit compliance
- **Secure File Uploads** with type & size validation
- **Protected Routes** with automatic redirects
- **Token-based Invitations** with expiration

## 🎨 UI/UX Features

- **Responsive Design** with TailwindCSS
- **Dark Mode Support** (via shadcn/ui)
- **Loading States** for all async operations
- **Error Handling** with user-friendly messages
- **Success Feedback** with temporary notifications
- **Confirmation Dialogs** for destructive actions

## 📝 Next Steps

### To Complete Implementation:
1. **Implement organization context** for multi-org switching
2. **Email notifications** for invitations and activity
3. **Password reset flow** via email
4. **OAuth providers** (Google, GitHub)
5. **2FA support**
6. **Billing integration** (Stripe)

### Optional Enhancements:
- Search & filtering
- Advanced permissions
- API keys management
- Analytics dashboard
- Export capabilities
- Webhooks

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Backend:** Convex (serverless backend)
- **Auth:** @convex-dev/auth (Email/Password)
- **Storage:** Cloudflare R2 (S3-compatible)
- **UI:** shadcn/ui (Radix UI + TailwindCSS)
- **Styling:** TailwindCSS 4

## 📚 Resources

- [Convex Documentation](https://docs.convex.dev)
- [Convex Auth Docs](https://labs.convex.dev/auth)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Next.js 16 Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)

---

**Built with best practices for production-ready SaaS applications** 🚀
