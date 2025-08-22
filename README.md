<div align="center">
  <img src="./public/globe.svg" alt="Project Logo" height="96" />
  <h1>arrticle - express everything</h1>
  <p>Write, edit, and publish blogs with a clean UI, AI-assisted writing, and image storage via MongoDB GridFS.</p>
</div>

### Overview

Article is a Next.js 15 App Router application for managing and publishing blog posts. It features a WYSIWYG-like editor, AI-assisted writing using Google Gemini, draft management, and image uploads stored in MongoDB GridFS. The public site lists and displays published blogs.

> Note: This project is provided as a "DOUGH" starter. It is intentionally generic and designed to be shaped, refined, and tailored to your specific product requirements (branding, auth, roles, rate limits, analytics, CI/CD, etc.).

### Features

- **Blog CRUD**: Create, read, update, and delete blogs with unique, auto-slugging.
- **Draft workflow**: Save, edit, and publish drafts separately from published content.
- **AI-assisted writing**: Generate or revise body content via Gemini 1.5 Flash (`/api/ai/generate`).
- **Rich text editing**: Simple toolbar with bold/italic/underline, lists, and links.
- **Image uploads**: Store images using MongoDB GridFS with upload/download/delete endpoints.
- **Sanitized rendering**: HTML content sanitized on view for safety.
- **Modern UI**: Tailwind CSS 4 + `@tailwindcss/typography`, light/dark friendly palette.

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript, React 19
- **Styling**: Tailwind CSS 4, Typography plugin
- **Database**: MongoDB (official driver), GridFS for images
- **AI**: `@google/generative-ai` (Gemini 1.5 Flash)

### File/Folder Structure

- `src/app` – App Router pages and API routes
  - `page.tsx` – Home
  - `blog/page.tsx` – Blog list
  - `blog/[slug]/page.tsx` – Blog detail
  - `management/page.tsx` – Admin UI for blogs and drafts
  - `api/ai/generate/route.ts` – AI generate endpoint
  - `api/blogs` – Blog CRUD
  - `api/drafts` – Draft CRUD
  - `api/images` – Image upload/download/delete (GridFS)
- `src/lib` – Data access: `mongo.ts`, `blogStore.ts`, `draftStore.ts`
- `src/types` – Shared types
- `public/` – Static assets (logo in this README uses one of these)

### Environment Variables

Create a `.env.local` in the project root with the following variables. See `env.example` for a template.

```env
MONGODB_URI="mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority"
GEMINI_API_KEY="your-google-gemini-api-key"
```

- **MONGODB_URI**: Standard MongoDB connection string. If no database name is included, the app defaults to `maddevs`.
- **GEMINI_API_KEY**: API key for Google Generative AI.

### Getting Started

1) Install dependencies:

```bash
npm install
```

2) Configure environment:

```bash
cp .env.example .env.local
# then fill values for MONGODB_URI and GEMINI_API_KEY
```

3) Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

### Management UI

- Navigate to `/management` to create new blogs or manage drafts.
- Use “Use AI write” to generate or revise content with a short prompt.
- Upload up to 9 images per blog; images are stored under GridFS and served via `/api/images/:id`.

### API Reference (summary)

All endpoints return JSON unless noted. Bodies are JSON unless noted as multipart/form-data.

- `GET /api/blogs` – List blogs
- `POST /api/blogs` – Create blog
- `GET /api/blogs/:slug` – Get by slug
- `PUT /api/blogs/:slug` – Update by slug
- `DELETE /api/blogs/:slug` – Delete by slug

- `GET /api/drafts` – List drafts
- `POST /api/drafts` – Create draft
- `GET /api/drafts/:id` – Get draft
- `PUT /api/drafts/:id` – Update draft
- `DELETE /api/drafts/:id` – Delete draft

- `POST /api/images` – Upload image (multipart/form-data, field `file`)
- `GET /api/images/:id` – Download image (binary response)
- `DELETE /api/images/:id` – Delete image

- `POST /api/ai/generate` – Generate/revise blog body with Gemini
  - Body: `{ prompt: string, existingContent?: string }`
  - Response: `{ content: string }`

### Data Models

- `Blog`:
  - `slug`, `title`, `subtitle?`, `author`, `tags[]`, `content`, `images?[]`, `createdAt`, `updatedAt`
- `Draft`:
  - `_id`, `title?`, `subtitle?`, `author?`, `tags?[]`, `content?`, `images?[]`, `slug?`, `createdAt`, `updatedAt`

### Security & Notes

- Rendering sanitizes HTML to a safe allowlist for common tags/attrs.
- Rate limiting/auth are not implemented by default; add before production.
- Image `Content-Type` defaults to `application/octet-stream` on download.

### Scripts

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # build (Turbopack)
npm run start    # start production server
npm run lint     # run ESLint
```

### Deployment

Deploy to any Node-compatible platform. Ensure `MONGODB_URI` and `GEMINI_API_KEY` are set in environment variables. For Vercel, add them in Project Settings → Environment Variables.

---
developed @ maddevs

visit maddevs.in
contact: mail@maddevs.in;
