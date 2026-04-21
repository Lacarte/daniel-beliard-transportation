<template>
  <div class="fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between mb-5 flex-wrap gap-2 sm:pl-0 pl-8">
      <h2 class="text-2xl font-bold text-gray-900 font-display">Dashboard</h2>
      <div class="flex gap-1.5">
        <button v-for="p in periods" :key="p.key" :class="['px-4 py-1.5 rounded-lg text-xs font-semibold transition-all', period === p.key ? 'bg-blue-900 text-white shadow-md' : 'btn-outline']" @click="period = p.key">{{ p.label }}</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6 stagger-in">
      <div class="card p-4 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full rounded-r" style="background:linear-gradient(180deg,#fbbf24,#f59e0b);"></div>
        <div class="label ml-2">Total Loads</div>
        <div class="text-3xl font-extrabold text-gray-900 font-display ml-2 mt-1">{{ agg.count }}</div>
      </div>
      <div class="card p-4 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full rounded-r" style="background:linear-gradient(180deg,#fbbf24,#d97706);"></div>
        <div class="label ml-2">Gross Revenue</div>
        <div class="text-3xl font-extrabold text-amber-600 font-mono ml-2 mt-1">{{ fmt(agg.totalGross) }}</div>
      </div>
      <div class="card p-4 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full rounded-r" style="background:linear-gradient(180deg,#ef4444,#dc2626);"></div>
        <div class="label ml-2">Total Deductions</div>
        <div class="text-3xl font-extrabold text-red-600 font-mono ml-2 mt-1">{{ fmt(agg.totalDeductions) }}</div>
      </div>
      <div class="card p-4 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-1 h-full rounded-r" :style="{background: agg.netPay >= 0 ? 'linear-gradient(180deg,#22c55e,#16a34a)' : 'linear-gradient(180deg,#ef4444,#dc2626)'}"></div>
        <div class="label ml-2">Net Pay</div>
        <div class="text-3xl font-extrabold font-mono ml-2 mt-1" :style="{color: agg.netPay >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(agg.netPay) }}</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 stagger-in">
      <router-link to="/" class="card group p-5 hover:shadow-lg transition-all no-underline relative overflow-hidden">
        <div class="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity" style="background:#3b82f6;"></div>
        <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <h3 class="font-bold text-base text-gray-900 font-display">Create New Load</h3>
        <p class="text-xs text-gray-500 mt-1">Register a new load entry</p>
      </router-link>
      <router-link to="/paystub" class="card group p-5 hover:shadow-lg transition-all no-underline relative overflow-hidden">
        <div class="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity" style="background:#f59e0b;"></div>
        <div class="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <h3 class="font-bold text-base text-gray-900 font-display">View Pay Stub</h3>
        <p class="text-xs text-gray-500 mt-1">Generate printable pay stub</p>
      </router-link>
      <router-link to="/reports" class="card group p-5 hover:shadow-lg transition-all no-underline relative overflow-hidden">
        <div class="absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity" style="background:#10b981;"></div>
        <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </div>
        <h3 class="font-bold text-base text-gray-900 font-display">View Reports</h3>
        <p class="text-xs text-gray-500 mt-1">Weekly, monthly, yearly breakdown</p>
      </router-link>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Expense Breakdown -->
      <div class="card">
        <div class="card-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-40"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
          Expense Breakdown
          <span class="text-xs font-normal text-gray-400 ml-1">({{ periodLabel }})</span>
        </div>
        <div class="card-body">
          <template v-if="chartItems.length">
            <div v-for="(item, i) in chartItems" :key="i" class="flex items-center gap-2.5 mb-2.5">
              <span class="text-xs text-gray-500 w-24 truncate text-right flex-shrink-0 font-medium">{{ item.name }}</span>
              <div class="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700 ease-out" :style="{width: (item.amount / chartMax * 100) + '%', background: colors[i % colors.length]}"></div>
              </div>
              <span class="text-xs font-bold text-gray-700 w-20 text-right font-mono">{{ fmt(item.amount) }}</span>
            </div>
          </template>
          <div v-else class="text-center py-8">
            <div class="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
            </div>
            <p class="text-gray-400 italic text-sm">No expense data for this period</p>
          </div>
        </div>
      </div>

      <!-- Alerts -->
      <div class="card">
        <div class="card-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-40"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Alerts
          <span v-if="alerts.length" class="badge bg-red-50 text-red-600 border border-red-200/50 ml-1.5">{{ alerts.length }}</span>
        </div>
        <div class="card-body">
          <div v-if="alerts.length">
            <div v-for="(a, i) in alerts.slice(0, 8)" :key="i" class="flex items-start gap-2.5 py-2.5 border-b border-gray-100 last:border-0">
              <span :class="['w-2 h-2 rounded-full mt-1.5 flex-shrink-0', a.type === 'danger' ? 'bg-red-500' : a.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400']"></span>
              <span class="text-sm text-gray-700">{{ a.msg }}</span>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <div class="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p class="text-sm font-semibold text-gray-400">All clear! No alerts.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePayroll } from '../composables/usePayroll'
const { state, alerts, getFilteredLoads, getAggregates, getPeriodDates, calcLoad, fmt } = usePayroll()

const period = ref('month')
const periods = [{ key: 'week', label: 'Week' }, { key: 'month', label: 'Month' }, { key: 'year', label: 'Year' }, { key: 'all', label: 'All' }]
const periodLabel = computed(() => periods.find(p => p.key === period.value)?.label || 'All')

const filters = computed(() => period.value !== 'all' ? getPeriodDates(period.value) : {})
const agg = computed(() => getAggregates(filters.value))

const colors = ['#3b82f6','#ef4444','#f59e0b','#10b981','#8b5cf6','#ec4899','#06b6d4','#f97316','#6366f1','#14b8a6']
const chartItems = computed(() => {
  const map = {}
  getFilteredLoads(filters.value).forEach(l => {
    const c = calcLoad(l)
    ;(l.expenses || []).forEach(e => {
      const name = e.name || 'Other'
      const val = e.isDriverPay ? c.driverPay : (parseFloat(e.amount) || 0)
      if (val > 0) map[name] = (map[name] || 0) + val
    })
    ;(l.fuel || []).forEach(f => { if (f.amount > 0) map[f.name + ' (Fuel)'] = (map[f.name + ' (Fuel)'] || 0) + f.amount })
  })
  return Object.entries(map).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount)
})
const chartMax = computed(() => Math.max(...chartItems.value.map(i => i.amount), 1))
</script>
