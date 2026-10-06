-- TECH TURTLES: database setup for Supabase.
-- Run once: Supabase dashboard → SQL Editor → New query → paste all of this → Run.

-- 1. Posts table ----------------------------------------------------------
create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 80),
  author_name text not null check (char_length(author_name) between 1 and 40),
  kind        text not null check (kind in ('Invention', 'Research paper', 'Tech idea')),
  description text not null check (char_length(description) between 1 and 400),
  contact_email text not null,
  image_paths jsonb not null default '[]'::jsonb,
  file_path   text,
  file_name   text check (file_name is null or char_length(file_name) <= 200),
  approved    boolean not null default false   -- you flip this to true to publish a post
);

-- 2. Row Level Security: who can do what ---------------------------------
alter table public.posts enable row level security;

-- Keep contact emails out of public and member-facing API reads.
revoke select on public.posts from anon, authenticated;
grant select (id, created_at, user_id, title, author_name, kind, description,
              image_paths, file_path, file_name, approved)
  on public.posts to anon, authenticated;

-- Everyone can read approved posts.
create policy "Anyone can read approved posts"
  on public.posts for select
  using (approved = true);

-- Signed-in people can also see their own posts (so they see "waiting for review").
create policy "Owners can read their own posts"
  on public.posts for select to authenticated
  using (auth.uid() = user_id);

-- Signed-in people can add posts, but only as unapproved, and only as themselves.
create policy "Signed-in users can add pending posts"
  on public.posts for insert to authenticated
  with check (auth.uid() = user_id and approved = false);

-- Owners can remove their own submissions, whether pending or approved.
create policy "Owners can delete their own posts"
  on public.posts for delete to authenticated
  using (auth.uid() = user_id);
grant delete on public.posts to authenticated;

-- 3. File storage bucket ---------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'papers', 'papers', true, 5242880,   -- 5 MB
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do nothing;

-- Signed-in people can upload, only into a folder named after their own user id.
create policy "Signed-in users can upload files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'papers' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners can delete their own uploaded files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'papers' and (storage.foldername(name))[1] = auth.uid()::text);

-- (No read policy: the bucket is public, so a file opens by its link, but nobody can list the bucket.)
