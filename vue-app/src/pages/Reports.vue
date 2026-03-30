<template>
  <div class="fade-in">
    <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
      <h2 class="text-2xl font-bold text-gray-900">Reports</h2>
      <button class="btn btn-success" @click="exportCSV()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Export CSV
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body p-3 flex flex-wrap gap-2 items-center">
        <select v-model="filterDriver" class="max-w-[160px] text-sm"><option value="">All Drivers</option><option v-for="d in drivers" :key="d" :value="d">{{ d }}</option></select>
        <select v-model="groupBy" class="max-w-[130px] text-sm"><option value="week">By Week</option><option value="month">By Month</option><option value="year">By Year</option></select>
        <div class="ml-auto flex gap-1">
          <button v-for="p in periods" :key="p.key" :class="['btn text-xs py-1', period === p.key ? 'btn-primary' : 'btn-outline']" @click="period = p.key">{{ p.label }}</button>
        </div>
      </div>
    </div>

    <!-- Totals -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
      <div class="card p-3 text-center"><div class="label">Loads</div><div class="text-xl font-bold text-gray-900">{{ agg.count }}</div></div>
      <div class="card p-3 text-center"><div class="label">Gross</div><div class="text-xl font-bold text-amber-600">{{ fmt(agg.totalGross) }}</div></div>
      <div class="card p-3 text-center"><div class="label">Deductions</div><div class="text-xl font-bold text-red-600">{{ fmt(agg.totalDeductions) }}</div></div>
      <div class="card p-3 text-center"><div class="label">Net</div><div class="text-xl font-bold" :style="{color: agg.netPay >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(agg.netPay) }}</div></div>
    </div>

    <!-- Grouped table -->
    <div class="card">
      <div class="card-body p-0 sm:p-4">
        <div v-if="!grouped.length" class="text-center py-12 text-gray-400"><p class="font-semibold">No data for this period</p></div>
        <div v-for="g in grouped" :key="g.label" class="mb-4 last:mb-0">
          <div class="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-t-lg font-bold text-sm">
            <span class="text-gray-900">{{ g.label }}</span>
            <span class="text-gray-500">{{ g.loads.length }} load{{ g.loads.length > 1 ? 's' : '' }}</span>
          </div>
          <!-- Desktop -->
          <div class="hidden sm:block">
            <div v-for="l in g.loads" :key="l.id" class="grid items-center px-4 py-2 border-b border-gray-100 text-sm" style="grid-template-columns:2fr 1fr 1fr 1fr 1fr;">
              <div><span class="font-semibold text-gray-900">{{ l.name }}</span><span class="text-xs text-gray-500 ml-2">{{ l.loadDate }}</span></div>
              <span class="text-gray-700">{{ l.driverName || '-' }}</span>
              <span class="text-right text-amber-600 font-semibold">{{ fmt(calcLoad(l).gross) }}</span>
              <span class="text-right text-red-600 font-semibold">{{ fmt(calcLoad(l).totalDeductions) }}</span>
              <span class="text-right font-semibold" :style="{color: calcLoad(l).netPay >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(calcLoad(l).netPay) }}</span>
            </div>
          </div>
          <!-- Mobile -->
          <div class="sm:hidden">
            <div v-for="l in g.loads" :key="l.id" class="px-4 py-3 border-b border-gray-100">
              <div class="font-semibold text-gray-900 text-sm">{{ l.name }}</div>
              <div class="text-xs text-gray-500 mb-2">{{ l.driverName || '-' }} &middot; {{ l.loadDate }}</div>
              <div class="grid grid-cols-3 gap-2">
                <div class="bg-amber-50 rounded p-1.5 text-center"><div class="text-[0.55rem] font-bold uppercase text-gray-500">Gross</div><div class="font-bold text-xs text-amber-700">{{ fmt(calcLoad(l).gross) }}</div></div>
                <div class="bg-red-50 rounded p-1.5 text-center"><div class="text-[0.55rem] font-bold uppercase text-gray-500">Ded.</div><div class="font-bold text-xs text-red-600">{{ fmt(calcLoad(l).totalDeductions) }}</div></div>
                <div :class="calcLoad(l).netPay >= 0 ? 'bg-green-50' : 'bg-red-50'" class="rounded p-1.5 text-center"><div class="text-[0.55rem] font-bold uppercase text-gray-500">Net</div><div class="font-bold text-xs" :style="{color: calcLoad(l).netPay >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(calcLoad(l).netPay) }}</div></div>
              </div>
            </div>
          </div>
          <!-- Group total -->
          <div class="flex justify-between px-4 py-2 bg-gray-50 rounded-b-lg font-bold text-sm border-t-2 border-gray-200">
            <span class="text-gray-700">Subtotal</span>
            <div class="flex gap-4">
              <span class="text-amber-600">{{ fmt(g.totalGross) }}</span>
              <span class="text-red-600">{{ fmt(g.totalDed) }}</span>
              <span :style="{color: g.net >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(g.net) }}</span>
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
