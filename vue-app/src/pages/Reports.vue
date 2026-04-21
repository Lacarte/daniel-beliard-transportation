<template>
  <div class="fade-in">
    <div class="flex items-center justify-between mb-5 flex-wrap gap-2 sm:pl-0 pl-8">
      <h2 class="text-2xl font-bold text-gray-900 font-display">Reports</h2>
      <button class="btn btn-gold text-xs" @click="exportCSV()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export CSV
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body p-3 flex flex-wrap gap-2 items-center">
        <select v-model="filterDriver" class="max-w-[160px] text-sm"><option value="">All Drivers</option><option v-for="d in drivers" :key="d" :value="d">{{ d }}</option></select>
        <select v-model="groupBy" class="max-w-[130px] text-sm"><option value="week">By Week</option><option value="month">By Month</option><option value="year">By Year</option></select>
        <div class="ml-auto flex gap-1.5">
          <button v-for="p in periods" :key="p.key" :class="['px-4 py-1.5 rounded-lg text-xs font-semibold transition-all', period === p.key ? 'bg-blue-900 text-white shadow-md' : 'btn-outline']" @click="period = p.key">{{ p.label }}</button>
        </div>
      </div>
    </div>

    <!-- Totals -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 stagger-in">
      <div class="card p-3 text-center"><div class="label">Loads</div><div class="text-xl font-extrabold text-gray-900 font-display mt-1">{{ agg.count }}</div></div>
      <div class="card p-3 text-center"><div class="label">Gross</div><div class="text-xl font-extrabold text-amber-600 font-mono mt-1">{{ fmt(agg.totalGross) }}</div></div>
      <div class="card p-3 text-center"><div class="label">Deductions</div><div class="text-xl font-extrabold text-red-600 font-mono mt-1">{{ fmt(agg.totalDeductions) }}</div></div>
      <div class="card p-3 text-center"><div class="label">Net</div><div class="text-xl font-extrabold font-mono mt-1" :style="{color: agg.netPay >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(agg.netPay) }}</div></div>
    </div>

    <!-- Grouped table -->
    <div class="card">
      <div class="card-body p-0 sm:p-4">
        <div v-if="!grouped.length" class="text-center py-16">
          <div class="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <p class="font-semibold text-gray-400">No data for this period</p>
        </div>
        <div v-for="g in grouped" :key="g.label" class="mb-4 last:mb-0">
          <div class="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-t-lg font-bold text-sm">
            <span class="text-gray-900 font-display">{{ g.label }}</span>
            <span class="text-gray-400 text-xs font-medium">{{ g.loads.length }} load{{ g.loads.length > 1 ? 's' : '' }}</span>
          </div>
          <!-- Desktop -->
          <div class="hidden sm:block">
            <div v-for="l in g.loads" :key="l.id" class="grid items-center px-4 py-2.5 border-b border-gray-100 text-sm" style="grid-template-columns:2fr 1fr 1fr 1fr 1fr;">
              <div><span class="font-semibold text-gray-900">{{ l.name }}</span><span class="text-xs text-gray-400 ml-2">{{ l.loadDate }}</span></div>
              <span class="text-gray-600">{{ l.driverName || '-' }}</span>
              <span class="text-right text-amber-600 font-semibold font-mono">{{ fmt(calcLoad(l).gross) }}</span>
              <span class="text-right text-red-600 font-semibold font-mono">{{ fmt(calcLoad(l).totalDeductions) }}</span>
              <span class="text-right font-semibold font-mono" :style="{color: calcLoad(l).netPay >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(calcLoad(l).netPay) }}</span>
            </div>
          </div>
          <!-- Mobile -->
          <div class="sm:hidden">
            <div v-for="l in g.loads" :key="l.id" class="px-4 py-3 border-b border-gray-100">
              <div class="font-semibold text-gray-900 text-sm">{{ l.name }}</div>
              <div class="text-xs text-gray-400 mb-2">{{ l.driverName || '-' }} &middot; {{ l.loadDate }}</div>
              <div class="grid grid-cols-3 gap-2">
                <div class="bg-amber-50 rounded-lg p-2 text-center"><div class="text-[0.55rem] font-bold uppercase text-gray-400 tracking-wider">Gross</div><div class="font-bold text-xs text-amber-700 font-mono">{{ fmt(calcLoad(l).gross) }}</div></div>
                <div class="bg-red-50 rounded-lg p-2 text-center"><div class="text-[0.55rem] font-bold uppercase text-gray-400 tracking-wider">Ded.</div><div class="font-bold text-xs text-red-600 font-mono">{{ fmt(calcLoad(l).totalDeductions) }}</div></div>
                <div :class="calcLoad(l).netPay >= 0 ? 'bg-green-50' : 'bg-red-50'" class="rounded-lg p-2 text-center"><div class="text-[0.55rem] font-bold uppercase text-gray-400 tracking-wider">Net</div><div class="font-bold text-xs font-mono" :style="{color: calcLoad(l).netPay >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(calcLoad(l).netPay) }}</div></div>
              </div>
            </div>
          </div>
          <!-- Group total -->
          <div class="flex justify-between px-4 py-2.5 bg-gray-50 rounded-b-lg font-bold text-sm border-t border-gray-200">
            <span class="text-gray-600 text-xs font-semibold uppercase tracking-wider">Subtotal</span>
            <div class="flex gap-4 font-mono">
              <span class="text-amber-600 text-xs">{{ fmt(g.totalGross) }}</span>
              <span class="text-red-600 text-xs">{{ fmt(g.totalDed) }}</span>
              <span class="text-xs" :style="{color: g.net >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(g.net) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePayroll } from '../composables/usePayroll'
import { useToast } from '../composables/useToast'

const { state, drivers, getFilteredLoads, getAggregates, getPeriodDates, calcLoad, fmt } = usePayroll()
const { showToast } = useToast()

const filterDriver = ref('')
const groupBy = ref('week')
const period = ref('month')
const periods = [{ key: 'month', label: 'Month' }, { key: 'year', label: 'Year' }, { key: 'all', label: 'All' }]

const filters = computed(() => {
  const f = { driver: filterDriver.value || undefined }
  if (period.value !== 'all') Object.assign(f, getPeriodDates(period.value))
  return f
})
const agg = computed(() => getAggregates(filters.value))

const grouped = computed(() => {
  const loads = getFilteredLoads(filters.value).sort((a, b) => (b.loadDate || '').localeCompare(a.loadDate || ''))
  const map = {}
  loads.forEach(l => {
    let key
    const d = l.loadDate || ''
    if (groupBy.value === 'week') {
      const dt = new Date(d); const day = dt.getDay(); const mon = new Date(dt); mon.setDate(dt.getDate() - (day === 0 ? 6 : day - 1))
      key = 'Week of ' + mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } else if (groupBy.value === 'month') {
      key = d ? new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'No Date'
    } else {
      key = d ? d.slice(0, 4) : 'No Date'
    }
    if (!map[key]) map[key] = []
    map[key].push(l)
  })
  return Object.entries(map).map(([label, loads]) => {
    let totalGross = 0, totalDed = 0
    loads.forEach(l => { const c = calcLoad(l); totalGross += c.gross; totalDed += c.totalDeductions })
    return { label, loads, totalGross, totalDed, net: totalGross - totalDed }
  })
})

function exportCSV() {
  const loads = getFilteredLoads(filters.value)
  if (!loads.length) { showToast('No data to export', 'error'); return }
  const rows = [['ID','Load Name','Driver','Date','Status','Gross','Fuel','Expenses','Deductions','Net Pay']]
  loads.forEach(l => {
    const c = calcLoad(l)
    rows.push([l.id, l.name, l.driverName, l.loadDate, l.status, c.gross.toFixed(2), c.fuelTotal.toFixed(2), c.expensesTotal.toFixed(2), c.totalDeductions.toFixed(2), c.netPay.toFixed(2)])
  })
  const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `sunshine-report-${new Date().toISOString().slice(0,10)}.csv`; a.click()
  showToast('CSV exported', 'success')
}
</script>
