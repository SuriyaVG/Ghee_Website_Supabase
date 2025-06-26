# GSR Heritage Ghee - E-Commerce Website

This repository contains the official frontend for the GSR Heritage Ghee e-commerce website. It's a modern, responsive application built with React, Vite, and Tailwind CSS, designed for a high-performance user experience.

The application is deployed on a decoupled architecture:
- **Frontend:** Hosted on **Vercel**.
- **Backend Services:** Powered by **Supabase** (Database, Authentication, Storage).

## Key Features

- **Dynamic Product Catalog:** Fetches and displays products and their variants directly from the Supabase database.
- **Interactive Shopping Cart:** Client-side state management with Zustand for a seamless cart experience.
- **Multi-step Ordering:** A guided flow from cart, to checkout, to payment.
- **Secure Admin Panel:** A protected area for viewing and managing orders, with authentication handled by Supabase Auth.
- **Modern Tech Stack:** Built with React, TypeScript, Vite, and Tailwind CSS for a fast, type-safe, and maintainable codebase.

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **UI:** Tailwind CSS, shadcn/ui, Radix UI
- **State Management:** Zustand (for cart), TanStack Query (for server state)
- **Routing:** React Router
- **Backend:** Supabase (PostgreSQL Database, Auth)
- **Deployment:** Vercel

## Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn/pnpm

### Setup
1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd Ghee_Website_Supabase
    ```

2.  **Navigate to the client directory:**
    ```bash
    cd client
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

4.  **Set up Environment Variables:**
    - Create a new file named `.env` inside the `client` directory.
    - Copy the contents of `.env.example` (if it exists) or add the following variables:
    ```env
    VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_PUBLIC_ANON_KEY"
    VITE_CASHFREE_ENV="sandbox"
    ```
    - Replace the placeholder values with your actual Supabase project URL and public anonymous key from your Supabase dashboard.

### Running the Development Server
From within the `client` directory, run:
```bash
npm run dev
```
This will start the Vite development server, typically at http://localhost:5173.

## Deployment
This project is configured for seamless deployment to Vercel.

1. **Connect GitHub to Vercel:** Link this repository to a new project on Vercel.
2. **Configure Project Settings:**
   - Framework Preset: Vercel should automatically detect Vite.
   - Root Directory: Set this to client. This is crucial for Vercel to find your frontend code.
   - Add Environment Variables: In your Vercel project's settings, add the same environment variables you used in your local .env file (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, etc.).
3. **Deploy:** Push a commit to your main branch. Vercel will automatically build and deploy the application.

## Backend and Database
All backend logic has been migrated from the previous Express server to Supabase.

- **Database:** The schema is managed via SQL migrations run directly in the Supabase dashboard's SQL Editor. Key tables include products, product_variants, orders, and contacts.
- **Database Access:** The frontend reads public data (like products) directly using the Supabase JS client. This requires RLS (Row Level Security) policies to be configured in Supabase to allow public read access.
- **Authentication:** Admin login (/admin) is handled by Supabase Auth (supabase.auth.signInWithPassword).
- **Secure Operations:** Actions requiring secrets or server-side validation (e.g., online payment verification, stock management) must be implemented as Supabase Edge Functions.

## Troubleshooting

### Vercel Build Failures
If you encounter build failures on Vercel related to module resolution (e.g., `ENOENT: no such file or directory` or `Rollup failed to resolve import`), check for these two common issues:

1.  **Missing File Extensions:** Ensure that all non-component TypeScript imports (like schemas, types, or helpers) include the `.ts` file extension. Vercel's build environment is stricter about this than a local dev server. For example, `import { mySchema } from './schemas/mySchema'` should be `import { mySchema } from './schemas/mySchema.ts'`.
2.  **Server-Side Code in Client Bundle:** Do not import server-side packages (like `drizzle-orm`) into files that are part of the client-side Vite build. The `client` directory and its children should only contain code intended to run in the browser. Shared types and Zod schemas are fine, but database table definitions are not.

---

If needed, create new .md files like `architecture.md` or `changelog.md` for further documentation.
