-- Create partners table for partner organizations
create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  description text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.partners enable row level security;
create trigger partners_updated_at before update on public.partners
  for each row execute function public.update_updated_at();

-- RLS Policies for partners
create policy "Anyone reads active partners" on public.partners
  for select using (is_active = true or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));
create policy "Admins/editors manage partners" on public.partners
  for all using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

-- Create storage bucket for partner logos
insert into storage.buckets (id, name, public) values
  ('partners', 'partners', true)
on conflict (id) do nothing;

create policy "Public read partners bucket" on storage.objects
  for select using (bucket_id = 'partners');

create policy "Admins/editors manage partners bucket" on storage.objects
  for all using (bucket_id = 'partners' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')))
  with check (bucket_id = 'partners' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')));