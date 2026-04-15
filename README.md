# TapOpen

Mobile-first deep linking for creators. Bypass in-app browsers and open content directly in native apps (YouTube, Instagram, Spotify, etc.).

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

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/tapopen-links.git
   cd tapopen-links
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Run Development Server:
   ```bash
   npm run dev
   ```

## License

MIT License - Copyright (c) 2024 TapOpen
