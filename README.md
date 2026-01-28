<p align="center">
  <img src="public/qwerty.svg" alt="Qwerty Logo" width="80" />
</p>

<h1 align="center">✨ Qwerty</h1>

<p align="center">
  <strong>The Ultimate Collaborative Workspace</strong>
  <br />
  A real-time collaborative workspace for teams who want Notion-style editing with the power of multiplayer features.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#license">License</a>
</p>

---

## 🚀 Features

### 📁 Smart Workspace Management

- Create unlimited workspaces for different projects or teams
- Invite teammates and manage member roles
- Spin up pages inside each workspace with custom icons
- Favorites system for quick access to important pages

### 🔄 Real-Time Collaboration

- **Live cursors** - See where your teammates are editing in real-time
- **Presence indicators** - Know who's online and active
- **Instant syncing** - Changes appear immediately across all connected clients
- **Conflict-free editing** - Powered by Yjs CRDT for seamless concurrent updates

### 📝 Rich Text Editor

- **Notion-style block editor** with slash commands (`/`)
- Markdown shortcuts for fast formatting
- Advanced text formatting (bold, italic, highlights, code blocks)
- Tables, images, horizontal rules, and more
- Drag-and-drop block reordering

### 🛠️ Productivity Features

- **Built-in Kanban boards** - Manage tasks directly inside your pages
- **Task management** - Assign tasks, set due dates, track priorities
- **Quick search** - `Cmd/Ctrl + K` to find anything instantly
- **@Mentions** - Tag teammates and send notifications
- **Version history** - Snapshot-based history to recover from any "who deleted this??" moment

### 🎨 Beautiful UI/UX

- **Glassmorphism design** with smooth animations
- **Dark/Light mode** with seamless transitions
- Responsive layout for all screen sizes
- Custom workspace branding and favicons

---

## 🛠️ Tech Stack

### Frontend

| Technology         | Purpose                                       |
| ------------------ | --------------------------------------------- |
| **Next.js 15**     | App Router, Server Components, Server Actions |
| **React 19**       | Latest React with concurrent features         |
| **TypeScript**     | Type-safe development                         |
| **TailwindCSS v4** | Utility-first styling                         |
| **TiptapJS**       | Rich text editor with custom extensions       |
| **Radix UI**       | Accessible component primitives               |
| **@dnd-kit**       | Drag-and-drop functionality                   |

### Real-Time Collaboration

| Technology      | Purpose                                   |
| --------------- | ----------------------------------------- |
| **Yjs**         | CRDT for conflict-free concurrent editing |
| **Hocuspocus**  | WebSocket provider for Yjs                |
| **y-websocket** | WebSocket sync protocol                   |

### Backend

| Technology     | Purpose                          |
| -------------- | -------------------------------- |
| **PostgreSQL** | Primary database                 |
| **Prisma v7**  | Type-safe ORM                    |
| **Redis**      | Session management & caching     |
| **BullMQ**     | Background job processing        |
| **Clerk**      | Authentication & user management |

### Deployment

| Platform              | Service                        |
| --------------------- | ------------------------------ |
| **Vercel**            | Frontend & API routes          |
| **Render**            | WebSocket collaboration server |
| **NeonDB / Supabase** | PostgreSQL hosting             |
| **Upstash**           | Redis hosting                  |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Redis instance
- Clerk account for authentication

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/qwerty.git
   cd qwerty
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your environment variables:

   ```env
   # Database
   DATABASE_URL="postgresql://..."

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
   CLERK_SECRET_KEY="sk_..."

   # Redis
   REDIS_URL="redis://..."

   # Collaboration Server
   NEXT_PUBLIC_COLLAB_URL="wss://..."
   ```

4. **Set up the database**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

### Running the Collaboration Server

The WebSocket server for real-time collaboration is in the `qwerty-WS` directory:

```bash
cd qwerty-WS
npm install
npm run dev
```

---

## 🏗️ Architecture

```
qwerty/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── actions/           # Server Actions
│   ├── workspace/         # Workspace pages
│   └── types/             # TypeScript types
├── components/            # React components
│   ├── editor/           # TiptapJS editor components
│   ├── kanban/           # Kanban board components
│   ├── ui/               # Shared UI components
│   └── workspace/        # Workspace-specific components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── prisma/               # Database schema
├── qwerty-WS/            # WebSocket collaboration server
│   └── src/
│       ├── index.ts      # Hocuspocus server
│       └── utils/        # Yjs serialization utilities
└── styles/               # Global styles
```

### Key Design Decisions

- **Yjs CRDT**: Enables conflict-free concurrent editing without operational transformation complexity
- **Server Actions**: Type-safe API calls with automatic revalidation
- **Optimistic Updates**: UI updates immediately while syncing in the background
- **Binary Snapshots**: Efficient version history storage using Yjs snapshot encoding

---

## 📸 Screenshots

<!-- Add your screenshots here -->
<!-- ![Dashboard](screenshots/dashboard.png) -->
<!-- ![Editor](screenshots/editor.png) -->
<!-- ![Kanban](screenshots/kanban.png) -->

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ and way too much refactoring
  <br />
  <sub>What started as "fix a button color" became this 🚀</sub>
</p>
