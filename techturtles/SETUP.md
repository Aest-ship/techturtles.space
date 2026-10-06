# Connecting the site to Supabase (about 15 minutes)

The site already contains all the code. You only create the project, run one SQL script, and paste two values.

## 1. Create the project
1. Go to supabase.com, sign up, and click **New project**. Pick a name (for example `techturtles`) and a database password. Save the password somewhere safe.
2. Choose the region closest to your visitors.

## 2. Create the table, rules and file bucket
1. In the dashboard open **SQL Editor** → **New query**.
2. Paste everything from `sql/setup.sql` and click **Run**.
3. You should now see a `posts` table under **Table Editor** and a `papers` bucket under **Storage**.

If you already created the table and bucket before adding project photos and contact emails, run this in the SQL Editor:

    alter table public.posts add column if not exists contact_email text;
    alter table public.posts add column if not exists image_paths jsonb not null default '[]'::jsonb;
    revoke select on public.posts from anon, authenticated;
    grant select (id, created_at, user_id, title, author_name, kind, description,
                  image_paths, file_path, file_name, approved)
      on public.posts to anon, authenticated;
    drop policy if exists "Owners can delete their own posts" on public.posts;
    create policy "Owners can delete their own posts"
      on public.posts for delete to authenticated
      using (auth.uid() = user_id);
    grant delete on public.posts to authenticated;
    drop policy if exists "Owners can delete their own uploaded files" on storage.objects;
    create policy "Owners can delete their own uploaded files"
      on storage.objects for delete to authenticated
      using (bucket_id = 'papers' and (storage.foldername(name))[1] = auth.uid()::text);

Deletion on the live site will stay blocked until these policies are run in your existing Supabase project.

For the existing `papers` bucket, add `image/jpeg`, `image/png`, and `image/webp` to its allowed MIME types under **Storage → Buckets → papers → Edit bucket**. Keep its 5 MB per-file size limit.

## 3. Allow sign-in links to return to your site
Open **Authentication → URL Configuration**:
- **Site URL:** `https://techturtles.space`
- **Redirect URLs:** add `https://techturtles.space` and `http://localhost:8000` (for testing)

## 4. Paste your keys into the site
Open **Project Settings → API** (or the **Connect** button). Copy:
- **Project URL**
- **anon / publishable key**

Paste them into `js/config.js` as `supabaseUrl` and `supabaseAnonKey`.
Do NOT paste the `service_role` / secret key anywhere in the site.

## 5. Test locally
Sign-in links don't work from a double-clicked file, so run a local server:

    cd techturtles
    python3 -m http.server 8000

Open http://localhost:8000, sign in with your email, and post a test project with at least one JPG, PNG, or WebP photo. A PDF or Word document is optional.
The post shows "Waiting for review" to you only. The first photo is the card thumbnail; additional photos appear with it. Contact emails are stored for communication and are not returned by the public/member-facing API. Signed-in owners can delete submissions from their showcase card before or after approval.

## 6. Approve posts (this is your moderation step)
**Table Editor → posts** → tick the `approved` box on a row. It then appears for everyone on `showcase.html`.
Before approving, open the attached file (Storage → papers) and read the post. To remove a post, delete the row.

## 7. Before launch
- Set `showExamples: false` in `js/config.js` once you have real projects.
- The free plan pauses a project after about 7 days without activity. If the site stops loading posts, open the dashboard and restore the project. The Pro plan removes the pause.
- Supabase's built-in email sender has a very low hourly limit. Before real visitors arrive, add your own email provider under **Authentication → SMTP Settings**.
- Because posters may be minors, check the privacy rules that apply to you (in Brazil, LGPD has specific rules for children's data) and add a short privacy notice and parent/guardian consent step if needed.
- Host the static files anywhere free (GitHub Pages, Netlify or Cloudflare Pages) and point techturtles.space at it.
