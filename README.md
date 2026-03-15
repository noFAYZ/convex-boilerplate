# MoneyMappr - Convex Boilerplate

A modern, production-ready SaaS boilerplate built with **Next.js 16**, **Convex**, and **Better Auth**. Includes authentication, organization management, billing, email verification, notifications, and more.

## ✨ Features

- **🔐 Authentication** - Email/password auth with JWT tokens via Better Auth
- **👥 Multi-Organization Support** - Create and manage multiple organizations with role-based access
- **💳 Billing Integration** - Stripe/Polar integration with subscription management
- **✉️ Email Verification** - Email verification with 6-digit codes and expiration
- **📬 Notifications** - Real-time notifications system with activity tracking
- **🎯 Onboarding Flow** - Guided onboarding for new users with profile and organization setup
- **⚙️ Settings Management** - Profile, password, email, organization, billing, and activity settings
- **📊 Activity Logging** - Comprehensive activity audit logs for organizations
- **🎨 UI Components** - Pre-built UI components using shadcn/ui and Tailwind CSS
- **🌙 Dark Mode** - Built-in dark/light theme support
- **📱 Responsive Design** - Mobile-first responsive design

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- A [Convex](https://convex.dev) account
- Environment variables configured

### Installation

1. **Clone and install dependencies**
```bash
npm install
```

2. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Authentication
CONVEX_SITE_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_secret_key_here

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Billing (Polar)
NEXT_PUBLIC_POLAR_ACCESS_TOKEN=your_polar_token
NEXT_PUBLIC_POLAR_ORG_ID=your_polar_org_id

# File Upload (AWS S3)
NEXT_PUBLIC_AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
```

3. **Start the development server**
```bash
# Terminal 1: Start Convex backend
npm run convex

# Terminal 2: Start Next.js dev server
npm run dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

- **[Architecture](./docs/ARCHITECTURE.md)** - System design and component structure
- **[Authentication](./docs/AUTHENTICATION.md)** - Auth system, session management, and security
- **[Features](./docs/FEATURES.md)** - Detailed feature documentation with usage examples
- **[Database Schema](./docs/DATABASE.md)** - Data model and table relationships
- **[API Reference](./docs/API.md)** - Convex functions and endpoints
- **[Development Guide](./docs/DEVELOPMENT.md)** - Development best practices and conventions
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions

## 🛠️ Project Structure

```
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth pages (login, register)
│   ├── (onboarding)/           # Onboarding flow
│   ├── (protected)/            # Protected pages (dashboard, settings)
│   └── api/                    # API routes
│
├── components/                  # React components
│   ├── auth/                   # Authentication components
│   ├── billing/                # Billing components
│   ├── layout/                 # Layout components
│   ├── organizations/          # Organization management
│   ├── notifications/          # Notification system
│   ├── ui/                     # Base UI components (shadcn/ui)
│   └── providers/              # Context providers
│
├── convex/                     # Convex backend
│   ├── actions/               # Server actions (email, billing)
│   ├── lib/                   # Helper utilities
│   ├── auth.ts               # Authentication setup
│   ├── schema.ts             # Database schema
│   ├── users.ts              # User functions
│   ├── organizations.ts      # Organization functions
│   ├── billing.ts            # Billing functions
│   ├── notifications.ts      # Notification functions
│   └── [other].ts            # Feature-specific functions
│
├── docs/                       # Documentation
│
└── public/                     # Static assets
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start Next.js dev server (with Convex dev)
npm run convex      # Run Convex dev server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint        # Run ESLint

# Setup
npm run setup       # Initial project setup
```

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Backend** | Convex (Serverless Cloud Platform) |
| **Authentication** | Better Auth + @convex-dev/auth |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Icons** | Lucide React, Phosphor Icons |
| **Email** | Resend |
| **Payments** | Polar SDK |
| **File Storage** | AWS S3 with Presigned URLs |
| **Real-time** | Convex Subscriptions |
| **Notifications** | React Hot Toast |

## 🔐 Security Features

- ✅ JWT-based authentication with secure tokens
- ✅ Role-based access control (RBAC) at organization and member level
- ✅ Environment-based API key management
- ✅ Email verification with expiring codes
- ✅ Password hashing (via Better Auth)
- ✅ CORS and security headers configured
- ✅ Activity logging for audit trails
- ✅ Session management with automatic cleanup

## 💡 Key Concepts

### Organizations
Organizations are the core multi-tenancy unit. Users can create and join multiple organizations with different roles (owner, admin, member).

### Roles
- **Owner**: Full access, can delete organization
- **Admin**: Can manage members, settings, and billing
- **Member**: Limited access to organization data

### Email Verification
Users receive verification codes via email. The system tracks verification status and expiry times for security.

### Billing Integration
Built-in Polar SDK integration for subscription management with multiple tiers (free, pro, enterprise).

### Activity Logging
All significant actions are logged with timestamps, user info, and action details for compliance and auditing.

## 🐛 Troubleshooting

**Port 3000 already in use?**
```bash
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**Convex sync issues?**
```bash
# Restart Convex dev server
npm run convex
```

**Environment variables not loading?**
- Ensure `.env.local` is in the root directory
- Restart dev server after changes
- Check for typos in variable names

## 📦 Deployment

The boilerplate is ready for deployment on:
- **Vercel** - Recommended for Next.js apps
- **Netlify** - Via serverless functions
- **Self-hosted** - Any Node.js compatible hosting

See [Deployment Guide](./docs/DEPLOYMENT.md) for detailed instructions.

## 📖 Learning Resources

- [Convex Documentation](https://docs.convex.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [Better Auth Documentation](https://www.better-auth.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)

## 📄 License

This boilerplate is provided as-is for personal and commercial use.

## 🤝 Contributing

Feel free to fork, modify, and improve this boilerplate for your projects!

---

**Happy coding! 🚀**
