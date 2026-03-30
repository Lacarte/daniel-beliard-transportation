# Supabase Integration Plan — Sunshine Trans INC

## Overview
Migrate from localStorage to Supabase (PostgreSQL) for persistent, cloud-based data storage with future support for auth, realtime, and multi-user access.

---

## Phase 1: Project Setup
- [ ] Create Supabase project at supabase.com
- [ ] Run `supabase-schema.sql` in SQL Editor (creates tables, indexes, RLS policies)
- [ ] Copy Project URL + Anon Key from Settings > API
- [x] Install `@supabase/supabase-js` SDK in vue-app

## Phase 2: Client Integration
- [ ] Create `vue-app/src/lib/supabase.js` — Supabase client init with URL + Key
- [ ] Create `vue-app/src/composables/useSupabase.js` — CRUD functions for all tables
  - `fetchLoads()` — select loads with fuel + expenses (joined)
  - `createLoad(data)` — insert load + nested fuel/expenses
  - `updateLoad(id, data)` — update load + sync nested records
  - `deleteLoad(id)` — cascade delete
  - `fetchSettings()` / `updateSettings(data)`
  - `fetchHistory()` / `saveHistory(data)` / `deleteHistory(id)`
- [ ] Update `usePayroll.js` — replace localStorage read/write with Supabase calls
  - Keep reactive state, load from Supabase on init
  - Save to Supabase on mutations (debounced)
  - Fallback to localStorage when offline

## Phase 3: Data Migration
- [ ] On first load, check if localStorage has data + Supabase is empty
- [ ] Auto-migrate existing localStorage data to Supabase
- [ ] Show toast: "Data synced to cloud"
- [ ] Keep localStorage as offline cache

## Phase 4: Environment Config
- [ ] Create `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Add `.env` to `.gitignore`
- [ ] Update `vite.config.js` if needed (Vite auto-exposes VITE_ prefixed vars)

---

## Database Schema

### Tables
| Table | Purpose |
|---|---|
| `settings` | Company/driver config (1 row per user) |
| `loads` | Transportation loads with payment info |
| `load_fuel` | Fuel entries per load |
| `load_expenses` | Expense entries per load |
| `pay_history` | Historical pay period snapshots |

### Relationships
```
settings (1) ──── (many) loads
loads    (1) ──── (many) load_fuel
loads    (1) ──── (many) load_expenses
settings (1) ──── (many) pay_history
```

### Key Indexes
- `loads.settings_id`, `loads.status`, `loads.load_date`, `loads.driver_name`
- `load_fuel.load_id`, `load_expenses.load_id`
- `pay_history.settings_id`

---

## Future Phases (not in scope now)

### Phase 5: Authentication
- Add Supabase Auth (email/password or magic link)
- Replace open RLS policies with user-based policies
- Each user sees only their own data

### Phase 6: Realtime
- Subscribe to load changes for live dashboard updates
- Useful when multiple dispatchers/drivers use the app

### Phase 7: File Storage
- Upload receipts, fuel receipts, documents via Supabase Storage
- Attach files to loads

---

## Tech Stack After Integration
- **Frontend:** Vue 3 + Vite + Tailwind CDN
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (future)
- **Hosting:** Railway (Express serves Vue build)
- **SDK:** @supabase/supabase-js
