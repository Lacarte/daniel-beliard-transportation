-- =============================================
-- Sunshine Trans Inc — Supabase Schema
-- Run this in Supabase SQL Editor (Settings > SQL Editor)
-- =============================================

-- 1. Settings table (one row per user/company)
create table settings (
  id uuid primary key default gen_random_uuid(),
  payee_name text not null default 'Daniel Beliard',
  company_name text not null default 'SUNSHINE TRANS INC',
  company_email text default '',
  company_phone text default '',
  payment_date text default '06/01/24-06/30/24',
  payment_method text default 'Monthly',
  pay_rate numeric(5,2) default 20,
  factoring_rate numeric(5,2) default 2.5,
  tax_status text default '1099',
  allowances integer default 0,
  additional_pct numeric(5,2) default 0,
  additional_amt numeric(10,2) default 0,
  default_email text default '',
  cc_email text default '',
  email_provider text default 'mailto',
  expense_template jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Loads table
create table loads (
  id text primary key,
  load_number text default '',
  name text default '',
  amount numeric(10,2) default 0,
  load_date date,
  delivery_date date,
  status text default 'pending',
  driver_name text default '',
  pay_rate numeric(5,2) default 20,
  factoring_rate numeric(5,2) default 2.5,
  pay_method text default 'Monthly',
  tax_status text default '1099',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Fuel entries (per load)
create table fuel_entries (
  id uuid primary key default gen_random_uuid(),
  load_id text not null references loads(id) on delete cascade,
  name text default '',
  miles numeric(10,2) default 0,
  price_per_gallon numeric(5,3) default 0,
  amount numeric(10,2) default 0,
  sort_order integer default 0
);

-- 4. Expenses (per load)
create table expenses (
  id uuid primary key default gen_random_uuid(),
  load_id text not null references loads(id) on delete cascade,
  name text default '',
  amount numeric(10,2) default 0,
  is_driver_pay boolean default false,
  sort_order integer default 0
);

-- 5. Documents (per load — metadata only, files go to Supabase Storage)
create table documents (
  id uuid primary key default gen_random_uuid(),
  load_id text not null references loads(id) on delete cascade,
  name text default '',
  type text default '',
  size integer default 0,
  storage_path text default '',
  added_at timestamptz default now()
);

-- 6. Pay history snapshots
create table history (
  id uuid primary key default gen_random_uuid(),
  period text not null,
  payee text default '',
  gross numeric(10,2) default 0,
  deductions numeric(10,2) default 0,
  net numeric(10,2) default 0,
  load_count integer default 0,
  snapshot jsonb default '[]'::jsonb,
  saved_at timestamptz default now()
);

-- =============================================
-- Indexes for common queries
-- =============================================
create index idx_loads_status on loads(status);
create index idx_loads_driver on loads(driver_name);
create index idx_loads_load_date on loads(load_date);
create index idx_fuel_load_id on fuel_entries(load_id);
create index idx_expenses_load_id on expenses(load_id);
create index idx_documents_load_id on documents(load_id);
create index idx_history_saved_at on history(saved_at);

-- =============================================
-- Auto-update updated_at on loads and settings
-- =============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger loads_updated_at
  before update on loads
  for each row execute function update_updated_at();

create trigger settings_updated_at
  before update on settings
  for each row execute function update_updated_at();

-- =============================================
-- Insert default settings row
-- =============================================
insert into settings (
  payee_name, company_name, payment_date, payment_method,
  pay_rate, factoring_rate, tax_status, expense_template
) values (
  'Daniel Beliard', 'SUNSHINE TRANS INC', '06/01/24-06/30/24', 'Monthly',
  20, 2.5, '1099',
  '[{"name":"Driver","amount":0,"isDriverPay":true},{"name":"Insurance","amount":1500},{"name":"ELD Log","amount":150},{"name":"Oil Change","amount":900},{"name":"Trailer","amount":695},{"name":"Shower","amount":0},{"name":"Scale","amount":0},{"name":"Food","amount":0},{"name":"Toll","amount":0},{"name":"Tire","amount":0},{"name":"Maintenance","amount":0}]'::jsonb
);
