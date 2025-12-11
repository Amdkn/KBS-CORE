# KBS Marketplace (Solarpunk Edition)

Welcome to the Kounta Business System (KBS) Marketplace repository. This project is built with **Next.js 14** and **Supabase**, designed for an "Antifragile" and "Solarpunk" aesthetic.

## 🤖 Instructions for Agent Jules

**Mission:** Deploy this codebase to Vercel and ensure the Supabase backend is correctly provisioned.

### 1. Technology Stack
- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS.
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime).
- **AI:** Google Gemini API (via `@google/genai`).
- **Styling:** Lucide React (Icons), Custom Tailwind Config.

### 2. Environment Setup
Ensure the following environment variables are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `API_KEY` (Google Gemini)

### 3. Database Schema (Supabase)
The application requires the following tables in the `public` schema:

- **`app_user`**:
  - `id` (uuid, PK, references auth.users)
  - `name` (text)
  - `city` (text)
  - `zip` (text)
  - `reputation_score` (float)
  - `karma_points` (int)
  - `avatar_url` (text)

- **`listing`**:
  - `id` (uuid, PK)
  - `seller_id` (uuid, references app_user)
  - `circle_id` (uuid, references circle)
  - `title` (text)
  - `description` (text)
  - `category` (text)
  - `condition` (text)
  - `price_cents` (int)
  - `type` (text: 'SALE', 'DONATION', 'TRADE')
  - `status` (text)
  - `created_at` (timestamptz)

- **`listing_media`**:
  - `id` (uuid, PK)
  - `listing_id` (uuid, references listing)
  - `storage_path` (text)

- **`circle`** (Community Hubs):
  - `id` (uuid, PK)
  - `name` (text)
  - `zip_center` (text)
  - `image_url` (text)

- **`conversation`**:
  - `id` (uuid, PK)
  - `participant1_id` (uuid)
  - `participant2_id` (uuid)
  - `last_message` (text)
  - `last_message_at` (timestamptz)

- **`message`**:
  - `id` (uuid, PK)
  - `conversation_id` (uuid)
  - `sender_id` (uuid)
  - `content` (text)
  - `is_read` (boolean)
  - `created_at` (timestamptz)

- **`notification`**:
  - `id` (uuid, PK)
  - `user_id` (uuid)
  - `type` (text)
  - `title` (text)
  - `message` (text)
  - `is_read` (boolean)
  - `created_at` (timestamptz)

- **`story`**:
  - `id` (uuid, PK)
  - `circle_id` (uuid)
  - `media_url` (text)
  - `title` (text)
  - `type` (text)
  - `expires_at` (timestamptz)

### 4. Storage Buckets
Create two public buckets in Supabase Storage:
1.  **`avatars`**: For user profile pictures.
2.  **`listings`**: For item photos.

### 5. Build & Deploy
Run `npm install` followed by `npm run build`. The project is configured to handle missing keys gracefully during the build process, utilizing `lib/supabase/client.ts` for safe initialization.

---
*Built with ❤️ for the Ohio/Kentucky Circular Economy.*