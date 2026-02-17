# 🚀 Quick Start Guide

Get your app running in 2 simple steps!

## Step 1: Initialize Convex Backend

```bash
npm run setup
```

or

```bash
npx convex dev
```

**What happens:**
- Creates your Convex account (first time only)
- Generates your deployment
- Creates `.env.local` with `NEXT_PUBLIC_CONVEX_URL`
- Deploys your database schema
- Starts Convex dev server

⏱️ **Takes ~1-2 minutes**

## Step 2: Start Next.js Dev Server

Open a **new terminal** and run:

```bash
npm run dev
```

## ✅ Done!

Visit [http://localhost:3000](http://localhost:3000)

You should see your app with:
- ✨ Beautiful landing page
- 🔐 Registration & Login
- 🏢 Organization management
- 📊 Dashboard

---

## First Steps

1. **Register** a new account at `/register`
2. Go to **Settings** → Create your first organization
3. **Invite members** to your organization
4. Explore the **Dashboard**

---

## Troubleshooting

### "Setup Required" screen shows
- Make sure `npx convex dev` is running
- Check that `.env.local` exists with `NEXT_PUBLIC_CONVEX_URL`
- Restart your dev server: `Ctrl+C` then `npm run dev`

### Port already in use
- Convex uses port: Check terminal output
- Next.js uses 3000: Run `npm run dev -- -p 3001`

### Changes not showing
- Clear cache: `rm -rf .next` then restart

---

## What's Next?

See [SETUP.md](SETUP.md) for detailed documentation on:
- Project structure
- Adding features
- Deployment
- Customization

Happy coding! 🎉
