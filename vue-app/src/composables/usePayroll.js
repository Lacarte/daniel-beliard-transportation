import { reactive, computed, watch } from 'vue'

const DEFAULT_EXPENSE_TEMPLATE = [
  { name: 'Driver', amount: 0.00, isDriverPay: true },
  { name: 'Insurance', amount: 1500.00 },
  { name: 'ELD Log', amount: 150.00 },
  { name: 'Oil Change', amount: 900.00 },
  { name: 'Trailer', amount: 695.00 },
  { name: 'Shower', amount: 0.00 },
  { name: 'Scale', amount: 0.00 },
  { name: 'Food', amount: 0.00 },
  { name: 'Toll', amount: 0.00 },
  { name: 'Tire', amount: 0.00 },
  { name: 'Maintenance', amount: 0.00 },
]

function generateId() {
  const d = new Date()
  const date = d.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `SUN-${date}-${rand}`
}

function getDefaultState() {
  return {
    managedLoads: [],
    settings: {
      payeeName: 'Daniel Beliard',
      paymentDate: '06/01/24-06/30/24',
      paymentMethod: 'Monthly',
      payRate: 20,
      taxStatus: '1099',
      allowances: 0,
      additionalPct: 0,
      additionalAmt: 0,
      companyName: 'SUNSHINE TRANS INC',
      companyEmail: '',
      companyPhone: '',
      defaultEmail: '',
      ccEmail: '',
      emailProvider: 'mailto',
      expenseTemplate: JSON.parse(JSON.stringify(DEFAULT_EXPENSE_TEMPLATE)),
    },
    history: [],
    messages: '',
  }
}

function migrateOldData(parsed) {
  // Auto-migrate old flat loads/expenses/fuel into managedLoads
  if (parsed.loads && parsed.loads.length && (!parsed.managedLoads || !parsed.managedLoads.length)) {
    const fuel = parsed.fuel || []
    const expenses = parsed.expenses || JSON.parse(JSON.stringify(DEFAULT_EXPENSE_TEMPLATE))
    const s = parsed.settings || {}
    parsed.managedLoads = parsed.loads.map(l => {
      const amount = parseFloat(l.amount) || 0
      const rate = s.payRate || 20
      const dp = amount * (rate / 100)
      const ft = fuel.reduce((sum, f) => sum + (parseFloat(f.amount) || 0), 0)
      const et = expenses.reduce((sum, e) => e.isDriverPay ? sum + dp : sum + (parseFloat(e.amount) || 0), 0)
      return {
        id: generateId(),
        name: l.name || 'Untitled',
        amount,
        loadDate: new Date().toISOString().slice(0, 10),
        deliveryDate: '',
        status: 'delivered',
        driverName: s.payeeName || '',
        payRate: rate,
        payMethod: s.paymentMethod || 'Monthly',
        taxStatus: s.taxStatus || '1099',
        fuel: JSON.parse(JSON.stringify(fuel)),
        expenses: JSON.parse(JSON.stringify(expenses)),
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })
    delete parsed.loads
    delete parsed.fuel
    delete parsed.expenses
  }
  return parsed
}

function loadState() {
  try {
    const saved = localStorage.getItem('sunshine_payroll')
    if (saved) {
      let parsed = JSON.parse(saved)
      parsed = migrateOldData(parsed)
      const def = getDefaultState()
      return { ...def, ...parsed, settings: { ...def.settings, ...(parsed.settings || {}) } }
    }
  } catch (e) { /* ignore */ }
  return getDefaultState()
}

const state = reactive(loadState())

watch(state, () => {
  localStorage.setItem('sunshine_payroll', JSON.stringify(state))
}, { deep: true })

// ========== PER-LOAD CALCULATIONS ==========
function calcLoad(l) {
  const amount = parseFloat(l.amount) || 0
  const rate = parseFloat(l.payRate) || 0
  const dp = amount * (rate / 100)
  const ft = (l.fuel || []).reduce((s, f) => s + (parseFloat(f.amount) || 0), 0)
  const et = (l.expenses || []).reduce((s, e) => {
    if (e.isDriverPay) return s + dp
    return s + (parseFloat(e.amount) || 0)
  }, 0)
  return { gross: amount, driverPay: dp, fuelTotal: ft, expensesTotal: et, totalDeductions: ft + et, netPay: amount - (ft + et) }
}

// ========== FILTERED LOADS ==========
function getFilteredLoads(filters = {}) {
  return state.managedLoads.filter(l => {
    if (filters.status && l.status !== filters.status) return false
    if (filters.driver && l.driverName !== filters.driver) return false
    if (filters.dateStart && l.loadDate < filters.dateStart) return false
    if (filters.dateEnd && l.loadDate > filters.dateEnd) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (!(l.name || '').toLowerCase().includes(q) && !(l.driverName || '').toLowerCase().includes(q) && !(l.id || '').toLowerCase().includes(q)) return false
    }
    return true
  })
}

function getAggregates(filters = {}) {
  const loads = getFilteredLoads(filters)
  let totalGross = 0, totalFuel = 0, totalExpenses = 0
  loads.forEach(l => {
    const c = calcLoad(l)
    totalGross += c.gross
    totalFuel += c.fuelTotal
    totalExpenses += c.expensesTotal
  })
  const totalDeductions = totalFuel + totalExpenses
  return { count: loads.length, totalGross, totalFuel, totalExpenses, totalDeductions, netPay: totalGross - totalDeductions }
}

// ========== PERIOD HELPERS ==========
function getPeriodDates(period) {
  const now = new Date()
  const y = now.getFullYear(), m = now.getMonth(), d = now.getDate()
  const toISO = dt => dt.toISOString().slice(0, 10)
  if (period === 'week') {
    const day = now.getDay()
    const start = new Date(y, m, d - (day === 0 ? 6 : day - 1))
    const end = new Date(start); end.setDate(start.getDate() + 6)
    return { dateStart: toISO(start), dateEnd: toISO(end) }
  }
  if (period === 'month') return { dateStart: toISO(new Date(y, m, 1)), dateEnd: toISO(new Date(y, m + 1, 0)) }
  if (period === 'year') return { dateStart: `${y}-01-01`, dateEnd: `${y}-12-31` }
  return {}
}

// ========== LOAD CRUD ==========
function createLoad(data = {}) {
  const s = state.settings
  const load = {
    id: generateId(),
    name: data.name || '',
    amount: data.amount || 0,
    loadDate: data.loadDate || new Date().toISOString().slice(0, 10),
    deliveryDate: data.deliveryDate || '',
    status: 'pending',
    driverName: data.driverName || s.payeeName || '',
    payRate: data.payRate ?? s.payRate ?? 20,
    payMethod: data.payMethod || s.paymentMethod || 'Monthly',
    taxStatus: data.taxStatus || s.taxStatus || '1099',
    fuel: data.fuel || [],
    expenses: data.expenses || JSON.parse(JSON.stringify(s.expenseTemplate || DEFAULT_EXPENSE_TEMPLATE)),
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  state.managedLoads.unshift(load)
  return load
}

function updateLoad(index, data) {
  if (index < 0 || index >= state.managedLoads.length) return
  Object.assign(state.managedLoads[index], data, { updatedAt: new Date().toISOString() })
}

function deleteLoad(index) {
  if (index < 0 || index >= state.managedLoads.length) return
  state.managedLoads.splice(index, 1)
}

// ========== HISTORY ==========
function saveToHistory(periodLabel) {
  const agg = getAggregates()
  state.history.unshift({
    period: periodLabel || state.settings.paymentDate,
    payee: state.settings.payeeName,
    gross: agg.totalGross,
    deductions: agg.totalDeductions,
    net: agg.netPay,
    loadCount: agg.count,
    savedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    snapshot: JSON.parse(JSON.stringify(state.managedLoads)),
  })
}
function removeHistory(i) { state.history.splice(i, 1) }

// ========== UTILS ==========
function fmt(n) {
  const abs = Math.abs(n)
  const str = '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return n < 0 ? '-' + str : str
}

function resetAll() {
  localStorage.clear()
  Object.assign(state, getDefaultState())
}

// Unique drivers
const drivers = computed(() => [...new Set(state.managedLoads.map(l => l.driverName).filter(Boolean))])

// Status options
const STATUSES = ['pending', 'in-transit', 'delivered', 'paid', 'cancelled']
const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', dark: 'bg-yellow-900/20 text-yellow-400' },
  'in-transit': { bg: 'bg-blue-100', text: 'text-blue-700', dark: 'bg-blue-900/20 text-blue-400' },
  delivered: { bg: 'bg-purple-100', text: 'text-purple-700', dark: 'bg-purple-900/20 text-purple-400' },
  paid: { bg: 'bg-green-100', text: 'text-green-700', dark: 'bg-green-900/20 text-green-400' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', dark: 'bg-red-900/20 text-red-400' },
}

// Alerts
const alerts = computed(() => {
  const items = []
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const cutoff = sevenDaysAgo.toISOString().slice(0, 10)
  state.managedLoads.forEach(l => {
    if (l.status === 'delivered' && l.loadDate && l.loadDate < cutoff) {
      items.push({ type: 'warning', msg: `"${l.name}" delivered but not paid (${l.loadDate})`, loadId: l.id })
    }
    const c = calcLoad(l)
    if (c.netPay < 0) items.push({ type: 'danger', msg: `"${l.name}" has negative net pay (${fmt(c.netPay)})`, loadId: l.id })
    if (!l.driverName) items.push({ type: 'info', msg: `"${l.name}" is missing driver name`, loadId: l.id })
  })
  return items
})

export function usePayroll() {
  return {
    state, drivers, alerts,
    STATUSES, STATUS_COLORS,
    calcLoad, getFilteredLoads, getAggregates, getPeriodDates,
    createLoad, updateLoad, deleteLoad,
    saveToHistory, removeHistory,
    fmt, resetAll, generateId,
    DEFAULT_EXPENSE_TEMPLATE,
  }
}
