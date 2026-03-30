<template>
  <div class="fade-in">
    <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
      <h2 class="text-2xl font-bold text-gray-900">Pay Stub</h2>
      <div class="flex gap-2 no-print">
        <button class="btn btn-gold" @click="window.print()">Export PDF</button>
        <button class="btn btn-primary" @click="emailStub()">Email</button>
      </div>
    </div>

    <div class="card">
      <div class="p-6 text-center" style="background:linear-gradient(135deg,#00B0F0,#0088cc); border-radius:0.75rem 0.75rem 0 0;">
        <h1 class="text-3xl font-bold text-white tracking-wider">{{ state.settings.companyName }}</h1>
      </div>
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="space-y-2">
            <div class="flex gap-2"><span class="label w-36 mb-0">PAYEE NAME</span><span class="font-semibold text-gray-900">{{ state.settings.payeeName }}</span></div>
            <div class="flex gap-2"><span class="label w-36 mb-0">PERIOD</span><span class="font-semibold text-gray-900">{{ state.settings.paymentDate }}</span></div>
            <div class="flex gap-2"><span class="label w-36 mb-0">METHOD</span><span class="font-semibold text-gray-900">{{ state.settings.paymentMethod }}</span></div>
            <div class="flex gap-2"><span class="label w-36 mb-0">TOTAL LOADS</span><span class="font-semibold text-gray-900">{{ agg.count }}</span></div>
          </div>
          <div class="space-y-2">
            <div class="flex gap-2"><span class="label w-36 mb-0">TAX STATUS</span><span class="font-semibold text-gray-900">{{ state.settings.taxStatus }}</span></div>
            <div class="flex gap-2"><span class="label w-36 mb-0">PAY RATE</span><span class="font-semibold text-gray-900">{{ state.settings.payRate }}%</span></div>
            <div class="flex gap-2"><span class="label w-36 mb-0">ALLOWANCES</span><span class="font-semibold text-gray-900">{{ state.settings.allowances }}</span></div>
          </div>
        </div>

        <!-- Loads breakdown -->
        <div class="rounded-lg overflow-hidden border border-gray-200 mb-6">
          <div class="text-center py-2 font-bold text-sm" style="background:#FFC000; color:#1e3a8a;">LOADS BREAKDOWN</div>
          <div class="p-3">
            <div v-for="l in state.managedLoads" :key="l.id" class="flex justify-between py-1.5 text-sm border-b border-gray-100">
              <div><span class="font-semibold">{{ l.name }}</span><span class="text-xs text-gray-500 ml-2">{{ l.driverName }}</span></div>
              <div class="flex gap-4 text-right">
                <span class="text-amber-600 font-semibold">{{ fmt(calcLoad(l).gross) }}</span>
                <span class="text-red-600">-{{ fmt(calcLoad(l).totalDeductions) }}</span>
                <span class="font-bold" :style="{color: calcLoad(l).netPay >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(calcLoad(l).netPay) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="rounded-lg text-center p-4" style="background:#134F5C;"><div class="text-xs font-bold text-white/70 uppercase mb-1">Total Gross</div><div class="text-2xl font-bold text-yellow-300">{{ fmt(agg.totalGross) }}</div></div>
          <div class="rounded-lg text-center p-4" style="background:#134F5C;"><div class="text-xs font-bold text-white/70 uppercase mb-1">Total Deductions</div><div class="text-2xl font-bold text-red-400">{{ fmt(agg.totalDeductions) }}</div></div>
          <div class="rounded-lg text-center p-4" style="background:#134F5C;"><div class="text-xs font-bold text-white/70 uppercase mb-1">Total Net Pay</div><div class="text-2xl font-bold text-yellow-300">{{ fmt(agg.netPay) }}</div></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePayroll } from '../composables/usePayroll'
const { state, getAggregates, calcLoad, fmt } = usePayroll()
const agg = getAggregates()

function emailStub() {
  const s = state.settings
  const agg = getAggregates()
  const body = `PAY STUB - ${s.companyName}\nPayee: ${s.payeeName}\nPeriod: ${s.paymentDate}\nLoads: ${agg.count}\nGross: ${fmt(agg.totalGross)}\nDeductions: ${fmt(agg.totalDeductions)}\nNet Pay: ${fmt(agg.netPay)}\n\nLOADS:\n${state.managedLoads.map(l => `  ${l.name}: ${fmt(l.amount)}`).join('\n')}`
  const su = encodeURIComponent(`Pay Stub - ${s.payeeName} - ${s.paymentDate}`)
  const bo = encodeURIComponent(body)
  const to = s.defaultEmail || ''
  const p = s.emailProvider
  let url
  if (p === 'gmail') url = `https://mail.google.com/mail/?view=cm&to=${to}&su=${su}&body=${bo}`
  else if (p === 'outlook') url = `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${su}&body=${bo}`
  else url = `mailto:${to}?subject=${su}&body=${bo}`
  window.open(url, '_blank')
}
</script>
