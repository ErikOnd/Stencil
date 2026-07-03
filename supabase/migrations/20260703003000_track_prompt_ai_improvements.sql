alter table public.prompts
add column if not exists ai_improved_at timestamptz;
