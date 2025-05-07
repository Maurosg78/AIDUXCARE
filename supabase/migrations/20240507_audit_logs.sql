-- Tabla de logs clínicos para trazabilidad legal
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  visit_id uuid not null,
  timestamp timestamptz not null default now(),
  action text not null check (action in ('field_updated', 'suggestion_accepted', 'copilot_intervention', 'manual_edit', 'form_submitted')),
  field text not null,
  old_value text,
  new_value text,
  modified_by text not null,
  source text not null check (source in ('user', 'copilot'))
);

alter table audit_logs enable row level security;
create policy "Allow read access to all" on audit_logs for select using (true);
create policy "Allow insert for authenticated" on audit_logs for insert with check (auth.role() = 'authenticated'); 