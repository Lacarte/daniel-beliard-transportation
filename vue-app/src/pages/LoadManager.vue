<template>
  <div class="fade-in">
    <!-- LIST VIEW -->
    <template v-if="!editing">
      <!-- Title + Create -->
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl sm:text-2xl font-extrabold text-gray-900">Load Manager</h2>
        <button class="btn btn-primary text-xs sm:text-sm rounded-full px-5" @click="startCreate()">+ New Load</button>
      </div>

      <!-- Period toggles + filters in one compact bar -->
      <div class="card mb-3">
        <div class="p-2.5 sm:p-3">
          <!-- Period buttons top row -->
          <div class="flex items-center gap-1.5 mb-2">
            <button v-for="p in periods" :key="p.key" :class="['px-4 py-1.5 rounded-full text-xs font-bold transition-all', period === p.key ? 'bg-blue-900 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50 shadow-sm']" @click="period = p.key">{{ p.label }}</button>
            <div class="flex-1"></div>
            <!-- Collapse filter toggle on mobile -->
            <button class="sm:hidden text-xs text-gray-500 flex items-center gap-1" @click="showFilters = !showFilters">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filter
            </button>
          </div>
          <!-- Filter row: always on desktop, toggleable on mobile -->
          <div :class="['flex flex-wrap gap-2', showFilters ? '' : 'hidden sm:flex']">
            <input type="text" v-model="search" placeholder="Search..." class="flex-1 min-w-[120px] max-w-[200px] text-xs sm:text-sm py-1.5"/>
            <select v-model="filterStatus" class="text-xs sm:text-sm py-1.5 w-auto min-w-[100px]">
              <option value="">All Status</option>
              <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
            </select>
            <select v-model="filterDriver" class="text-xs sm:text-sm py-1.5 w-auto min-w-[100px]">
              <option value="">All Drivers</option>
              <option v-for="d in drivers" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Period Summary -->
      <div class="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
        <div class="rounded-2xl p-2.5 sm:p-3 text-center bg-white shadow-sm">
          <div class="text-[0.55rem] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Loads</div>
          <div class="text-xl sm:text-2xl font-extrabold text-gray-900 mt-0.5">{{ agg.count }}</div>
        </div>
        <div class="rounded-2xl p-2.5 sm:p-3 text-center bg-white shadow-sm">
          <div class="text-[0.55rem] sm:text-xs font-bold text-emerald-500 uppercase tracking-wider">Gross</div>
          <div class="text-sm sm:text-xl font-extrabold text-emerald-700 mt-0.5">{{ fmt(agg.totalGross) }}</div>
        </div>
        <div class="rounded-2xl p-2.5 sm:p-3 text-center bg-white shadow-sm">
          <div class="text-[0.55rem] sm:text-xs font-bold text-red-400 uppercase tracking-wider">Deduct.</div>
          <div class="text-sm sm:text-xl font-extrabold text-red-600 mt-0.5">{{ fmt(agg.totalDeductions) }}</div>
        </div>
        <div class="rounded-2xl p-2.5 sm:p-3 text-center shadow-sm" :class="agg.netPay >= 0 ? 'bg-blue-900' : 'bg-red-600'">
          <div class="text-[0.55rem] sm:text-xs font-bold text-white/60 uppercase tracking-wider">Net</div>
          <div class="text-sm sm:text-xl font-extrabold text-white mt-0.5">{{ fmt(agg.netPay) }}</div>
        </div>
      </div>

      <!-- Load List -->
      <div class="sm:card">
        <div class="sm:card-body sm:p-4">
          <!-- Desktop Header -->
          <div class="hidden md:grid font-bold text-xs uppercase tracking-wider text-gray-500" style="grid-template-columns:2fr 1fr 80px 90px 90px 90px 110px; gap:0.75rem; padding:0.65rem 1rem; border-bottom:2px solid #e5e7eb;">
            <span>Load</span><span>Driver</span><span>Status</span><span class="text-right">Gross</span><span class="text-right">Deductions</span><span class="text-right">Net</span><span class="text-center">Actions</span>
          </div>

          <div v-if="!filtered.length" class="text-center py-12 text-gray-400">
            <svg width="48" height="48" class="mx-auto mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <p class="text-lg font-semibold">No loads found</p>
            <p class="text-sm">{{ state.managedLoads.length ? 'Try adjusting your filters' : 'Click "Create New Load" to get started' }}</p>
          </div>

          <div v-for="(l, i) in filtered" :key="l.id">
            <!-- Desktop Row -->
            <div class="hidden md:grid items-center hover:bg-gray-50 transition-colors" style="grid-template-columns:2fr 1fr 80px 90px 90px 90px 110px; gap:0.75rem; padding:0.75rem 1rem; border-bottom:1px solid #f3f4f6;">
              <div>
                <div class="font-bold text-sm text-gray-900">{{ l.name || 'Untitled' }}</div>
                <div class="text-xs text-gray-500">{{ l.id }} &middot; {{ l.loadDate }}</div>
              </div>
              <div class="text-sm text-gray-700">{{ l.driverName || '-' }}</div>
              <div><span :class="['badge text-xs', statusClass(l.status)]">{{ l.status }}</span></div>
              <div class="text-right font-semibold text-sm">{{ fmt(calcLoad(l).gross) }}</div>
              <div class="text-right font-semibold text-sm text-red-600">{{ fmt(calcLoad(l).totalDeductions) }}</div>
              <div class="text-right font-semibold text-sm" :style="{color: calcLoad(l).netPay >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(calcLoad(l).netPay) }}</div>
              <div class="flex gap-1.5 justify-center">
                <button class="btn btn-outline text-xs py-1 px-2" @click="exportInvoice(l)" title="Invoice">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </button>
                <button class="btn btn-outline text-xs py-1 px-2" @click="startEdit(findIndex(l))">Edit</button>
                <button class="btn btn-danger text-xs py-1 px-2" @click="doDelete(findIndex(l))">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                </button>
              </div>
            </div>

            <!-- Mobile Card -->
            <div class="md:hidden mb-3 rounded-2xl overflow-hidden" style="background:#fff; box-shadow:0 2px 12px rgba(0,0,0,.05);">
              <!-- Status accent bar -->
              <div class="h-1.5" :style="{background: 'linear-gradient(90deg, ' + statusBorderColor(l.status) + ', transparent)'}"></div>
              <!-- Content -->
              <div class="px-4 pt-3 pb-2.5">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1 min-w-0 mr-3">
                    <div class="font-extrabold text-[0.95rem] text-gray-900 leading-snug">{{ l.name || 'Untitled' }}</div>
                    <div class="flex items-center gap-2 mt-1 text-[0.7rem] text-gray-400 font-medium">
                      <span class="flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {{ l.driverName || '-' }}
                      </span>
                      <span>&middot;</span>
                      <span>{{ l.loadDate }}</span>
                    </div>
                  </div>
                  <span :class="['px-2.5 py-1 rounded-full text-[0.6rem] font-bold whitespace-nowrap flex-shrink-0', statusClass(l.status)]">{{ l.status }}</span>
                </div>
              </div>
              <!-- Stats -->
              <div class="grid grid-cols-3 mx-4 mb-3 rounded-xl overflow-hidden" style="box-shadow:inset 0 0 0 1px rgba(0,0,0,.04);">
                <div class="py-2.5 text-center bg-emerald-50/60">
                  <div class="text-[0.55rem] font-bold uppercase text-gray-400 tracking-wider">Gross</div>
                  <div class="font-extrabold text-[0.9rem] text-emerald-700">{{ fmt(calcLoad(l).gross) }}</div>
                </div>
                <div class="py-2.5 text-center bg-red-50/60">
                  <div class="text-[0.55rem] font-bold uppercase text-gray-400 tracking-wider">Deduct.</div>
                  <div class="font-extrabold text-[0.9rem] text-red-600">{{ fmt(calcLoad(l).totalDeductions) }}</div>
                </div>
                <div class="py-2.5 text-center" :class="calcLoad(l).netPay >= 0 ? 'bg-blue-50/60' : 'bg-red-50/60'">
                  <div class="text-[0.55rem] font-bold uppercase text-gray-400 tracking-wider">Net</div>
                  <div class="font-extrabold text-[0.9rem]" :style="{color: calcLoad(l).netPay >= 0 ? '#1e3a8a' : '#dc2626'}">{{ fmt(calcLoad(l).netPay) }}</div>
                </div>
              </div>
              <!-- Action bar -->
              <div class="flex border-t border-gray-100">
                <button class="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[0.7rem] font-bold text-blue-600 active:bg-blue-50 transition-colors" @click="exportInvoice(l)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Invoice
                </button>
                <div class="w-px bg-gray-100"></div>
                <button class="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[0.7rem] font-bold text-gray-600 active:bg-gray-50 transition-colors" @click="startEdit(findIndex(l))">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>
                <div class="w-px bg-gray-100"></div>
                <button class="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-[0.7rem] font-bold text-red-500 active:bg-red-50 transition-colors" @click="doDelete(findIndex(l))">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- EDIT VIEW -->
    <template v-else>
      <div class="flex items-center gap-3 mb-4">
        <button class="btn btn-outline" @click="editing = false">&#8592; Back</button>
        <h2 class="text-2xl font-bold text-gray-900">{{ editIndex < 0 ? 'Create New Load' : 'Edit Load' }}</h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div class="card"><div class="card-header">Load Information</div><div class="card-body space-y-3">
          <div class="field-group"><div class="label">Load Name / Route</div><input type="text" v-model="form.name" placeholder="e.g. Well Logistics INC (NY-FL)"/></div>
          <div class="field-group"><div class="label">Load Amount ($)</div><input type="number" v-model.number="form.amount" min="0" step="0.01" placeholder="0.00"/></div>
          <div class="grid grid-cols-2 gap-3">
            <div class="field-group"><div class="label">Load Date</div><input type="date" v-model="form.loadDate"/></div>
            <div class="field-group"><div class="label">Delivery Date</div><input type="date" v-model="form.deliveryDate"/></div>
          </div>
          <div class="field-group"><div class="label">Status</div><select v-model="form.status"><option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option></select></div>
          <div class="field-group"><div class="label">Notes</div><textarea v-model="form.notes" rows="2" placeholder="Dispatch notes, broker info..."></textarea></div>
        </div></div>

        <div class="card"><div class="card-header">Driver & Pay</div><div class="card-body space-y-3">
          <div class="field-group"><div class="label">Driver Name</div><input type="text" v-model="form.driverName"/></div>
          <div class="field-group"><div class="label">Pay Rate (%)</div><input type="number" v-model.number="form.payRate" min="0" max="100"/></div>
          <div class="field-group"><div class="label">Payment Method</div><select v-model="form.payMethod"><option>Monthly</option><option>Bi-Weekly</option><option>Weekly</option><option>Per Load</option></select></div>
          <div class="field-group"><div class="label">Tax Status</div><select v-model="form.taxStatus"><option value="1099">1099</option><option value="W-2">W-2</option></select></div>
        </div></div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <!-- Fuel -->
        <div class="card"><div class="card-header" style="background:#dc2626; color:#fff; border-radius:0.75rem 0.75rem 0 0;">Fuel Entries</div><div class="card-body">
          <div v-for="(f, i) in form.fuel" :key="i" class="expense-row">
            <input type="text" v-model="f.name" placeholder="Fuel stop"/>
            <div class="flex gap-1"><input type="number" v-model.number="f.amount" min="0" step="0.01" placeholder="0.00" class="text-right"/><button class="btn btn-danger text-xs py-1 px-1.5" @click="form.fuel.splice(i, 1)">&times;</button></div>
          </div>
          <button class="btn btn-outline mt-2 w-full justify-center text-sm" @click="form.fuel.push({name:'Fuel',amount:0})">+ Add Fuel</button>
          <div class="flex justify-between mt-3 pt-3 border-t font-bold text-sm"><span>Total Fuel</span><span class="text-red-600">{{ fmt(formCalc.fuelTotal) }}</span></div>
        </div></div>
        <!-- Expenses -->
        <div class="card"><div class="card-header" style="background:#dc2626; color:#fff; border-radius:0.75rem 0.75rem 0 0;">Expenses</div><div class="card-body">
          <div v-for="(e, i) in form.expenses" :key="i" class="expense-row">
            <input type="text" v-model="e.name" :disabled="e.isDriverPay" :style="e.isDriverPay ? 'background:#f0fdf4' : ''"/>
            <div class="flex gap-1">
              <input v-if="e.isDriverPay" type="text" :value="fmt(formCalc.driverPay)" disabled class="text-right bg-green-50 font-semibold text-green-700"/>
              <input v-else type="number" v-model.number="e.amount" min="0" step="0.01" placeholder="0.00" class="text-right"/>
              <button v-if="!e.isDriverPay" class="btn btn-danger text-xs py-1 px-1.5" @click="form.expenses.splice(i,1)">&times;</button>
              <div v-else style="width:30px"></div>
            </div>
          </div>
          <button class="btn btn-outline mt-2 w-full justify-center text-sm" @click="form.expenses.push({name:'',amount:0})">+ Add Expense</button>
          <div class="flex justify-between mt-3 pt-3 border-t font-bold text-sm"><span>Total Expenses</span><span class="text-red-600">{{ fmt(formCalc.expensesTotal) }}</span></div>
        </div></div>
      </div>

      <!-- Summary -->
      <div class="card mb-4" style="border-color:#1e3a8a;">
        <div class="card-header">Summary</div>
        <div class="card-body">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="rounded-lg text-center p-3 bg-amber-50"><div class="label">Load Amount</div><div class="text-xl font-bold text-amber-700">{{ fmt(formCalc.gross) }}</div></div>
            <div class="rounded-lg text-center p-3 bg-blue-50"><div class="label">Driver Pay</div><div class="text-xl font-bold text-blue-700">{{ fmt(formCalc.driverPay) }}</div></div>
            <div class="rounded-lg text-center p-3 bg-red-50"><div class="label">Total Deductions</div><div class="text-xl font-bold text-red-600">{{ fmt(formCalc.totalDeductions) }}</div></div>
            <div :class="formCalc.netPay >= 0 ? 'bg-green-50' : 'bg-red-50'" class="rounded-lg text-center p-3"><div class="label">Net Pay</div><div class="text-xl font-bold" :style="{color: formCalc.netPay >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(formCalc.netPay) }}</div></div>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <button class="btn btn-gold" @click="saveForm()">{{ editIndex < 0 ? 'Save Load' : 'Update Load' }}</button>
        <button class="btn btn-outline" @click="editing = false">Cancel</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePayroll } from '../composables/usePayroll'
import { useToast } from '../composables/useToast'

const { state, drivers, STATUSES, STATUS_COLORS, calcLoad, getFilteredLoads, getAggregates, getPeriodDates, createLoad, updateLoad, deleteLoad, fmt, DEFAULT_EXPENSE_TEMPLATE } = usePayroll()
const { showToast } = useToast()

// Filters
const search = ref('')
const showFilters = ref(false)
const filterStatus = ref('')
const filterDriver = ref('')
const period = ref('all')
const periods = [{ key: 'week', label: 'Week' }, { key: 'month', label: 'Month' }, { key: 'year', label: 'Year' }, { key: 'all', label: 'All' }]

const filters = computed(() => {
  const f = { search: search.value, status: filterStatus.value || undefined, driver: filterDriver.value || undefined }
  if (period.value !== 'all') Object.assign(f, getPeriodDates(period.value))
  return f
})
const filtered = computed(() => getFilteredLoads(filters.value))
const agg = computed(() => getAggregates(filters.value))

function statusClass(s) { return STATUS_COLORS[s] ? `${STATUS_COLORS[s].bg} ${STATUS_COLORS[s].text}` : 'bg-gray-100 text-gray-600' }
const STATUS_BORDER = { pending:'#eab308', 'in-transit':'#3b82f6', delivered:'#8b5cf6', paid:'#16a34a', cancelled:'#dc2626' }
function statusBorderColor(s) { return STATUS_BORDER[s] || '#d1d5db' }
function findIndex(l) { return state.managedLoads.indexOf(l) }

// Edit
const editing = ref(false)
const editIndex = ref(-1)
const form = ref({})

const formCalc = computed(() => calcLoad(form.value))

function startCreate() {
  editIndex.value = -1
  form.value = {
    name: '', amount: 0, loadDate: new Date().toISOString().slice(0, 10), deliveryDate: '', status: 'pending',
    driverName: state.settings.payeeName || '', payRate: state.settings.payRate || 20,
    payMethod: state.settings.paymentMethod || 'Monthly', taxStatus: state.settings.taxStatus || '1099',
    fuel: [], expenses: JSON.parse(JSON.stringify(state.settings.expenseTemplate || DEFAULT_EXPENSE_TEMPLATE)), notes: '',
  }
  editing.value = true
}

function startEdit(i) {
  editIndex.value = i
  form.value = JSON.parse(JSON.stringify(state.managedLoads[i]))
  editing.value = true
}

function saveForm() {
  if (!form.value.name?.trim()) { showToast('Enter a load name', 'error'); return }
  if (editIndex.value >= 0) {
    updateLoad(editIndex.value, form.value)
    showToast('Load updated', 'success')
  } else {
    createLoad(form.value)
    showToast('Load created', 'success')
  }
  editing.value = false
}

function doDelete(i) {
  if (!confirm('Delete this load?')) return
  deleteLoad(i)
  showToast('Load deleted', 'info')
}

function exportInvoice(l) {
  const c = calcLoad(l)
  const s = state.settings
  const w = window.open('', '_blank')
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice - ${l.name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#fff;color:#1a1a1a;padding:20px;max-width:800px;margin:0 auto}
.header{text-align:center;padding:24px;background:linear-gradient(135deg,#1e3a8a,#2563eb);border-radius:12px;margin-bottom:24px}
.header h1{color:#fff;font-size:1.5rem;font-weight:800;letter-spacing:0.05em}
.header p{color:rgba(255,255,255,.7);font-size:0.8rem;margin-top:4px}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
.meta-card{padding:12px 16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0}
.meta-card .lbl{font-size:0.65rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em}
.meta-card .val{font-size:0.95rem;font-weight:600;color:#1e293b;margin-top:2px}
table{width:100%;border-collapse:collapse;margin-bottom:20px}
th{background:#f1f5f9;padding:8px 12px;text-align:left;font-size:0.7rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;border-bottom:2px solid #e2e8f0}
td{padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:0.85rem}
td.amt{text-align:right;font-weight:600;font-family:'Courier New',monospace}
.totals{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:24px}
.total-box{text-align:center;padding:16px;border-radius:10px}
.total-box .lbl{font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px}
.total-box .val{font-size:1.3rem;font-weight:800}
.gross-box{background:#fef3c7;border:1px solid #fde68a}.gross-box .lbl{color:#92400e}.gross-box .val{color:#92400e}
.ded-box{background:#fee2e2;border:1px solid #fca5a5}.ded-box .lbl{color:#991b1b}.ded-box .val{color:#dc2626}
.net-box{background:${c.netPay>=0?'#dcfce7;border:1px solid #86efac':'#fee2e2;border:1px solid #fca5a5'}}.net-box .lbl{color:${c.netPay>=0?'#166534':'#991b1b'}}.net-box .val{color:${c.netPay>=0?'#16a34a':'#dc2626'}}
.footer{margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;color:#94a3b8;font-size:0.7rem}
.print-btn{position:fixed;bottom:20px;right:20px;background:#1e3a8a;color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:0.9rem;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,.2)}
@media print{.print-btn{display:none}}
@media(max-width:600px){.meta{grid-template-columns:1fr}.totals{grid-template-columns:1fr}}
</style></head><body>
<div class="header">
  <h1>${s.companyName}</h1>
  <p>Load Invoice</p>
</div>
<div class="meta">
  <div class="meta-card"><div class="lbl">Invoice ID</div><div class="val">${l.id||'N/A'}</div></div>
  <div class="meta-card"><div class="lbl">Date</div><div class="val">${l.loadDate||'N/A'}</div></div>
  <div class="meta-card"><div class="lbl">Load / Route</div><div class="val">${l.name}</div></div>
  <div class="meta-card"><div class="lbl">Driver</div><div class="val">${l.driverName||'-'}</div></div>
  <div class="meta-card"><div class="lbl">Pay Rate</div><div class="val">${l.payRate}%</div></div>
  <div class="meta-card"><div class="lbl">Payment Method</div><div class="val">${l.payMethod||'Monthly'}</div></div>
  <div class="meta-card"><div class="lbl">Tax Status</div><div class="val">${l.taxStatus||'1099'}</div></div>
  <div class="meta-card"><div class="lbl">Status</div><div class="val" style="text-transform:capitalize">${l.status||'pending'}</div></div>
</div>
${l.fuel&&l.fuel.length?`<h3 style="font-size:0.85rem;font-weight:700;margin-bottom:8px;color:#dc2626">Fuel Deductions</h3>
<table><tr><th>Description</th><th style="text-align:right">Amount</th></tr>
${l.fuel.map(f=>`<tr><td>${f.name}</td><td class="amt">${fmt(f.amount)}</td></tr>`).join('')}
<tr style="border-top:2px solid #fca5a5"><td><strong>Total Fuel</strong></td><td class="amt" style="color:#dc2626"><strong>${fmt(c.fuelTotal)}</strong></td></tr>
</table>`:''}
<h3 style="font-size:0.85rem;font-weight:700;margin-bottom:8px;color:#dc2626">Expense Deductions</h3>
<table><tr><th>Description</th><th style="text-align:right">Amount</th></tr>
${(l.expenses||[]).map(e=>`<tr><td>${e.name}${e.isDriverPay?' (calculated)':''}</td><td class="amt">${fmt(e.isDriverPay?c.driverPay:e.amount)}</td></tr>`).join('')}
<tr style="border-top:2px solid #fca5a5"><td><strong>Total Expenses</strong></td><td class="amt" style="color:#dc2626"><strong>${fmt(c.expensesTotal)}</strong></td></tr>
</table>
<div class="totals">
  <div class="total-box gross-box"><div class="lbl">Gross Pay</div><div class="val">${fmt(c.gross)}</div></div>
  <div class="total-box ded-box"><div class="lbl">Total Deductions</div><div class="val">${fmt(c.totalDeductions)}</div></div>
  <div class="total-box net-box"><div class="lbl">Net Pay</div><div class="val">${fmt(c.netPay)}</div></div>
</div>
${l.notes?`<div style="margin-top:20px;padding:12px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0"><div style="font-size:0.65rem;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:4px">Notes</div><div style="font-size:0.85rem;color:#475569">${l.notes}</div></div>`:''}
<div class="footer">Generated on ${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})} &middot; ${s.companyName}</div>
<button class="print-btn" onclick="window.print()">Print / Save PDF</button>
</body></html>`)
  w.document.close()
  showToast('Invoice opened', 'success')
}
</script>
