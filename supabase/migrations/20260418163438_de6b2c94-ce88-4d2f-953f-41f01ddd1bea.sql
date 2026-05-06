create type public.app_role as enum ('admin', 'editor', 'viewer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.update_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end;
$$;

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title_fr text not null,
  title_ar text,
  summary_fr text,
  summary_ar text,
  description_fr text,
  description_ar text,
  image_url text,
  event_date date,
  location text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.events enable row level security;
create trigger events_updated_at before update on public.events
  for each row execute function public.update_updated_at();

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  title_fr text not null,
  title_ar text,
  authors text,
  abstract_fr text,
  abstract_ar text,
  pdf_url text,
  external_url text,
  cover_url text,
  publication_year int,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.publications enable row level security;
create trigger publications_updated_at before update on public.publications
  for each row execute function public.update_updated_at();

create table public.albums (
  id uuid primary key default gen_random_uuid(),
  title_fr text not null,
  title_ar text,
  description_fr text,
  description_ar text,
  cover_url text,
  album_date date,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.albums enable row level security;
create trigger albums_updated_at before update on public.albums
  for each row execute function public.update_updated_at();

create table public.album_images (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.album_images enable row level security;
create index album_images_album_id_idx on public.album_images(album_id);

create policy "Users view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Admins view all profiles" on public.profiles
  for select using (public.has_role(auth.uid(), 'admin'));

create policy "Users view own roles" on public.user_roles
  for select using (auth.uid() = user_id);
create policy "Admins view all roles" on public.user_roles
  for select using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles" on public.user_roles
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Anyone reads published events" on public.events
  for select using (is_published = true or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));
create policy "Admins/editors manage events" on public.events
  for all using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

create policy "Anyone reads published publications" on public.publications
  for select using (is_published = true or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));
create policy "Admins/editors manage publications" on public.publications
  for all using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

create policy "Anyone reads published albums" on public.albums
  for select using (is_published = true or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));
create policy "Admins/editors manage albums" on public.albums
  for all using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

create policy "Anyone reads images of published albums" on public.album_images
  for select using (
    exists (select 1 from public.albums a where a.id = album_id and a.is_published = true)
    or public.has_role(auth.uid(), 'admin')
    or public.has_role(auth.uid(), 'editor')
  );
create policy "Admins/editors manage album images" on public.album_images
  for all using (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'))
  with check (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor'));

insert into storage.buckets (id, name, public) values
  ('events', 'events', true),
  ('publications', 'publications', true),
  ('albums', 'albums', true)
on conflict (id) do nothing;

create policy "Public read events bucket" on storage.objects
  for select using (bucket_id = 'events');
create policy "Admins/editors write events bucket" on storage.objects
  for insert with check (bucket_id = 'events' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')));
create policy "Admins/editors update events bucket" on storage.objects
  for update using (bucket_id = 'events' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')));
create policy "Admins/editors delete events bucket" on storage.objects
  for delete using (bucket_id = 'events' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')));

create policy "Public read publications bucket" on storage.objects
  for select using (bucket_id = 'publications');
create policy "Admins/editors write publications bucket" on storage.objects
  for insert with check (bucket_id = 'publications' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')));
create policy "Admins/editors update publications bucket" on storage.objects
  for update using (bucket_id = 'publications' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')));
create policy "Admins/editors delete publications bucket" on storage.objects
  for delete using (bucket_id = 'publications' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')));

create policy "Public read albums bucket" on storage.objects
  for select using (bucket_id = 'albums');
create policy "Admins/editors write albums bucket" on storage.objects
  for insert with check (bucket_id = 'albums' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')));
create policy "Admins/editors update albums bucket" on storage.objects
  for update using (bucket_id = 'albums' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')));
create policy "Admins/editors delete albums bucket" on storage.objects
  for delete using (bucket_id = 'albums' and (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'editor')));