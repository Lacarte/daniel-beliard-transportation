import { reactive, computed, watch, ref } from 'vue'
import { supabase } from '../lib/supabase'

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
      payeeName: '',
      paymentDate: '',
      paymentMethod: 'Monthly',
      payRate: 20,
      factoringRate: 2.5,
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

const state = reactive(getDefaultState())
const syncing = ref(false)
const dbReady = ref(false)
let settingsId = null
let skipWatch = false
let currentUserId = null

// ========== AUTH HELPER ==========
function getUserId() {
  return currentUserId
}

// ========== SUPABASE HELPERS ==========

function dbLoadToApp(row, fuelRows, expenseRows) {
  return {
    id: row.id,
    loadNumber: row.load_number || '',
    name: row.name || '',
    amount: parseFloat(row.amount) || 0,
    loadDate: row.load_date || '',
    deliveryDate: row.delivery_date || '',
    status: row.status || 'pending',
    driverName: row.driver_name || '',
    payRate: parseFloat(row.pay_rate) || 20,
    factoringRate: parseFloat(row.factoring_rate) || 2.5,
    payMethod: row.pay_method || 'Monthly',
    taxStatus: row.tax_status || '1099',
    notes: row.notes || '',
    fuel: fuelRows.map(f => ({
      name: f.name || '',
      miles: parseFloat(f.miles) || 0,
      pricePerGallon: parseFloat(f.price_per_gallon) || 0,
      amount: parseFloat(f.amount) || 0,
    })),
    expenses: expenseRows.map(e => ({
      name: e.name || '',
      amount: parseFloat(e.amount) || 0,
      isDriverPay: e.is_driver_pay || false,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function dbSettingsToApp(row) {
  return {
    payeeName: row.payee_name || '',
    companyName: row.company_name || '',
    companyEmail: row.company_email || '',
    companyPhone: row.company_phone || '',
    paymentDate: row.payment_date || '',
    paymentMethod: row.payment_method || 'Monthly',
    payRate: parseFloat(row.pay_rate) || 20,
    factoringRate: parseFloat(row.factoring_rate) || 2.5,
    taxStatus: row.tax_status || '1099',
    allowances: row.allowances || 0,
    additionalPct: parseFloat(row.additional_pct) || 0,
    additionalAmt: parseFloat(row.additional_amt) || 0,
    defaultEmail: row.default_email || '',
    ccEmail: row.cc_email || '',
    emailProvider: row.email_provider || 'mailto',
    expenseTemplate: row.expense_template || JSON.parse(JSON.stringify(DEFAULT_EXPENSE_TEMPLATE)),
  }
}

function dbHistoryToApp(row) {
  return {
    _dbId: row.id,
    period: row.period,
    payee: row.payee || '',
    gross: parseFloat(row.gross) || 0,
    deductions: parseFloat(row.deductions) || 0,
    net: parseFloat(row.net) || 0,
    loadCount: row.load_count || 0,
    savedAt: new Date(row.saved_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    snapshot: row.snapshot || [],
  }
}

// ========== SUPABASE SYNC ==========

async function fetchAll(userId) {
  if (!userId) return
  currentUserId = userId
  syncing.value = true
  dbReady.value = false

  try {
    // Reset state before fetching
    skipWatch = true
    Object.assign(state, getDefaultState())
    skipWatch = false

    // Fetch settings for this user
    const { data: settingsRows } = await supabase.from('settings').select('*').eq('user_id', userId).limit(1)
    if (settingsRows && settingsRows.length > 0) {
      settingsId = settingsRows[0].id
      const s = dbSettingsToApp(settingsRows[0])
      Object.assign(state.settings, s)
    } else {
      // First login — create default settings for this user
      const { data } = await supabase.from('settings').insert({
        user_id: userId,
        payee_name: '',
        company_name: 'SUNSHINE TRANS INC',
        payment_date: '',
        payment_method: 'Monthly',
        pay_rate: 20,
        factoring_rate: 2.5,
        tax_status: '1099',
        expense_template: DEFAULT_EXPENSE_TEMPLATE,
      }).select()
      if (data && data[0]) {
        settingsId = data[0].id
        Object.assign(state.settings, dbSettingsToApp(data[0]))
      }
    }

    // Fetch all loads for this user
    const { data: loadRows } = await supabase.from('loads').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (loadRows && loadRows.length) {
      const loadIds = loadRows.map(l => l.id)
      const [{ data: allFuel }, { data: allExpenses }] = await Promise.all([
        supabase.from('fuel_entries').select('*').in('load_id', loadIds).order('sort_order'),
        supabase.from('expenses').select('*').in('load_id', loadIds).order('sort_order'),
      ])
      const fuelByLoad = {}
      const expByLoad = {}
      ;(allFuel || []).forEach(f => { (fuelByLoad[f.load_id] = fuelByLoad[f.load_id] || []).push(f) })
      ;(allExpenses || []).forEach(e => { (expByLoad[e.load_id] = expByLoad[e.load_id] || []).push(e) })

      skipWatch = true
      state.managedLoads = loadRows.map(row => dbLoadToApp(row, fuelByLoad[row.id] || [], expByLoad[row.id] || []))
      skipWatch = false
    }

    // Fetch history for this user
    const { data: historyRows } = await supabase.from('history').select('*').eq('user_id', userId).order('saved_at', { ascending: false })
    if (historyRows) {
      skipWatch = true
      state.history = historyRows.map(dbHistoryToApp)
      skipWatch = false
    }

    dbReady.value = true
  } catch (e) {
    console.warn('Supabase fetch failed:', e)
  } finally {
    syncing.value = false
  }
}

function clearState() {
  skipWatch = true
  Object.assign(state, getDefaultState())
  skipWatch = false
  dbReady.value = false
  settingsId = null
  currentUserId = null
}

async function saveSettingsToDb() {
  const uid = getUserId()
  if (!dbReady.value || !uid) return
  const s = state.settings
  const row = {
    user_id: uid,
    payee_name: s.payeeName,
    company_name: s.companyName,
    company_email: s.companyEmail,
    company_phone: s.companyPhone,
    payment_date: s.paymentDate,
    payment_method: s.paymentMethod,
    pay_rate: s.payRate,
    factoring_rate: s.factoringRate,
    tax_status: s.taxStatus,
    allowances: s.allowances,
    additional_pct: s.additionalPct,
    additional_amt: s.additionalAmt,
    default_email: s.defaultEmail,
    cc_email: s.ccEmail,
    email_provider: s.emailProvider,
    expense_template: s.expenseTemplate,
  }
  if (settingsId) {
    await supabase.from('settings').update(row).eq('id', settingsId)
  } else {
    const { data } = await supabase.from('settings').insert(row).select()
    if (data && data[0]) settingsId = data[0].id
  }
}

async function saveLoadToDb(load) {
  const uid = getUserId()
  if (!dbReady.value || !uid) return
  const row = {
    id: load.id,
    user_id: uid,
    load_number: load.loadNumber || '',
    name: load.name || '',
    amount: load.amount || 0,
    load_date: load.loadDate || null,
    delivery_date: load.deliveryDate || null,
    status: load.status || 'pending',
    driver_name: load.driverName || '',
    pay_rate: load.payRate ?? 20,
    factoring_rate: load.factoringRate ?? 2.5,
    pay_method: load.payMethod || 'Monthly',
    tax_status: load.taxStatus || '1099',
    notes: load.notes || '',
  }

  await supabase.from('loads').upsert(row)

  // Replace fuel entries
  await supabase.from('fuel_entries').delete().eq('load_id', load.id)
  if (load.fuel && load.fuel.length) {
    const fuelRows = load.fuel.map((f, i) => ({
      load_id: load.id,
      user_id: uid,
      name: f.name || '',
      miles: f.miles || 0,
      price_per_gallon: f.pricePerGallon || 0,
      amount: f.amount || 0,
      sort_order: i,
    }))
    await supabase.from('fuel_entries').insert(fuelRows)
  }

  // Replace expenses
  await supabase.from('expenses').delete().eq('load_id', load.id)
  if (load.expenses && load.expenses.length) {
    const expRows = load.expenses.map((e, i) => ({
      load_id: load.id,
      user_id: uid,
      name: e.name || '',
      amount: e.amount || 0,
      is_driver_pay: e.isDriverPay || false,
      sort_order: i,
    }))
    await supabase.from('expenses').insert(expRows)
  }
}

async function deleteLoadFromDb(loadId) {
  if (!dbReady.value) return
  await supabase.from('loads').delete().eq('id', loadId)
}

async function saveHistoryToDb(entry) {
  const uid = getUserId()
  if (!dbReady.value || !uid) return
  const { data } = await supabase.from('history').insert({
    user_id: uid,
    period: entry.period,
    payee: entry.payee,
    gross: entry.gross,
    deductions: entry.deductions,
    net: entry.net,
    load_count: entry.loadCount,
    snapshot: entry.snapshot,
  }).select()
  if (data && data[0]) return data[0].id
}

async function deleteHistoryFromDb(dbId) {
  if (!dbReady.value || !dbId) return
  await supabase.from('history').delete().eq('id', dbId)
}

// ========== LOCAL STORAGE SYNC (debounced settings save) ==========
let debounceTimer = null
watch(state, () => {
  if (skipWatch) return
  // Debounced settings sync
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    saveSettingsToDb()
  }, 1000)
}, { deep: true })

// ========== PER-LOAD CALCULATIONS ==========
function calcLoad(l) {
  const amount = parseFloat(l.amount) || 0
  const rate = parseFloat(l.payRate) || 0
  const factoringRate = parseFloat(l.factoringRate) || 0
  const factoring = amount * (factoringRate / 100)
  const dpGross = amount * (rate / 100)
  const driverPay = dpGross - factoring
  const ft = (l.fuel || []).reduce((s, f) => s + (parseFloat(f.amount) || 0), 0)
  const et = (l.expenses || []).reduce((s, e) => {
    if (e.isDriverPay) return s + driverPay
    return s + (parseFloat(e.amount) || 0)
  }, 0)
  const totalDeductions = ft + et
  return { gross: amount, driverPayGross: dpGross, driverPay, factoring, factoringRate, fuelTotal: ft, expensesTotal: et, totalDeductions, netPay: amount - totalDeductions }
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
      if (!(l.name || '').toLowerCase().includes(q) && !(l.driverName || '').toLowerCase().includes(q) && !(l.id || '').toLowerCase().includes(q) && !(l.loadNumber || '').toLowerCase().includes(q)) return false
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
    loadNumber: data.loadNumber || '',
    name: data.name || '',
    amount: data.amount || 0,
    loadDate: data.loadDate || new Date().toISOString().slice(0, 10),
    deliveryDate: data.deliveryDate || '',
    status: 'pending',
    driverName: data.driverName || s.payeeName || '',
    payRate: data.payRate ?? s.payRate ?? 20,
    factoringRate: data.factoringRate ?? s.factoringRate ?? 2.5,
    payMethod: data.payMethod || s.paymentMethod || 'Monthly',
    taxStatus: data.taxStatus || s.taxStatus || '1099',
    fuel: data.fuel || [],
    expenses: data.expenses || JSON.parse(JSON.stringify(s.expenseTemplate || DEFAULT_EXPENSE_TEMPLATE)),
    notes: data.notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  state.managedLoads.unshift(load)
  saveLoadToDb(load)
  return load
}

function updateLoad(index, data) {
  if (index < 0 || index >= state.managedLoads.length) return
  Object.assign(state.managedLoads[index], data, { updatedAt: new Date().toISOString() })
  saveLoadToDb(state.managedLoads[index])
}

function deleteLoad(index) {
  if (index < 0 || index >= state.managedLoads.length) return
  const loadId = state.managedLoads[index].id
  state.managedLoads.splice(index, 1)
  deleteLoadFromDb(loadId)
}

// ========== HISTORY ==========
function saveToHistory(periodLabel) {
  const agg = getAggregates()
  const entry = {
    period: periodLabel || state.settings.paymentDate,
    payee: state.settings.payeeName,
    gross: agg.totalGross,
    deductions: agg.totalDeductions,
    net: agg.netPay,
    loadCount: agg.count,
    savedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    snapshot: JSON.parse(JSON.stringify(state.managedLoads)),
  }
  state.history.unshift(entry)
  saveHistoryToDb(entry).then(dbId => {
    if (dbId) entry._dbId = dbId
  })
}

function removeHistory(i) {
  const entry = state.history[i]
  const dbId = entry?._dbId
  state.history.splice(i, 1)
  deleteHistoryFromDb(dbId)
}

// ========== UTILS ==========
function fmt(n) {
  const abs = Math.abs(n)
  const str = '$' + abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return n < 0 ? '-' + str : str
}

async function resetAll() {
  const uid = getUserId()
  if (dbReady.value && uid) {
    await supabase.from('fuel_entries').delete().eq('user_id', uid)
    await supabase.from('expenses').delete().eq('user_id', uid)
    await supabase.from('documents').delete().eq('user_id', uid)
    await supabase.from('loads').delete().eq('user_id', uid)
    await supabase.from('history').delete().eq('user_id', uid)
    if (settingsId) {
      await supabase.from('settings').delete().eq('id', settingsId)
      settingsId = null
    }
  }
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
    state, drivers, alerts, syncing, dbReady,
    STATUSES, STATUS_COLORS,
    calcLoad, getFilteredLoads, getAggregates, getPeriodDates,
    createLoad, updateLoad, deleteLoad,
    saveToHistory, removeHistory,
    fmt, resetAll, generateId, fetchAll, clearState,
    DEFAULT_EXPENSE_TEMPLATE,
  }
}
