create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null,
  date timestamptz not null,
  type text,
  notes text,
  created_at timestamptz default now()
); 