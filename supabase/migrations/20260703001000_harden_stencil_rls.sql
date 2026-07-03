create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own"
on public.profiles for delete
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "prompts_select_own" on public.prompts;
create policy "prompts_select_own"
on public.prompts for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "prompts_insert_own" on public.prompts;
create policy "prompts_insert_own"
on public.prompts for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "prompts_update_own" on public.prompts;
create policy "prompts_update_own"
on public.prompts for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "prompts_delete_own" on public.prompts;
create policy "prompts_delete_own"
on public.prompts for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "prompt_variables_select_own" on public.prompt_variables;
create policy "prompt_variables_select_own"
on public.prompt_variables for select
to authenticated
using (
  exists (
    select 1 from public.prompts
    where prompts.id = prompt_variables.prompt_id
      and prompts.user_id = (select auth.uid())
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
      and prompts.user_id = (select auth.uid())
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
      and prompts.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1 from public.prompts
    where prompts.id = prompt_variables.prompt_id
      and prompts.user_id = (select auth.uid())
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
      and prompts.user_id = (select auth.uid())
  )
);
