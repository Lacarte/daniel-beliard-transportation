-- =============================================
-- Sunshine Trans INC - Supabase Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. SETTINGS TABLE
create table settings (
  id uuid primary key default gen_random_uuid(),
  payee_name text not null default 'Daniel Beliard',
  payment_date text default '06/01/24-06/30/24',
  payment_method text default 'Monthly',
  pay_rate numeric default 20,
  tax_status text default '1099',
  allowances integer default 0,
  additional_pct numeric default 0,
  additional_amt numeric default 0,
  company_name text default 'SUNSHINE TRANS INC',
  company_email text default '',
  company_phone text default '',
  default_email text default '',
  cc_email text default '',
  email_provider text default 'mailto',
  expense_template jsonb default '[
    {"name":"Driver","amount":0,"isDriverPay":true},
    {"name":"Insurance","amount":1500},
    {"name":"ELD Log","amount":150},
    {"name":"Oil Change","amount":900},
    {"name":"Trailer","amount":695},
    {"name":"Shower","amount":0},
    {"name":"Scale","amount":0},
    {"name":"Food","amount":0},
    {"name":"Toll","amount":0},
    {"name":"Tire","amount":0},
    {"name":"Maintenance","amount":0}
  ]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. LOADS TABLE
create table loads (
  id uuid primary key default gen_random_uuid(),
  settings_id uuid references settings(id) on delete cascade,
  load_id text not null,
  name text not null default '',
  amount numeric not null default 0,
  load_date date,
  delivery_date date,
  status text not null default 'pending',
  driver_name text default '',
  pay_rate numeric default 20,
  pay_method text default 'Monthly',
  tax_status text default '1099',
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. LOAD FUEL ENTRIES
create table load_fuel (
  id uuid primary key default gen_random_uuid(),
  load_id uuid references loads(id) on delete cascade,
  name text not null default 'Fuel',
  amount numeric not null default 0,
  created_at timestamptz default now()
);

-- 4. LOAD EXPENSES
create table load_expenses (
  id uuid primary key default gen_random_uuid(),
  load_id uuid references loads(id) on delete cascade,
  name text not null default '',
  amount numeric not null default 0,
  is_driver_pay boolean default false,
  created_at timestamptz default now()
);

-- 5. PAY HISTORY
create table pay_history (
  id uuid primary key default gen_random_uuid(),
  settings_id uuid references settings(id) on delete cascade,
  period text not null,
  payee text not null,
  gross numeric default 0,
  deductions numeric default 0,
  net numeric default 0,
  load_count integer default 0,
  snapshot jsonb default '[]'::jsonb,
  saved_at timestamptz default now()
);

-- =============================================
-- INDEXES for performance
-- =============================================
create index idx_loads_settings on loads(settings_id);
create index idx_loads_status on loads(status);
create index idx_loads_date on loads(load_date);
create index idx_loads_driver on loads(driver_name);
create index idx_load_fuel_load on load_fuel(load_id);
create index idx_load_expenses_load on load_expenses(load_id);
create index idx_pay_history_settings on pay_history(settings_id);

-- =============================================
-- ROW LEVEL SECURITY (enable later with auth)
-- For now, allow all operations
-- =============================================
alter table settings enable row level security;
alter table loads enable row level security;
alter table load_fuel enable row level security;
alter table load_expenses enable row level security;
alter table pay_history enable row level security;

-- Temporary open policies (replace with auth-based policies later)
create policy "Allow all on settings" on settings for all using (true) with check (true);
create policy "Allow all on loads" on loads for all using (true) with check (true);
create policy "Allow all on load_fuel" on load_fuel for all using (true) with check (true);
create policy "Allow all on load_expenses" on load_expenses for all using (true) with check (true);
create policy "Allow all on pay_history" on pay_history for all using (true) with check (true);

-- =============================================
-- Insert default settings row
-- =============================================
insert into settings (payee_name, company_name) values ('Daniel Beliard', 'SUNSHINE TRANS INC');
