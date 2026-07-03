create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  description text not null default '',
  body text not null default '',
  tags text[] not null default '{}',
  favorite boolean not null default false,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.prompt_variables (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts(id) on delete cascade,
  name text not null,
  label text not null default '',
  placeholder text not null default '',
  default_value text not null default '',
  required boolean not null default true,
  multiline boolean not null default false,
  position integer not null default 0,
  unique (prompt_id, name)
);

create index if not exists prompts_user_id_idx on public.prompts(user_id);
create index if not exists prompts_user_last_used_idx on public.prompts(user_id, last_used_at desc nulls last);
create index if not exists prompt_variables_prompt_position_idx on public.prompt_variables(prompt_id, position);

drop trigger if exists prompts_set_updated_at on public.prompts;
create trigger prompts_set_updated_at
before update on public.prompts
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.prompts enable row level security;
alter table public.prompt_variables enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles for delete
to authenticated
using (auth.uid() = id);

drop policy if exists "prompts_select_own" on public.prompts;
create policy "prompts_select_own"
on public.prompts for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "prompts_insert_own" on public.prompts;
create policy "prompts_insert_own"
on public.prompts for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "prompts_update_own" on public.prompts;
create policy "prompts_update_own"
on public.prompts for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "prompts_delete_own" on public.prompts;
create policy "prompts_delete_own"
on public.prompts for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "prompt_variables_select_own" on public.prompt_variables;
create policy "prompt_variables_select_own"
on public.prompt_variables for select
to authenticated
using (
  exists (
    select 1 from public.prompts
    where prompts.id = prompt_variables.prompt_id
      and prompts.user_id = auth.uid()
  )
);

drop policy if exists "prompt_variables_insert_own" on public.prompt_variables;
create policy "prompt_variables_insert_own"
on public.prompt_variables for insert
to authenticated
with check (
  exists (
    select 1 from public.prompts
    where prompts.id = prompt_variables.prompt_id
      and prompts.user_id = auth.uid()
  )
);

drop policy if exists "prompt_variables_update_own" on public.prompt_variables;
create policy "prompt_variables_update_own"
on public.prompt_variables for update
to authenticated
using (
  exists (
    select 1 from public.prompts
    where prompts.id = prompt_variables.prompt_id
      and prompts.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.prompts
    where prompts.id = prompt_variables.prompt_id
      and prompts.user_id = auth.uid()
  )
);

drop policy if exists "prompt_variables_delete_own" on public.prompt_variables;
create policy "prompt_variables_delete_own"
on public.prompt_variables for delete
to authenticated
using (
  exists (
    select 1 from public.prompts
    where prompts.id = prompt_variables.prompt_id
      and prompts.user_id = auth.uid()
  )
);

