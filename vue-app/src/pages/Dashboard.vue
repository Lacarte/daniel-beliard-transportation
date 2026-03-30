<template>
  <div class="fade-in">
    <!-- Period selector -->
    <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
      <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
      <div class="flex gap-1">
        <button v-for="p in periods" :key="p.key" :class="['btn text-xs py-1', period === p.key ? 'btn-primary' : 'btn-outline']" @click="period = p.key">{{ p.label }}</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <div class="card stat-card" style="border-left:4px solid #FFC000;"><div class="label">Total Loads</div><div class="text-3xl font-bold text-gray-900">{{ agg.count }}</div></div>
      <div class="card stat-card" style="border-left:4px solid #d97706;"><div class="label">Gross Revenue</div><div class="text-3xl font-bold text-amber-600">{{ fmt(agg.totalGross) }}</div></div>
      <div class="card stat-card" style="border-left:4px solid #dc2626;"><div class="label">Total Deductions</div><div class="text-3xl font-bold text-red-600">{{ fmt(agg.totalDeductions) }}</div></div>
      <div class="card stat-card" style="border-left:4px solid #16a34a;"><div class="label">Net Pay</div><div class="text-3xl font-bold" :style="{color: agg.netPay >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(agg.netPay) }}</div></div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <router-link to="/" class="card p-5 hover:shadow-lg hover:scale-[1.02] transition-all no-underline">
        <div class="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <h3 class="font-bold text-lg text-gray-900">Create New Load</h3>
        <p class="text-sm text-gray-500">Register a new load entry</p>
      </router-link>
      <router-link to="/paystub" class="card p-5 hover:shadow-lg hover:scale-[1.02] transition-all no-underline">
        <div class="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center mb-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <h3 class="font-bold text-lg text-gray-900">View Pay Stub</h3>
        <p class="text-sm text-gray-500">Generate printable pay stub</p>
      </router-link>
      <router-link to="/reports" class="card p-5 hover:shadow-lg hover:scale-[1.02] transition-all no-underline">
        <div class="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center mb-3">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </div>
        <h3 class="font-bold text-lg text-gray-900">View Reports</h3>
        <p class="text-sm text-gray-500">Weekly, monthly, yearly breakdown</p>
      </router-link>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Expense Breakdown -->
      <div class="card">
        <div class="card-header">Expense Breakdown ({{ periodLabel }})</div>
        <div class="card-body">
          <template v-if="chartItems.length">
            <div v-for="(item, i) in chartItems" :key="i" class="flex items-center gap-2 mb-2">
              <span class="text-xs text-gray-500 w-24 truncate text-right flex-shrink-0">{{ item.name }}</span>
              <div class="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden"><div class="h-full rounded-full transition-all duration-500" :style="{width: (item.amount / chartMax * 100) + '%', background: colors[i % colors.length]}"></div></div>
              <span class="text-xs font-semibold text-gray-700 w-20 text-right">{{ fmt(item.amount) }}</span>
            </div>
          </template>
          <p v-else class="text-gray-400 italic text-center py-6">No expense data for this period</p>
        </div>
      </div>

      <!-- Alerts -->
      <div class="card">
        <div class="card-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Alerts <span v-if="alerts.length" class="badge bg-red-100 text-red-700 ml-1">{{ alerts.length }}</span>
        </div>
        <div class="card-body">
          <div v-if="alerts.length">
            <div v-for="(a, i) in alerts.slice(0, 8)" :key="i" class="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
              <span :class="['w-2 h-2 rounded-full mt-1.5 flex-shrink-0', a.type === 'danger' ? 'bg-red-500' : a.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500']"></span>
              <span class="text-sm text-gray-700">{{ a.msg }}</span>
            </div>
          </div>
          <div v-else class="text-center py-6 text-gray-400">
            <p class="text-sm font-semibold">All clear! No alerts.</p>
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
