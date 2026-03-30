# Sunshine Trans INC - Payroll Dashboard: Section-by-Section Breakdown

## Overview

This application converts the **Sunshine Masters.xlsx** pay stub spreadsheet into a fully interactive web dashboard. Every section below maps directly to a region of that Excel sheet and replicates its formulas in real-time JavaScript.

---

## 1. SIDEBAR (Left Navigation)

**What it is:** A fixed blue sidebar (`#1e3a8a`) pinned to the left edge, always visible on desktop. On mobile it collapses behind a hamburger button.

**What it does:**
- Provides navigation between all 8 pages of the app
- Shows the Sunshine Trans logo/icon at the top
- Highlights the currently active page in white
- Copyright footer at the bottom

**Design origin:** Mirrors the `DashboardSidebar.tsx` from haiti-event-pass with the same `bg-blue-900`, white active state, and `shadow-[inset]` border styling between links.

---

## 2. WELCOME HEADER (Top Bar)

**What it is:** A white card with a blue border at the top of every page, showing the current user context.

**What it shows:**
- **Avatar circle** with initials (e.g. "DB" for Daniel Beliard) using a blue-to-purple gradient
- **"Welcome back, Daniel Beliard"** greeting
- **Today's date** (auto-generated)
- **Pay Period** pulled from Settings (e.g. `06/01/24 - 06/30/24`)
- **Tax Status badge** (green pill showing "1099")
- **Settings button** for quick access

**Excel mapping:** Corresponds to rows 2-5 of the spreadsheet:
- `A2/B2` = PAYEE NAME / Daniel Beliard
- `A3/B3` = PAYMENT DATE / 06/01/24-06/30/24
- `D2/E2` = TAX STATUS / 1099

**Design origin:** Mirrors `WelcomeHeader.tsx` from haiti-event-pass with avatar, welcome text, info dots, and action buttons.

---

## 3. DASHBOARD PAGE (Home)

### 3a. Quick Stats (4 cards across the top)

| Card | Color | Excel Source | Formula |
|------|-------|-------------|---------|
| **Total Gross Pay** | Gold left-border | Cell `A32` | `=B25` which is `=SUM(B9:B24)` (sum of all load amounts) |
| **Total Deductions** | Red left-border | Cell `C32` | `=D25+F25` (fuel total + expense total) |
| **Driver Pay (20%)** | Blue left-border | Cell `F9` | `=B25*B5` (total loads x pay rate) |
| **Total Net Pay** | Green left-border | Cell `G32` | `=A32-C32` (gross minus all deductions) |

The Net Pay card turns **red** if negative, **green** if positive.

### 3b. Quick Actions (3 clickable cards)

- **View Pay Stub** - navigates to the printable pay stub page
- **Manage Loads** - navigates to loads entry page
- **Export Report** - triggers browser print dialog for PDF export

**Design origin:** Mirrors `QuickActions.tsx` from haiti-event-pass with icon boxes, hover scale effect, and card layout.

### 3c. Expense Breakdown (horizontal bar chart)

**What it is:** A visual bar chart showing each expense category proportionally. Each bar's width is relative to the largest expense.

**Data source:** Combines all expenses (with Driver Pay auto-calculated) and fuel entries that have amounts > $0.

### 3d. Messages & Notes

**What it is:** A textarea for adding notes/messages for the pay period.

**Excel mapping:** Corresponds to row `A34` ("MESSAGES" section in the spreadsheet).

---

## 4. PAY STUB PAGE (Printable Document)

This is the **full pay stub** that mirrors the exact layout of the Excel spreadsheet. It is designed to be printer-friendly (elements marked `no-print` are hidden during printing).

### 4a. Company Header Banner

- Blue gradient banner showing **"SUNSHINE TRANS INC"** in large white text
- Maps to cell `A1` (merged across A1:H1, font size 36, blue background `#00B0F0`)

### 4b. Employee Information Grid (2 columns)

**Left column (Excel column A-B):**
| Field | Excel Cell | Input Source |
|-------|-----------|-------------|
| PAYEE NAME | A2/B2 | Settings page |
| PAYMENT DATE | A3/B3 | Settings page (the field you screenshotted) |
| PAYMENT METHOD | A4/B4 | Settings page dropdown |
| PAY RATE | A5/B5 | Settings page (stored as %, shown as "20%") |

**Right column (Excel column D-E):**
| Field | Excel Cell | Input Source |
|-------|-----------|-------------|
| TAX STATUS | D2/E2 | Settings dropdown (1099 or W-2) |
| ALLOWANCES | D3/E3 | Settings input |
| ADDITIONAL % | D4/E4 | Settings input |
| ADDITIONAL AMT | D5/E5 | Settings input |

### 4c. Four-Column Data Table

Maps to Excel rows 8-24 (the main data grid):

| Column | Excel Columns | Header Color | Content |
|--------|--------------|-------------|---------|
| **LOADS INFO** | A8-B24 | Gold `#FFC000` | Load names + amounts |
| **FUEL** | C8-D24 | Red `#EC3314` | Fuel entries + amounts |
| **EXPENSES** | E8-F24 | Red `#EC3314` | Expense names + amounts |
| **NET PAY** | G8-H24 | Yellow `#FFFF00` | Gross, deductions, and net |

### 4d. Summary Totals (3 teal boxes)

Maps to Excel rows 31-32 with the dark teal background (`#134F5C`):

| Box | Excel Cell | Formula |
|-----|-----------|---------|
| **Total Gross Pay** | A32 | `=B25` (sum of loads) |
| **Total Deductions** | C32 | `=D25+F25` (fuel + expenses) |
| **Total Net Pay** | G32 | `=A32-C32` (gross - deductions) |

### 4e. Time-Off Balances

Maps to Excel rows 27-29:
- Vacation (A28/B28), Personal Day (D28/G28)
- Sick Leave (A29/B29), Medical Leave (D29/G29)

---

## 5. LOADS & REVENUE PAGE

**What it is:** An editable table where you add, modify, or remove load entries.

**Excel mapping:** Rows 9-24, columns A-B. Each row is a load (e.g. "Well Logistics INC (NY-FL)" = $2,200).

**Interactions:**
- **Add Load** button: appends a new blank row
- Each row has an editable name field and amount field
- Red delete button removes a row
- **Total** at the bottom auto-calculates `=SUM(B9:B24)` in real-time
- Every change triggers full recalculation of all dependent formulas

---

## 6. EXPENSES & FUEL PAGE

**What it is:** Two side-by-side cards for managing fuel and expense deductions.

### 6a. Fuel Entries (left card, red header)

**Excel mapping:** Rows 9-21, columns C-D. The spreadsheet has "Fuel" labels in column C and amounts in column D.

**Interactions:**
- Add/edit/remove fuel entries
- Total auto-calculates `=SUM(D9:D24)`

### 6b. Expense Deductions (right card, red header)

**Excel mapping:** Rows 9-19, columns E-F. Predefined categories from the spreadsheet:

| Expense | Excel Cell | Editable? |
|---------|-----------|----------|
| **Driver** | F9 | NO - auto-calculated as `=B25*B5` (total loads x 20%) |
| Insurance | F10 | Yes (default: $1,500) |
| ELD Log | F11 | Yes (default: $150) |
| Oil Change | F12 | Yes (default: $900) |
| Trailer | F13 | Yes (default: $695) |
| Shower | F14 | Yes (default: $0) |
| Scale | F15 | Yes (default: $0) |
| Food | F16 | Yes (default: $0) |
| Toll | F17 | Yes (default: $0) |
| Tire | F18 | Yes (default: $0) |
| Maintenance | F19 | Yes (default: $0) |

**Key formula:** The "Driver" row is special - it's locked and auto-calculates using the same formula as Excel cell F9: `=B25*B5`. The field shows green background to indicate it's computed, not manual.

---

## 7. TIME OFF PAGE

**What it is:** Four input cards for tracking leave balances.

**Excel mapping:** Rows 27-29 of the spreadsheet:
- `A28/B28` = VACATION / 0
- `D28/G28` = PERSONAL DAY / 0
- `A29/B29` = SICK LEAVE / 0
- `D29/G29` = MEDICAL LEAVE / 0

**Interactions:**
- Edit any balance
- Click "Save Balances" to persist
- Values appear on the pay stub automatically

---

## 8. PAY HISTORY PAGE

**What it is:** A log of saved pay period snapshots. This feature does NOT exist in the original Excel - it's an enhancement.

**What it stores per entry:**
- Pay period dates
- Payee name
- Gross pay, deductions, and net pay
- Full data snapshot (loads, fuel, expenses, settings) for future reference
- Timestamp of when it was saved

**Interactions:**
- **"Save Current Period to History"** captures the current state
- Each entry shows period, payee, gross/net amounts
- Delete button to remove old entries
- All data persists in localStorage

---

## 9. EMAIL SUMMARY PAGE

**What it is:** A pre-formatted email composer that generates a plain-text pay stub summary. This does NOT exist in the original Excel - it's an enhancement.

### 9a. Compose Panel (left)

| Field | Source |
|-------|--------|
| Recipient Email | Settings default or manual entry |
| CC | Settings default or manual entry |
| Subject | Auto-generated: "Pay Stub - [Name] - [Period]" |
| Message Body | Auto-generated formatted text with all pay data |

### 9b. Preview Panel (right)

Shows the exact email text that will be sent, formatted as a monospace pay stub report.

### 9c. Email Providers

Configured in Settings. Three options:
- **Default Mail Client** (mailto: link)
- **Gmail** (opens Gmail compose in browser)
- **Outlook** (opens Outlook web compose)

The "Send" button opens the selected provider with all fields pre-filled.

---

## 10. SETTINGS PAGE

**What it is:** Configuration center for all payroll parameters. Every field here feeds into the formulas and pay stub display.

### 10a. Employee Information

| Setting | Excel Origin | Effect |
|---------|-------------|--------|
| Payee Name | B2 | Appears on pay stub, header, email |
| Payment Date / Period | B3 | **This is the field in your screenshot** - sets the pay period range shown everywhere |
| Payment Method | B4 | Dropdown: Monthly, Bi-Weekly, Weekly, Per Load |
| Pay Rate (%) | B5 | **Critical** - drives the Driver Pay formula (`loads * rate`) |

### 10b. Tax & Additional Pay

| Setting | Excel Origin | Effect |
|---------|-------------|--------|
| Tax Status | D2/E2 | 1099 or W-2 badge |
| Allowances | D3/E3 | Stored for pay stub display |
| Additional % | D4/E4 | Stored for pay stub display |
| Additional Amount | D5/E5 | Stored for pay stub display |

### 10c. Company Information

Company name, email, phone - shown on pay stub header and email footer.

### 10d. Email Configuration

Default recipient, CC email, and email provider preference.

### 10e. Actions

- **Save All Settings** - persists everything to localStorage
- **Reset All Data** - clears localStorage and reloads with Excel defaults (requires confirmation)

---

## Formula Chain (How Calculations Flow)

```
User edits loads/expenses/fuel/settings
        |
        v
    recalcAll() fires
        |
        +---> getLoadsTotal()     = SUM of all load amounts        [=SUM(B9:B24)]
        +---> getDriverPay()      = loadsTotal * (payRate / 100)   [=B25*B5]
        +---> getFuelTotal()      = SUM of all fuel amounts        [=SUM(D9:D24)]
        +---> getExpensesTotal()  = SUM of expenses (driver=calc)  [=SUM(F9:F23)]
        +---> getTotalDeductions()= fuelTotal + expensesTotal      [=D25+F25]
        +---> getGrossPay()       = loadsTotal                     [=B25]
        +---> getNetPay()         = grossPay - totalDeductions     [=A32-C32]
        |
        v
    All UI elements update simultaneously
    Data auto-saves to localStorage
```

---

## Data Persistence

All data is stored in `localStorage` under the key `sunshine_payroll`. The state object contains:

```
{
  loads: [{ name, amount }],
  fuel: [{ name, amount }],
  expenses: [{ name, amount, isDriverPay? }],
  timeOff: { vacation, personal, sick, medical },
  settings: { payeeName, paymentDate, paymentMethod, payRate, ... },
  history: [{ period, payee, gross, net, savedAt, snapshot }],
  messages: ""
}
```

Survives browser refreshes. "Reset All Data" clears it and restores Excel defaults.
