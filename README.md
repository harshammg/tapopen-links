# TapOpen (Open Source)

<div align="center">
  <p align="center">
    <b>A unified edge-infrastructure platform designed to maximize audience conversion.</b>
  </p>
</div>

## Welcome to TapOpen

TapOpen is an all-in-one ecosystem for creators and developers. It provides intelligent native app routing (escaping the "walled garden" of in-app browsers like Instagram or TikTok), a powerful link-in-bio profile engine, forms, and a centralized hub for audience engagement.

**We believe in Open Source.** We open-source our tools so you can self-host, build upon our communication engines (like *Bulky* for WhatsApp campaigns), and truly own your audience data.

*(For a deep dive into the problem we are solving, the pitch deck, and detailed philosophy, see [INFORMATION.md](./INFORMATION.md))*

## Features

- **Quick Links:** Edge-powered deep-linking (sub-50ms latency). Bypasses in-app browsers instantly to route users natively.
- **Profiles Dashboard:** Clean, premium, developer-friendly digital headquarters combining links, CVs, and markdown blogs.
- **Store & Forms Integration:** Seamless audience and lead capture.
- **Bulky (WhatsApp Engine):** Easily dispatch bulk campaigns and track delivery safely.

## Tech Stack

- **Framework:** [React](https://react.dev) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Backend/Auth:** [Supabase](https://supabase.com/)
- **Routing/Edge:** [Cloudflare Pages](https://pages.cloudflare.com/)

---

## Getting Started

### Prerequisites
- Node.js (v16+)
- A [Supabase](https://supabase.com/) account (free tier works perfectly)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/tapopen.git
cd tapopen/tapopen-links
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase
1. Create a new Supabase project.
2. Go to Project Settings -> API.
3. Copy `.env.example` to `.env` (don't worry, `.env` is git-ignored so your credentials are safe!):
```bash
cp .env.example .env
```
4. Fill in your environment variables in `.env`:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Run the Local Development Server
```bash
npm run dev
```
Open your browser and visit `http://localhost:5173`.

---

## Contributing

We love contributions from the community! Whether it's fixing a bug, adding a feature to the Profiles builder, or improving our deep-link algorithms:
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

Distributed under the MIT License. See `LICENSE` for more information.
