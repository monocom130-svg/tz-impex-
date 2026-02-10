# Deployment Guide - T-Z IMPEX

Follow these steps to successfully connect your database and deploy your application to Netlify.

## 1. Supabase Setup (Database)

1. Create a new project at [Supabase](https://supabase.com/).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open the file [final_schema.sql](file:///e:/New%20folder/t-z-impex/supabase/final_schema.sql) in this repository.
4. Copy the entire contents and paste it into the Supabase SQL Editor, then click **Run**.
5. Enable **Email Auth** in the **Authentication > Settings** menu.

## 2. Environment Variables

You need to obtain your Supabase API keys:
1. Go to **Project Settings > API**.
2. Copy the **Project URL** and **anon public** key.

## 3. Netlify Deployment

1. Create a [Netlify](https://www.netlify.com/) account and log in.
2. Click **Add new site > Import from an existing project**.
3. Connect your GitHub/GitLab repository.
4. Set the following build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **Add Environment Variables** and enter:
   - `VITE_SUPABASE_URL`: (Your Supabase URL)
   - `VITE_SUPABASE_ANON_KEY`: (Your Supabase Anon Key)
6. Click **Deploy Site**.

## 4. Post-Deployment Setup (Admins & Riders)

After signing up, you can manually set user roles in the Supabase **Table Editor**:
1. Go to the `profiles` table.
2. Find your user record and change the `role` field from `customer` to `admin` or `rider` as needed to access restricted dashboards.

---

> [!TIP]
> **Netlify Redirects**: If you experience "404 Not Found" on page refresh, create a `public/_redirects` file with the following content:
> `/*    /index.html   200`
