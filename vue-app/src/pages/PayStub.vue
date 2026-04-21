<template>
  <div class="fade-in">
    <div class="flex items-center justify-between mb-5 flex-wrap gap-2 sm:pl-0 pl-8">
      <h2 class="text-2xl font-bold text-gray-900 font-display">Pay Stub</h2>
      <div class="flex gap-2 no-print">
        <button class="btn btn-gold text-xs" @click="window.print()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Export PDF
        </button>
        <button class="btn btn-primary text-xs" @click="emailStub()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Email
        </button>
      </div>
    </div>

    <div class="card overflow-hidden">
      <!-- Header -->
      <div class="p-6 text-center relative overflow-hidden" style="background:linear-gradient(135deg,#070b1a 0%,#1e3a8a 100%);">
        <div class="absolute inset-0 opacity-[0.08]" style="background-image:url('data:image/svg+xml,<svg viewBox=&quot;0 0 256 256&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;><filter id=&quot;n&quot;><feTurbulence type=&quot;fractalNoise&quot; baseFrequency=&quot;0.9&quot; numOctaves=&quot;4&quot; stitchTiles=&quot;stitch&quot;/></filter><rect width=&quot;100%25&quot; height=&quot;100%25&quot; filter=&quot;url(%23n)&quot;/></svg>');"></div>
        <div class="relative z-10 flex items-center gap-3 justify-start">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background:linear-gradient(135deg,#f59e0b,#fbbf24); box-shadow:0 4px 12px rgba(245,158,11,.25);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/></svg>
          </div>
          <div class="text-left">
            <h1 class="text-lg font-bold text-white tracking-wide font-display leading-tight">{{ state.settings.companyName }}</h1>
            <p class="text-white/30 text-[0.6rem] tracking-[0.2em] font-medium">PAY STUB</p>
          </div>
        </div>
      </div>

      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div class="space-y-2.5">
            <div class="flex gap-2"><span class="label w-32 mb-0 text-[0.65rem]">PAYEE NAME</span><span class="font-semibold text-gray-900 text-sm">{{ state.settings.payeeName }}</span></div>
            <div class="flex gap-2"><span class="label w-32 mb-0 text-[0.65rem]">PERIOD</span><span class="font-semibold text-gray-900 text-sm">{{ state.settings.paymentDate }}</span></div>
            <div class="flex gap-2"><span class="label w-32 mb-0 text-[0.65rem]">METHOD</span><span class="font-semibold text-gray-900 text-sm">{{ state.settings.paymentMethod }}</span></div>
            <div class="flex gap-2"><span class="label w-32 mb-0 text-[0.65rem]">TOTAL LOADS</span><span class="font-semibold text-gray-900 text-sm">{{ agg.count }}</span></div>
          </div>
          <div class="space-y-2.5">
            <div class="flex gap-2"><span class="label w-32 mb-0 text-[0.65rem]">TAX STATUS</span><span class="font-semibold text-gray-900 text-sm">{{ state.settings.taxStatus }}</span></div>
            <div class="flex gap-2"><span class="label w-32 mb-0 text-[0.65rem]">PAY RATE</span><span class="font-semibold text-gray-900 text-sm">{{ state.settings.payRate }}%</span></div>
            <div class="flex gap-2"><span class="label w-32 mb-0 text-[0.65rem]">ALLOWANCES</span><span class="font-semibold text-gray-900 text-sm">{{ state.settings.allowances }}</span></div>
          </div>
        </div>

        <!-- Loads breakdown -->
        <div class="rounded-xl overflow-hidden border border-gray-200 mb-6">
          <div class="text-center py-2.5 font-bold text-xs tracking-[0.1em] font-display" style="background:linear-gradient(135deg,#f59e0b,#fbbf24); color:#1e3a8a;">LOADS BREAKDOWN</div>
          <div class="p-3">
            <div v-for="l in state.managedLoads" :key="l.id" class="flex justify-between py-2 text-sm border-b border-gray-100 last:border-0">
              <div><span class="font-semibold text-sm">{{ l.name }}</span><span class="text-xs text-gray-400 ml-2">{{ l.driverName }}</span></div>
              <div class="flex gap-4 text-right font-mono text-xs">
                <span class="text-amber-600 font-semibold">{{ fmt(calcLoad(l).gross) }}</span>
                <span class="text-red-500">-{{ fmt(calcLoad(l).totalDeductions) }}</span>
                <span class="font-bold" :style="{color: calcLoad(l).netPay >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(calcLoad(l).netPay) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Totals -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="rounded-xl text-center p-4 relative overflow-hidden" style="background:#070b1a;">
            <div class="text-[0.6rem] font-bold text-white/40 uppercase tracking-[0.1em] mb-1">Total Gross</div>
            <div class="text-2xl font-bold text-amber-400 font-mono">{{ fmt(agg.totalGross) }}</div>
          </div>
          <div class="rounded-xl text-center p-4 relative overflow-hidden" style="background:#070b1a;">
            <div class="text-[0.6rem] font-bold text-white/40 uppercase tracking-[0.1em] mb-1">Total Deductions</div>
            <div class="text-2xl font-bold text-red-400 font-mono">{{ fmt(agg.totalDeductions) }}</div>
          </div>
          <div class="rounded-xl text-center p-4 relative overflow-hidden" style="background:#070b1a;">
            <div class="text-[0.6rem] font-bold text-white/40 uppercase tracking-[0.1em] mb-1">Total Net Pay</div>
            <div class="text-2xl font-bold font-mono" :style="{color: agg.netPay >= 0 ? '#fbbf24' : '#f87171'}">{{ fmt(agg.netPay) }}</div>
          </div>
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
