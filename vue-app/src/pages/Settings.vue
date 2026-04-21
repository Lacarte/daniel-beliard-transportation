<template>
  <div class="fade-in">
    <h2 class="text-2xl font-bold text-gray-900 font-display mb-5 sm:pl-0 pl-8">Settings</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <!-- Employee Defaults -->
      <div class="card">
        <button class="card-header w-full cursor-pointer hover:bg-gray-50 transition-colors" @click="sections.employee = !sections.employee">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-40"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Employee Defaults
          <svg :class="['ml-auto transition-transform', sections.employee ? 'rotate-180' : '']" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div v-show="sections.employee" class="card-body space-y-3">
          <div class="field-group"><div class="label">Default Payee Name</div><input type="text" v-model="state.settings.payeeName"/></div>
          <div class="field-group"><div class="label">Payment Period</div><input type="text" v-model="state.settings.paymentDate"/></div>
          <div class="field-group"><div class="label">Default Payment Method</div><select v-model="state.settings.paymentMethod"><option>Monthly</option><option>Bi-Weekly</option><option>Weekly</option><option>Per Load</option></select></div>
          <div class="field-group"><div class="label">Default Pay Rate (%)</div><input type="number" v-model.number="state.settings.payRate" min="0" max="100"/></div>
          <div class="field-group"><div class="label">Default Tax Status</div><select v-model="state.settings.taxStatus"><option value="1099">1099</option><option value="W-2">W-2</option></select></div>
        </div>
      </div>

      <!-- Company Info -->
      <div class="card">
        <button class="card-header w-full cursor-pointer hover:bg-gray-50 transition-colors" @click="sections.company = !sections.company">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-40"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          Company Info
          <svg :class="['ml-auto transition-transform', sections.company ? 'rotate-180' : '']" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div v-show="sections.company" class="card-body space-y-3">
          <div class="field-group"><div class="label">Company Name</div><input type="text" v-model="state.settings.companyName"/></div>
          <div class="field-group"><div class="label">Company Email</div><input type="email" v-model="state.settings.companyEmail"/></div>
          <div class="field-group"><div class="label">Company Phone</div><input type="text" v-model="state.settings.companyPhone"/></div>
        </div>
      </div>

      <!-- Email Configuration -->
      <div class="card">
        <button class="card-header w-full cursor-pointer hover:bg-gray-50 transition-colors" @click="sections.email = !sections.email">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-40"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          Email Configuration
          <svg :class="['ml-auto transition-transform', sections.email ? 'rotate-180' : '']" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div v-show="sections.email" class="card-body space-y-3">
          <div class="field-group"><div class="label">Default Recipient</div><input type="email" v-model="state.settings.defaultEmail"/></div>
          <div class="field-group"><div class="label">CC Email</div><input type="email" v-model="state.settings.ccEmail"/></div>
          <div class="field-group"><div class="label">Email Provider</div><select v-model="state.settings.emailProvider"><option value="mailto">Default (mailto)</option><option value="gmail">Gmail</option><option value="outlook">Outlook</option></select></div>
        </div>
      </div>

      <!-- Tax & Additional -->
      <div class="card">
        <button class="card-header w-full cursor-pointer hover:bg-gray-50 transition-colors" @click="sections.tax = !sections.tax">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-40"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Tax & Additional
          <svg :class="['ml-auto transition-transform', sections.tax ? 'rotate-180' : '']" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div v-show="sections.tax" class="card-body space-y-3">
          <div class="field-group"><div class="label">Allowances</div><input type="number" v-model.number="state.settings.allowances" min="0"/></div>
          <div class="field-group"><div class="label">Additional %</div><input type="number" v-model.number="state.settings.additionalPct" min="0" max="100" step="0.01"/></div>
          <div class="field-group"><div class="label">Additional Amount ($)</div><input type="number" v-model.number="state.settings.additionalAmt" min="0" step="0.01" placeholder="0.00"/></div>
        </div>
      </div>
    </div>

    <div class="flex gap-3 mt-5 pb-8 sm:pb-4">
      <button class="btn btn-primary justify-center py-3 sm:py-2" style="flex:3;" @click="showToast('Settings saved', 'success')">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        Save Settings
      </button>
      <button class="btn btn-danger justify-center py-3 sm:py-2" style="flex:1;" @click="doReset()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
        Reset
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { usePayroll } from '../composables/usePayroll'
import { useToast } from '../composables/useToast'
const { state, resetAll } = usePayroll()
const { showToast } = useToast()

const sections = reactive({ employee: true, company: true, email: false, tax: false })

function doReset() { if (confirm('Reset all data?')) { resetAll(); showToast('Reset complete', 'info') } }
</script>
