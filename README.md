# TapOpen

TapOpen is a high-performance, mobile-first deep-linking tool designed for creators. It allows users to bypass in-app browsers (like those in Instagram, TikTok, and Facebook) and open links directly in native mobile applications like YouTube, Instagram, Spotify, and more.

## 🚀 Tech Stack

### Frontend Core
- **React 18** - UI library for building modular interfaces.
- **Vite** - Lightning-fast build tool and development server.
- **TypeScript** - For robust, type-safe development and scalability.
- **React Router DOM** - Handling seamless navigation and slug-based redirects.

### Backend & Database
- **Supabase** - Backend-as-a-Service providing:
  - **Auth**: Secure Gmail-first authentication.
  - **PostgreSQL**: Robust database for link and analytics storage.
  - **Realtime**: Live updates for dashboard interactions.

### Styling & UI
- **Tailwind CSS** - Utility-first styling for a sleek, responsive design.
- **Shadcn/UI** - Accessible, high-quality primitive components built on **Radix UI**.
- **Framer Motion** - Smooth transitions and premium micro-animations.
- **Lucide React** - Beautiful, consistent iconography.

### Analytics & Utilities
- **Recharts** - Interactive 7-day traffic trend visualization.
- **React Query** - Efficient server-state management and caching.
- **Sonner** - Lightweight, elegant toast notifications.
- **NanoID** - Generation of short, unique link aliases.

## 🛠️ Project Structure

- `src/pages`: Component owners for primary views (Dashboard, Redirect, Landing).
- `src/components`: Granular, reusable UI modules.
- `src/hooks`: Decoupled business logic (Link management, Redirect strategies).
- `src/services`: Abstracted database interaction layer.
- `src/lib`: Shared utilities and deep-link detection algorithms.
- `src/types`: Centralized TypeScript definitions.

## ⚡ Deployment & Hosting
Optimized for deployment on platforms like Vercel or Netlify with full support for environment variables and dynamic routing.
