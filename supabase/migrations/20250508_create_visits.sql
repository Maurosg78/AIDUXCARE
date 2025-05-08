create table if not exists public.visits (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.patients(id),
  date timestamp not null,
  type text not null,
  notes text,
  created_at timestamp default now()
);

-- Agregar algunos datos de ejemplo
insert into public.visits (patient_id, date, type, notes)
select 
  id as patient_id,
  now() - (random() * interval '30 days') as date,
  case 
    when random() < 0.3 then 'Primera visita'
    when random() < 0.6 then 'Seguimiento'
    else 'Control'
  end as type,
  'Notas de ejemplo para la visita' as notes
from public.patients; 