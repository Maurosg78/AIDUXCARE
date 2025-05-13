create extension if not exists "uuid-ossp";

create table if not exists public.patients (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  birth_date date not null,
  gender text check (gender in ('male', 'female', 'other')),
  email text,
  phone text,
  created_at timestamp default now()
);

insert into public.patients (full_name, birth_date, gender, email, phone) values
('Andreina Saade', '1982-10-15', 'female', 'andreina@aiduxcare.test', '+34 600 000 001'),
('Pilar López', '1973-12-31', 'female', 'pilar@aiduxcare.test', '+34 600 000 002'),
('Nuria Arnedo', '1991-06-22', 'female', 'nuria@aiduxcare.test', '+34 600 000 003'),
('José Miralles', '1980-09-05', 'male', 'jose@aiduxcare.test', '+34 600 000 004'),
('Paula Weinstein', '1978-03-17', 'female', 'paula@aiduxcare.test', '+34 600 000 005');
