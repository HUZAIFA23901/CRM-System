# Property Dealer CRM

Property Dealer CRM is a Next.js-based customer relationship management app for property dealers. It includes secure authentication, role-based access control, lead management, assignment workflows, activity logs, notifications, analytics, and a responsive admin/agent dashboard.

## Features

- Secure signup and login with NextAuth JWT sessions
- Password hashing with bcryptjs
- Admin and agent roles with route protection
- Lead CRUD, assignment, and follow-up tracking
- Activity timeline and audit trail
- Email notifications with safe SMTP fallback
- WhatsApp click-to-chat links
- Analytics dashboard and agent performance views
- Dark mode support

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- MongoDB with Mongoose
- NextAuth
- Socket.IO
- Tailwind CSS
- Zod validation

## Prerequisites

- Node.js 18 or newer
- MongoDB connection string
- SMTP credentials if you want email notifications

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file from `.env.example` and fill in the values:

```env
MONGODB_URI=
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
```

3. Start the development server:

```bash
npm run dev
```

## Scripts

- `npm run dev` - start the app in development mode
- `npm run build` - build the production app
- `npm run start` - run the production build
- `npm run lint` - run Next.js lint checks
- `npm run seed` - seed the database with sample users and leads

## Default Seed Logins

If you run the seed script, it creates these demo accounts:

- Admin: `admin@crm.local` / `Admin@123`
- Agent: `agent@crm.local` / `Agent@123`

## Access Control

- Admins can view all leads, assign leads, access analytics, and manage agents.
- Agents can only see and update leads assigned to them.
- Authentication state is stored in JWT-based sessions and enforced through middleware and API guards.

## Project Structure

- `app/` - app routes, dashboards, auth pages, and API routes
- `components/` - shared UI components
- `lib/` - auth and database configuration
- `models/` - Mongoose models
- `services/` - business logic for leads, activity, mail, and analytics
- `utils/` - helpers for API responses, WhatsApp links, sockets, and scoring
- `middleware.ts` - route protection and API access checks

## Notes

- Email notifications are non-blocking, so lead creation will still work if SMTP is unavailable.
- The app supports dark mode from the shared dashboard navigation.
