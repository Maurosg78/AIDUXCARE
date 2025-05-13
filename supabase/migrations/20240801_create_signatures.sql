-- Crear tabla para firmas digitales de documentos
create table if not exists public.signatures (
  id uuid primary key default gen_random_uuid(),
  visit_id text not null,
  professional_id text not null,
  hash text not null,
  created_at timestamptz default now()
);

-- Crear índices para mejorar las búsquedas
create index signatures_visit_id_idx on public.signatures(visit_id);
create index signatures_professional_id_idx on public.signatures(professional_id);

-- Habilitar Row Level Security (RLS)
alter table public.signatures enable row level security;

-- Políticas de seguridad
-- Permitir lectura a todos los usuarios autenticados
create policy "Permitir lectura de firmas a usuarios autenticados" 
on public.signatures for select 
using (auth.role() = 'authenticated');

-- Permitir inserción solo a usuarios con rol profesional o admin
create policy "Permitir inserción de firmas a profesionales y admin" 
on public.signatures for insert 
with check (auth.role() in ('professional', 'admin')); 