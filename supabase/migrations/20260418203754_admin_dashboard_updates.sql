-- Add analytics table for visitor tracking
create table public.analytics (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  unique_visitors int not null default 0,
  page_views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.analytics enable row level security;
create trigger analytics_updated_at before update on public.analytics
  for each row execute function public.update_updated_at();

-- Add category to publications
alter table public.publications add column category text;

-- Create team table for faculty and staff
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  bio text,
  image_url text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.team_members enable row level security;
create trigger team_members_updated_at before update on public.team_members
  for each row execute function public.update_updated_at();

-- RLS Policies for analytics (admins only)
create policy "Admins manage analytics" on public.analytics
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for team_members
create policy "Anyone reads active team members" on public.team_members
  for select using (is_active = true or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));
create policy "Admins/editors manage team members" on public.team_members
  for all using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

-- Create storage bucket for team images
insert into storage.buckets (id, name, public) values
  ('team', 'team', true)
on conflict (id) do nothing;

create policy "Public read team bucket" on storage.objects
  for select using (bucket_id = 'team');
create policy "Admins/editors write team bucket" on storage.objects
  for insert with check (bucket_id = 'team' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')));
create policy "Admins/editors update team bucket" on storage.objects
  for update using (bucket_id = 'team' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')));
create policy "Admins/editors delete team bucket" on storage.objects
  for delete using (bucket_id = 'team' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')));

-- RPC function to increment page views
create or replace function increment_page_views(visit_date date)
returns void
language plpgsql
security definer
as $$
begin
  update analytics
  set page_views = page_views + 1
  where date = visit_date;
end;
$$;