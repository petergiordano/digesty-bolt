/*
# Digesty Database Schema - MVP Foundation

1. New Tables
   - `newsletters` - Raw uploaded newsletter files
   - `digests` - Processed newsletter summaries  
   - `themes` - Individual theme insights (5 per digest)
   - `run_log` - Processing status and metrics

2. Storage
   - `uploads` bucket for newsletter files

3. Notes
   - No RLS policies (MVP phase)
   - user_id fields nullable for MVP
*/

-- newsletters/raw input
create table if not exists newsletters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, -- null in MVP
  filename text not null,
  file_type text not null,  -- 'eml' | 'html'
  file_content text not null,
  uploaded_at timestamptz default now()
);

-- digests/processed result
create table if not exists digests (
  id uuid primary key default gen_random_uuid(),
  newsletter_id uuid not null references newsletters(id) on delete cascade,
  user_id uuid, -- null in MVP
  title text not null,
  source_name text,
  cleaned_content text not null,
  processed_at timestamptz default now()
);

-- themes/layered insights
create table if not exists themes (
  id uuid primary key default gen_random_uuid(),
  digest_id uuid not null references digests(id) on delete cascade,
  theme_title text not null,
  theme_summary text not null,
  detailed_insights jsonb not null,  -- [{insight, quote, source}]
  theme_order int not null check (theme_order between 1 and 5)
);

-- processing run log
create table if not exists run_log (
  id uuid primary key default gen_random_uuid(),
  newsletter_id uuid not null references newsletters(id) on delete cascade,
  stage text not null,       -- 'cleaning' | 'summarizing' | 'export'
  status text not null,      -- 'success' | 'failure'
  tokens_used int,
  duration_ms int,
  error_message text,
  created_at timestamptz default now()
);

create index if not exists idx_digests_newsletter on digests(newsletter_id);
create index if not exists idx_themes_digest on themes(digest_id);
create index if not exists idx_runlog_newsletter on run_log(newsletter_id);

-- Create storage bucket for uploads
insert into storage.buckets (id, name, public) 
values ('uploads', 'uploads', false)
on conflict (id) do nothing;