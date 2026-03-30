<template>
  <div class="fade-in">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div class="card"><div class="card-header">Employee Defaults</div><div class="card-body space-y-3">
        <div class="field-group"><div class="label">Default Payee Name</div><input type="text" v-model="state.settings.payeeName"/></div>
        <div class="field-group"><div class="label">Payment Period</div><input type="text" v-model="state.settings.paymentDate"/></div>
        <div class="field-group"><div class="label">Default Payment Method</div><select v-model="state.settings.paymentMethod"><option>Monthly</option><option>Bi-Weekly</option><option>Weekly</option><option>Per Load</option></select></div>
        <div class="field-group"><div class="label">Default Pay Rate (%)</div><input type="number" v-model.number="state.settings.payRate" min="0" max="100"/></div>
        <div class="field-group"><div class="label">Default Tax Status</div><select v-model="state.settings.taxStatus"><option value="1099">1099</option><option value="W-2">W-2</option></select></div>
      </div></div>
      <div class="card"><div class="card-header">Company Info</div><div class="card-body space-y-3">
        <div class="field-group"><div class="label">Company Name</div><input type="text" v-model="state.settings.companyName"/></div>
        <div class="field-group"><div class="label">Company Email</div><input type="email" v-model="state.settings.companyEmail"/></div>
        <div class="field-group"><div class="label">Company Phone</div><input type="text" v-model="state.settings.companyPhone"/></div>
      </div></div>
      <div class="card"><div class="card-header">Email Configuration</div><div class="card-body space-y-3">
        <div class="field-group"><div class="label">Default Recipient</div><input type="email" v-model="state.settings.defaultEmail"/></div>
        <div class="field-group"><div class="label">CC Email</div><input type="email" v-model="state.settings.ccEmail"/></div>
        <div class="field-group"><div class="label">Email Provider</div><select v-model="state.settings.emailProvider"><option value="mailto">Default (mailto)</option><option value="gmail">Gmail</option><option value="outlook">Outlook</option></select></div>
      </div></div>
      <div class="card"><div class="card-header">Tax & Additional</div><div class="card-body space-y-3">
        <div class="field-group"><div class="label">Allowances</div><input type="number" v-model.number="state.settings.allowances" min="0"/></div>
        <div class="field-group"><div class="label">Additional %</div><input type="number" v-model.number="state.settings.additionalPct" min="0" max="100" step="0.01"/></div>
        <div class="field-group"><div class="label">Additional Amount ($)</div><input type="number" v-model.number="state.settings.additionalAmt" min="0" step="0.01" placeholder="0.00"/></div>
      </div></div>
    </div>
    <div class="flex gap-3 mt-4">
      <button class="btn btn-primary" @click="showToast('Settings saved', 'success')">Save Settings</button>
      <button class="btn btn-danger" @click="doReset()">Reset All Data</button>
    </div>
  </div>
</template>

<script setup>
import { usePayroll } from '../composables/usePayroll'
import { useToast } from '../composables/useToast'
const { state, resetAll } = usePayroll()
const { showToast } = useToast()
function doReset() { if (confirm('Reset all data?')) { resetAll(); showToast('Reset complete', 'info') } }
</script>
