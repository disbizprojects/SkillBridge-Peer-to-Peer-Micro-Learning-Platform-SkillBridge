# SkillShare - Peer-to-Peer Learning Platform

A comprehensive learning platform connecting learners with mentors through micro-courses and live sessions.

## 🚀 Quick Start

1. **Access the Platform**: The app is already running in Figma Make
2. **Landing Page**: Visit `/` to see the homepage
3. **Sign Up**: Create an account at `/signup`
4. **Choose Role**: Select Learner, Mentor, or Both
5. **Start Learning**: Browse courses, book sessions, earn XP!

## 📚 Complete Documentation

For detailed information about the platform, see **[All details.txt](/All%20details.txt)**

This comprehensive guide includes:
- Technology stack details
- Architecture overview
- Feature breakdown
- API endpoints reference
- User flows
- Database schema
- Troubleshooting guide

## 🏗️ Technology Stack

**Frontend:**
- React 18 + TypeScript
- React Router
- Tailwind CSS
- shadcn/ui Components

**Backend:**
- Supabase Edge Functions (Deno)
- Hono.js Web Framework
- Key-Value Store Database

## 🎯 Key Features

- **User Roles**: Learner, Mentor, or Both
- **Course System**: Create, browse, and enroll in courses
- **Live Sessions**: Book 1-on-1 or group sessions
- **Token Economy**: Purchase tokens, pay for courses/sessions
- **Gamification**: XP, levels, badges, leaderboards
- **Community Forum**: Discussions and Q&A
- **Messaging**: Direct chat with other users
- **Admin Panel**: User management dashboard

## 📱 Main Routes

### Public Routes
- `/` - Landing page
- `/signup` - Create account
- `/login` - User login
- `/forgot-password` - Password recovery

### Protected Routes (Require Login)
- `/dashboard` - User dashboard (role-adaptive)
- `/explore` - Browse courses
- `/course/:id` - Course details
- `/course/:id/play` - Course player
- `/create-course` - Create new course (mentors)
- `/wallet` - Manage tokens & transactions
- `/leaderboard` - XP rankings
- `/community` - Forum discussions
- `/session/:id` - Live video session
- `/messages` - Direct messaging

### Admin Routes
- `/admin/login` - Admin login
- `/admin/dashboard` - User management

## 🎮 Gamification System

**XP Rewards:**
- Course enrollment: 50 XP
- Module completion: 20 XP
- Course completion: 100 XP bonus
- Session completion: 50-80 XP
- Course creation: 100 XP

**Leveling:**
- 1000 XP per level
- Automatic progression
- Displayed in profile

**Badges:**
- Early Adopter
- Top Mentor (100+ sessions)
- Expert (4.8+ rating)
- Level 10 Achiever
- And more...

## 💰 Token Economy

**Token Sources:**
- Welcome bonus: 100 tokens
- Wallet top-up
- Earnings from teaching

**Token Usage:**
- Enroll in courses
- Book sessions
- Start chat conversations (50 tokens)

## 🔧 API Information

**Base URL:**
```
https://{projectId}.supabase.co/functions/v1/make-server-d45a5820
```

**Authentication:**
```
Authorization: Bearer {publicAnonKey}
```

**Key Endpoints:**
- `POST /auth/signup` - Register
- `POST /auth/login` - Login
- `GET /courses` - List courses
- `POST /enrollments` - Enroll in course
- `GET /leaderboard` - Get rankings
- And 30+ more...

See **All details.txt** for complete API reference.

## 🗄️ Data Storage

All data stored in Supabase Key-Value store:
- Users and authentication
- Courses and enrollments
- Sessions and bookings
- Transactions and wallet
- Reviews and ratings
- Forum posts
- Messages and notifications

## 🛠️ Development

The platform is built using:
- Figma Make for frontend hosting
- Supabase for backend services
- No local setup required

All code is organized in:
- `/pages` - React page components
- `/components` - Reusable UI components
- `/context` - State management
- `/utils` - Helper functions and API client
- `/supabase/functions/server` - Backend logic

## 🔍 Troubleshooting

**Backend Status:**
Check the floating status indicator in the bottom-right corner of any page.

**Common Issues:**
- Clear browser localStorage if experiencing login issues
- Ensure you have enough tokens for purchases
- Check console for detailed error messages

For detailed troubleshooting, see section 11 in **All details.txt**.

## 📄 Important Files

- **All details.txt** - Complete platform documentation
- **/App.tsx** - Main application entry
- **/supabase/functions/server/index.tsx** - Backend API
- **/utils/api.ts** - Frontend API client
- **/context/AppContext.tsx** - State management

## ⚠️ Note on Backend

This platform uses **Supabase** backend only. All MERN stack files have been removed:
- ✅ Supabase Edge Functions (current)
- ❌ MongoDB + Express (removed)

## 🎨 Design System

- Custom Tailwind CSS configuration
- shadcn/ui component library
- Consistent color palette
- Responsive design
- Lucide React icons

## 📊 Admin Features

Admins can:
- View all users
- Suspend/activate accounts
- Monitor platform activity
- Manage content

Admin login at `/admin/login`

## 🚀 Next Steps

1. Sign up for an account
2. Complete onboarding (select skills)
3. Browse courses in Explore
4. Enroll in a course or book a session
5. Earn XP and climb the leaderboard!

## 📚 Learn More

For comprehensive information about:
- Architecture details
- All features explained
- Complete API reference
- User flows and workflows
- Database schema

**Read the full documentation in [All details.txt](/All%20details.txt)**

---

**Built with ❤️ using React, Supabase, and Figma Make**
