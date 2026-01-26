-- Migration: Add Roles and Status to Profiles

-- 1. Create profiles table if it doesn't exist (extends auth.users)
create table if not exists public.profiles (
 

-- 2. Add columns if table existed but columns didn't
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'role') then
    alter table public.profiles add column role text check (role in ('super_admin', 'admin_employee', 'business_owner', 'user')) default 'user';
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'status') then
    alter table public.profiles add column status text check (status in ('active', 'invited', 'suspended')) default 'active';
  end if;
end $$;

-- 3. Enable RLS
alter table public.profiles enable row level security;

-- 4. Policies
-- Public read access (for basic profile info if needed, or restrict to auth users)
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

-- Users can update their own profile
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Super Admins can do everything
create policy "Super Admins can do everything" on public.profiles
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- Admin Employees can view profiles but not edit others (except maybe invited?)
create policy "Admin Employees can view profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin_employee'
    )
  );

-- 5. Trigger to automatically create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
