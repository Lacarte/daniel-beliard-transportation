-- =============================================
-- Migration: Add user_id to all tables + RLS
-- Run this in Supabase SQL Editor AFTER the initial schema
-- =============================================

-- 1. Add user_id column to all tables
alter table settings add column user_id uuid references auth.users(id) on delete cascade;
alter table loads add column user_id uuid references auth.users(id) on delete cascade;
alter table fuel_entries add column user_id uuid references auth.users(id) on delete cascade;
alter table expenses add column user_id uuid references auth.users(id) on delete cascade;
alter table documents add column user_id uuid references auth.users(id) on delete cascade;
alter table history add column user_id uuid references auth.users(id) on delete cascade;

-- 2. Create indexes on user_id
create index idx_settings_user on settings(user_id);
create index idx_loads_user on loads(user_id);
create index idx_fuel_user on fuel_entries(user_id);
create index idx_expenses_user on expenses(user_id);
create index idx_documents_user on documents(user_id);
create index idx_history_user on history(user_id);

-- 3. Enable RLS on all tables
alter table settings enable row level security;
alter table loads enable row level security;
alter table fuel_entries enable row level security;
alter table expenses enable row level security;
alter table documents enable row level security;
alter table history enable row level security;

-- 4. RLS Policies — each user can only access their own data

-- Settings
create policy "Users can view own settings"
  on settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings"
  on settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings"
  on settings for update using (auth.uid() = user_id);
create policy "Users can delete own settings"
  on settings for delete using (auth.uid() = user_id);

-- Loads
create policy "Users can view own loads"
  on loads for select using (auth.uid() = user_id);
create policy "Users can insert own loads"
  on loads for insert with check (auth.uid() = user_id);
create policy "Users can update own loads"
  on loads for update using (auth.uid() = user_id);
create policy "Users can delete own loads"
  on loads for delete using (auth.uid() = user_id);

-- Fuel entries (access via load ownership)
create policy "Users can view own fuel"
  on fuel_entries for select using (auth.uid() = user_id);
create policy "Users can insert own fuel"
  on fuel_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own fuel"
  on fuel_entries for update using (auth.uid() = user_id);
create policy "Users can delete own fuel"
  on fuel_entries for delete using (auth.uid() = user_id);

-- Expenses
create policy "Users can view own expenses"
  on expenses for select using (auth.uid() = user_id);
create policy "Users can insert own expenses"
  on expenses for insert with check (auth.uid() = user_id);
create policy "Users can update own expenses"
  on expenses for update using (auth.uid() = user_id);
create policy "Users can delete own expenses"
  on expenses for delete using (auth.uid() = user_id);

-- Documents
create policy "Users can view own documents"
  on documents for select using (auth.uid() = user_id);
create policy "Users can insert own documents"
  on documents for insert with check (auth.uid() = user_id);
create policy "Users can update own documents"
  on documents for update using (auth.uid() = user_id);
create policy "Users can delete own documents"
  on documents for delete using (auth.uid() = user_id);

-- History
create policy "Users can view own history"
  on history for select using (auth.uid() = user_id);
create policy "Users can insert own history"
  on history for insert with check (auth.uid() = user_id);
create policy "Users can update own history"
  on history for update using (auth.uid() = user_id);
create policy "Users can delete own history"
  on history for delete using (auth.uid() = user_id);

-- 5. Remove the default settings row (each user creates their own on first login)
delete from settings where user_id is null;
