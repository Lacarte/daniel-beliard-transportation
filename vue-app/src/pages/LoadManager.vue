<template>
  <div class="fade-in">
    <!-- LIST VIEW -->
    <template v-if="!editing">
      <!-- Title + Create -->
      <div class="flex items-center justify-between mb-5 sm:pl-0 pl-8">
        <h2 class="text-xl sm:text-2xl font-extrabold text-gray-900 font-display">Load Manager</h2>
        <button class="btn btn-gold text-xs sm:text-sm rounded-full px-5" @click="startCreate()">+ New Load</button>
      </div>

      <!-- Period toggles + filters in one compact bar -->
      <div class="card mb-3">
        <div class="p-2.5 sm:p-3">
          <!-- Period buttons top row -->
          <div class="flex items-center gap-1.5 mb-2">
            <button v-for="p in periods" :key="p.key" :class="['px-4 py-1.5 rounded-lg text-xs font-semibold transition-all', period === p.key ? 'bg-blue-900 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50']" @click="period = p.key">{{ p.label }}</button>
            <div class="flex-1"></div>
            <!-- Collapse filter toggle on mobile -->
            <button class="sm:hidden text-xs text-gray-500 flex items-center gap-1" @click="showFilters = !showFilters">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filter
            </button>
          </div>
          <!-- Filter row: always on desktop, toggleable on mobile -->
          <div :class="['flex flex-wrap gap-2', showFilters ? '' : 'hidden sm:flex']">
            <input type="text" v-model="search" placeholder="Search..." class="flex-1 min-w-[120px] max-w-[200px] text-xs sm:text-sm py-1.5"/>
            <select v-model="filterStatus" class="text-xs sm:text-sm py-1.5 w-auto min-w-[100px]">
              <option value="">All Status</option>
              <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
            </select>
            <select v-model="filterDriver" class="text-xs sm:text-sm py-1.5 w-auto min-w-[100px]">
              <option value="">All Drivers</option>
              <option v-for="d in drivers" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Period Summary -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4 stagger-in">
        <div class="card p-3 text-center overflow-hidden">
          <div class="text-[0.55rem] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Loads</div>
          <div class="text-2xl font-extrabold text-gray-900 font-display mt-0.5">{{ agg.count }}</div>
        </div>
        <div class="card p-3 text-center overflow-hidden">
          <div class="text-[0.55rem] sm:text-xs font-bold text-emerald-500 uppercase tracking-wider">Gross</div>
          <div class="text-base sm:text-xl font-extrabold text-emerald-700 font-mono mt-0.5">{{ fmt(agg.totalGross) }}</div>
        </div>
        <div class="card p-3 text-center overflow-hidden">
          <div class="text-[0.55rem] sm:text-xs font-bold text-red-400 uppercase tracking-wider">Deductions</div>
          <div class="text-base sm:text-xl font-extrabold text-red-600 font-mono mt-0.5">{{ fmt(agg.totalDeductions) }}</div>
        </div>
        <div class="rounded-xl p-3 text-center overflow-hidden" :style="{background: agg.netPay >= 0 ? 'linear-gradient(135deg,#1e3a8a,#2563eb)' : 'linear-gradient(135deg,#dc2626,#ef4444)'}">
          <div class="text-[0.55rem] sm:text-xs font-bold text-white/50 uppercase tracking-wider">Net Pay</div>
          <div class="text-base sm:text-xl font-extrabold text-white font-mono mt-0.5">{{ fmt(agg.netPay) }}</div>
        </div>
      </div>

      <!-- Load List -->
      <div class="sm:card">
        <div class="sm:card-body sm:p-4">
          <!-- Desktop Header -->
          <div class="hidden md:grid font-bold text-xs uppercase tracking-wider text-gray-500" style="grid-template-columns:80px 2fr 1fr 80px 90px 90px 90px 110px; gap:0.75rem; padding:0.65rem 1rem; border-bottom:2px solid #e5e7eb;">
            <span>Invoice #</span><span>Load</span><span>Driver</span><span>Status</span><span class="text-right">Gross</span><span class="text-right">Deductions</span><span class="text-right">Net</span><span class="text-center">Actions</span>
          </div>

          <div v-if="!filtered.length" class="text-center py-12 text-gray-400">
            <svg width="48" height="48" class="mx-auto mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <p class="text-lg font-semibold">No loads found</p>
            <p class="text-sm">{{ state.managedLoads.length ? 'Try adjusting your filters' : 'Click "Create New Load" to get started' }}</p>
          </div>

          <div v-for="(l, i) in filtered" :key="l.id">
            <!-- Desktop Row -->
            <div class="hidden md:grid items-center hover:bg-gray-50 transition-colors" style="grid-template-columns:80px 2fr 1fr 80px 90px 90px 90px 110px; gap:0.75rem; padding:0.75rem 1rem; border-bottom:1px solid #f3f4f6;">
              <div class="font-mono text-xs font-bold text-blue-600">{{ l.loadNumber || '-' }}</div>
              <div>
                <div class="font-bold text-sm text-gray-900">{{ l.name || 'Untitled' }}</div>
                <div class="text-xs text-gray-500">{{ l.id }} &middot; {{ l.loadDate }}</div>
              </div>
              <div class="text-sm text-gray-700">{{ l.driverName || '-' }}</div>
              <div><span :class="['badge text-xs', statusClass(l.status)]">{{ l.status }}</span></div>
              <div class="text-right font-semibold text-sm font-mono">{{ fmt(calcLoad(l).gross) }}</div>
              <div class="text-right font-semibold text-sm text-red-600 font-mono">{{ fmt(calcLoad(l).totalDeductions) }}</div>
              <div class="text-right font-semibold text-sm font-mono" :style="{color: calcLoad(l).netPay >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(calcLoad(l).netPay) }}</div>
              <div class="flex gap-1.5 justify-center">
                <button class="btn btn-outline text-xs py-1 px-2" @click="exportInvoice(l)" title="Invoice">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </button>
                <button class="btn btn-outline text-xs py-1 px-2" @click="startEdit(findIndex(l))">Edit</button>
                <button class="btn btn-danger text-xs py-1 px-2" @click="doDelete(findIndex(l))">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                </button>
              </div>
            </div>

            <!-- Mobile Card -->
            <div class="md:hidden mb-3 rounded-2xl overflow-hidden" style="background:#fff; box-shadow:0 2px 12px rgba(0,0,0,.05);">
              <!-- Status accent bar -->
              <div class="h-1.5" :style="{background: 'linear-gradient(90deg, ' + statusBorderColor(l.status) + ', transparent)'}"></div>
              <!-- Content -->
              <div class="px-4 pt-3 pb-2.5">
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1 min-w-0 mr-3">
                    <div v-if="l.loadNumber" class="text-[0.6rem] font-bold text-blue-500 font-mono tracking-wide mb-0.5">#{{ l.loadNumber }}</div>
                    <div class="font-extrabold text-[0.95rem] text-gray-900 leading-snug">{{ l.name || 'Untitled' }}</div>
                    <div class="flex items-center gap-2 mt-1 text-[0.7rem] text-gray-400 font-medium">
                      <span class="flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        {{ l.driverName || '-' }}
                      </span>
                      <span>&middot;</span>
                      <span>{{ l.loadDate }}</span>
                    </div>
                  </div>
                  <span :class="['px-2.5 py-1 rounded-full text-[0.6rem] font-bold whitespace-nowrap flex-shrink-0', statusClass(l.status)]">{{ l.status }}</span>
                </div>
              </div>
              <!-- Financial summary -->
              <div class="flex items-center justify-between mx-4 mb-3 px-3 py-2 rounded-lg" style="background:rgba(0,0,0,.02);">
                <div class="text-center">
                  <div class="text-[0.5rem] font-bold uppercase text-gray-400 tracking-wider">Gross</div>
                  <div class="font-extrabold text-[0.8rem] text-emerald-700 font-mono">{{ fmt(calcLoad(l).gross) }}</div>
                </div>
                <div class="text-center">
                  <div class="text-[0.5rem] font-bold uppercase text-gray-400 tracking-wider">Deduct.</div>
                  <div class="font-extrabold text-[0.8rem] text-red-600 font-mono">{{ fmt(calcLoad(l).totalDeductions) }}</div>
                </div>
                <div class="text-center">
                  <div class="text-[0.5rem] font-bold uppercase text-gray-400 tracking-wider">Net</div>
                  <div class="font-extrabold text-[0.8rem] font-mono" :style="{color: calcLoad(l).netPay >= 0 ? '#22c55e' : '#dc2626'}">{{ fmt(calcLoad(l).netPay) }}</div>
                </div>
              </div>
              <!-- Action bar -->
              <div class="grid grid-cols-4 border-t border-gray-100">
                <button class="py-3 flex flex-col items-center justify-center gap-1 text-[0.65rem] font-semibold text-blue-600 active:bg-blue-50/50 transition-colors" @click="exportInvoice(l)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  Invoice
                </button>
                <button class="py-3 flex flex-col items-center justify-center gap-1 text-[0.65rem] font-semibold text-green-600 active:bg-green-50/50 transition-colors border-l border-gray-100" @click="sharePdf(l)" :disabled="sharingLoad === l.id">
                  <svg v-if="sharingLoad !== l.id" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  {{ sharingLoad === l.id ? '...' : 'Share' }}
                </button>
                <button class="py-3 flex flex-col items-center justify-center gap-1 text-[0.65rem] font-semibold text-gray-500 active:bg-gray-50/50 transition-colors border-l border-gray-100" @click="startEdit(findIndex(l))">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>
                <button class="py-3 flex flex-col items-center justify-center gap-1 text-[0.65rem] font-semibold text-red-500 active:bg-red-50/50 transition-colors border-l border-gray-100" @click="doDelete(findIndex(l))">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- EDIT VIEW -->
    <template v-else>
      <div class="flex items-center gap-3 mb-5">
        <button class="btn btn-outline" @click="editing = false">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <h2 class="text-2xl font-bold text-gray-900 font-display">{{ editIndex < 0 ? 'Create New Load' : 'Edit Load' }}</h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div class="card"><div class="card-header">Load Information</div><div class="card-body space-y-3">
          <div class="field-group">
            <div class="label flex items-center gap-1">Load Invoice # <span class="text-red-500 text-[0.6rem]">*required</span></div>
            <input type="text" v-model="form.loadNumber" placeholder="e.g. 12345" class="!border-amber-400/40 !bg-amber-50/5" style="border-width:2px;"/>
          </div>
          <div class="field-group">
            <div class="label">Load Name / Route</div>
            <div class="relative">
              <input type="text" v-model="form.name" placeholder="e.g. Well Logistics INC (NY-FL)" @focus="showNameSuggestions = true" @blur="hideSuggestions" autocomplete="off"/>
              <div v-if="showNameSuggestions && filteredSavedNames.length" class="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl overflow-hidden shadow-lg border border-gray-200 max-h-40 overflow-y-auto saved-names-dropdown">
                <button v-for="n in filteredSavedNames" :key="n" type="button" class="w-full text-left px-3 py-2 text-sm font-semibold hover:bg-blue-50 hover:text-blue-700 transition-colors saved-name-item" @mousedown.prevent="selectName(n)">{{ n }}</button>
              </div>
            </div>
          </div>
          <div class="field-group"><div class="label">Load Amount ($)</div><input type="number" v-model.number="form.amount" min="0" step="0.01" placeholder="0.00"/></div>
          <div class="grid grid-cols-2 gap-3">
            <div class="field-group"><div class="label">Load Date</div><input type="date" v-model="form.loadDate"/></div>
            <div class="field-group"><div class="label">Delivery Date</div><input type="date" v-model="form.deliveryDate"/></div>
          </div>
          <div class="field-group"><div class="label">Status</div><select v-model="form.status"><option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option></select></div>
          <div class="field-group"><div class="label">Notes</div><textarea v-model="form.notes" rows="2" placeholder="Dispatch notes, broker info..."></textarea></div>

          <!-- Documents -->
          <div class="field-group">
            <div class="label">Documents / Paperwork</div>
            <label class="doc-upload-zone" @dragover.prevent="dragOver = true" @dragleave="dragOver = false" @drop.prevent="handleDrop($event)" :class="{ 'drag-active': dragOver }">
              <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" class="hidden" ref="fileInput" @change="handleFiles($event)"/>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="opacity-40"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span class="text-xs font-bold text-gray-400">Tap to upload or drag & drop</span>
              <span class="text-[0.65rem] text-gray-400">Images, PDF, Word, Excel — max 2MB each</span>
            </label>
            <!-- File list -->
            <div v-if="form.documents && form.documents.length" class="mt-2 space-y-1.5">
              <div v-for="(doc, di) in form.documents" :key="di" class="doc-item">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <div class="doc-icon" :style="{background: docColor(doc.type)}">
                    {{ docExt(doc.name) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-sm font-bold text-gray-700 truncate doc-name">{{ doc.name }}</div>
                    <div class="text-[0.65rem] text-gray-400">{{ formatFileSize(doc.size) }} &middot; {{ doc.addedAt }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <button type="button" class="doc-action-btn text-blue-500" @click="previewDoc(doc)" title="Preview">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                  <button type="button" class="doc-action-btn text-red-500" @click="form.documents.splice(di, 1)" title="Remove">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div></div>

        <div class="card"><div class="card-header">Driver & Pay</div><div class="card-body space-y-3">
          <div class="field-group"><div class="label">Driver Name</div><input type="text" v-model="form.driverName"/></div>
          <div class="grid grid-cols-2 gap-3">
            <div class="field-group"><div class="label">Pay Rate (%)</div><input type="number" v-model.number="form.payRate" min="0" max="100"/></div>
            <div class="field-group"><div class="label">Factoring Rate (%)</div><input type="number" v-model.number="form.factoringRate" min="0" max="100" step="0.1"/></div>
          </div>
          <div class="field-group"><div class="label">Payment Method</div><select v-model="form.payMethod"><option>Monthly</option><option>Bi-Weekly</option><option>Weekly</option><option>Per Load</option></select></div>
          <div class="field-group"><div class="label">Tax Status</div><select v-model="form.taxStatus"><option value="1099">1099</option><option value="W-2">W-2</option></select></div>
        </div></div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <!-- Fuel -->
        <div class="card"><div class="card-header" style="background:linear-gradient(135deg,#991b1b,#dc2626); color:#fff; border-radius:0.75rem 0.75rem 0 0;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 22V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M13 10h4a2 2 0 0 1 2 2v8"/><path d="M19 14v-2a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v4a4 4 0 0 1-4 4h-2"/><circle cx="8" cy="10" r="2"/></svg>
          Fuel Calculator
        </div><div class="card-body">

          <div v-for="(f, i) in form.fuel" :key="i" class="mb-3 p-3 rounded-xl fuel-entry-card">
            <div class="flex items-center justify-between mb-2.5">
              <input type="text" v-model="f.name" placeholder="Fuel stop name" class="text-sm font-bold flex-1 mr-2"/>
              <button class="btn btn-danger text-xs py-1 px-1.5" @click="form.fuel.splice(i, 1)">&times;</button>
            </div>

            <!-- Step 1: Miles -->
            <div class="field-group mb-2">
              <div class="text-[0.6rem] font-bold text-gray-400 uppercase mb-1">Miles</div>
              <input type="number" v-model.number="f.miles" min="0" step="1" placeholder="Enter miles" class="text-sm" @input="calcFuelEntry(f)"/>
            </div>

            <!-- Gallons needed (auto) -->
            <div class="flex items-center gap-2 py-2 px-3 rounded-lg mb-2 fuel-gallons-display">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-50"><path d="M3 22V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/></svg>
              <span class="text-sm font-extrabold">{{ fuelGallons(f) }}</span>
              <span class="text-xs text-gray-500">gallons needed</span>
              <span class="text-[0.6rem] text-gray-400 ml-auto">({{ f.miles || 0 }} mi ÷ 6)</span>
            </div>

            <!-- Step 2: Fuel Price -->
            <div class="field-group mb-2">
              <div class="text-[0.6rem] font-bold text-gray-400 uppercase mb-1">Fuel Price per Gallon ($)</div>
              <input type="number" v-model.number="f.pricePerGallon" min="0" step="0.01" placeholder="e.g. 3.50" class="text-sm" @input="calcFuelEntry(f)"/>
            </div>

            <!-- Total (auto) -->
            <div class="flex justify-between items-center pt-2.5 border-t fuel-entry-border">
              <span class="text-xs text-gray-500">{{ fuelGallons(f) }} gal × ${{ (f.pricePerGallon || 0).toFixed(2) }}</span>
              <span class="text-base font-extrabold text-red-600">{{ fmt(f.amount || 0) }}</span>
            </div>
          </div>

          <button class="btn btn-outline mt-1 w-full justify-center text-sm" @click="addFuelEntry()">+ Add Fuel Stop</button>
          <div class="flex justify-between mt-3 pt-3 border-t font-bold text-sm"><span>Total Fuel</span><span class="text-red-600">{{ fmt(formCalc.fuelTotal) }}</span></div>
        </div></div>
        <!-- Expenses -->
        <div class="card"><div class="card-header" style="background:linear-gradient(135deg,#991b1b,#dc2626); color:#fff; border-radius:0.75rem 0.75rem 0 0;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Expenses
        </div><div class="card-body">
          <div v-for="(e, i) in form.expenses" :key="i" :class="['expense-row transition-opacity', !e.isDriverPay && !e.amount ? 'opacity-50' : '']">
            <input type="text" v-model="e.name" :disabled="e.isDriverPay" :class="['text-sm', e.isDriverPay ? 'driver-pay-label' : '']"/>
            <div class="flex gap-1">
              <input v-if="e.isDriverPay" type="text" :value="fmt(formCalc.driverPay)" disabled class="text-right font-semibold text-sm driver-pay-amount"/>
              <input v-else type="number" v-model.number="e.amount" min="0" step="0.01" placeholder="0.00" class="text-right text-sm"/>
              <button v-if="!e.isDriverPay" class="btn btn-danger text-xs py-1 px-1.5" @click="form.expenses.splice(i,1)">&times;</button>
              <div v-else style="width:30px"></div>
            </div>
          </div>
          <button class="btn btn-outline mt-2 w-full justify-center text-sm" @click="form.expenses.push({name:'',amount:0})">+ Add Expense</button>
          <div class="flex justify-between mt-3 pt-3 border-t font-bold text-sm"><span>Total Expenses</span><span class="text-red-600">{{ fmt(formCalc.expensesTotal) }}</span></div>
        </div></div>
      </div>

      <!-- Summary (sticky on mobile) -->
      <div class="sm:relative sticky bottom-0 z-20 -mx-3 sm:mx-0 mb-0 sm:mb-4">
        <div class="card sm:rounded-xl rounded-none" style="border-color:#1e3a8a; box-shadow:0 -4px 20px rgba(0,0,0,.15);">
          <div class="card-header text-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-50"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Summary
          </div>
          <div class="card-body p-3">
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div class="rounded-lg text-center p-2.5 bg-amber-50"><div class="label text-[0.5rem]">Load Amount</div><div class="text-base font-bold text-amber-700 font-mono">{{ fmt(formCalc.gross) }}</div></div>
              <div class="rounded-lg text-center p-2.5 bg-blue-50">
                <div class="label text-[0.5rem]">Driver Pay ({{ form.payRate }}%)</div>
                <div class="text-base font-bold text-blue-700 font-mono">{{ fmt(formCalc.driverPayGross) }}</div>
                <div class="text-[0.55rem] font-bold text-purple-600 font-mono">- {{ fmt(formCalc.factoring) }} fact.</div>
                <div class="text-xs font-extrabold text-blue-900 pt-0.5 border-t border-blue-200 font-mono">= {{ fmt(formCalc.driverPay) }}</div>
              </div>
              <div class="rounded-lg text-center p-2.5 bg-red-50"><div class="label text-[0.5rem]">Deductions</div><div class="text-base font-bold text-red-600 font-mono">{{ fmt(formCalc.totalDeductions) }}</div></div>
              <div :class="formCalc.netPay >= 0 ? 'bg-green-50' : 'bg-red-50'" class="rounded-lg text-center p-2.5"><div class="label text-[0.5rem]">Net Pay</div><div class="text-base font-bold font-mono" :style="{color: formCalc.netPay >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(formCalc.netPay) }}</div></div>
            </div>
            <!-- Save/Cancel inline -->
            <div class="flex items-center gap-2 mt-3">
              <button class="btn btn-gold flex-grow justify-center py-3 text-sm font-bold tracking-wide" @click="saveForm()">{{ editIndex < 0 ? 'Save Load' : 'Update Load' }}</button>
              <button class="btn btn-outline justify-center px-4 py-3 text-sm font-semibold" @click="editing = false">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </template>
    <!-- Delete Confirmation Modal -->
    <div v-if="deleteModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="deleteModal.open = false">
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" @click="deleteModal.open = false"></div>
      <div class="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl delete-modal-card">
        <!-- Icon -->
        <div class="flex justify-center pt-6 pb-2">
          <div class="w-16 h-16 rounded-full flex items-center justify-center delete-modal-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </div>
        </div>
        <!-- Text -->
        <div class="text-center px-6 pb-4">
          <h3 class="text-lg font-bold delete-modal-title">Delete Load</h3>
          <p class="text-sm delete-modal-text">Are you sure you want to delete <span class="font-semibold delete-modal-name">"{{ deleteModal.name }}"</span>? This action cannot be undone.</p>
        </div>
        <!-- Buttons -->
        <div class="flex gap-3 px-6 pb-6">
          <button class="flex-1 py-3 rounded-xl text-sm font-bold active:scale-95 transition-all delete-modal-btn-no" @click="deleteModal.open = false">No</button>
          <button class="flex-1 py-3 rounded-xl text-sm font-bold text-white active:scale-95 transition-all" style="background:linear-gradient(135deg, #ef4444, #dc2626);" @click="confirmDelete()">Yes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { usePayroll } from '../composables/usePayroll'
import { useToast } from '../composables/useToast'
import { jsPDF } from 'jspdf'

const { state, drivers, STATUSES, STATUS_COLORS, calcLoad, getFilteredLoads, getAggregates, getPeriodDates, createLoad, updateLoad, deleteLoad, fmt, DEFAULT_EXPENSE_TEMPLATE } = usePayroll()
const { showToast } = useToast()

// Document upload
const fileInput = ref(null)
const dragOver = ref(false)
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB

function handleFiles(e) {
  processFiles(e.target.files)
  e.target.value = ''
}
function handleDrop(e) {
  dragOver.value = false
  processFiles(e.dataTransfer.files)
}
function processFiles(files) {
  if (!form.value.documents) form.value.documents = []
  Array.from(files).forEach(file => {
    if (file.size > MAX_FILE_SIZE) {
      showToast(`"${file.name}" exceeds 2MB limit`, 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      form.value.documents.push({
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result,
        addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      })
    }
    reader.readAsDataURL(file)
  })
}
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
function docExt(name) {
  return (name || '').split('.').pop().toUpperCase().slice(0, 4)
}
function docColor(type) {
  if (type?.includes('pdf')) return '#dc2626'
  if (type?.includes('image')) return '#3b82f6'
  if (type?.includes('word') || type?.includes('document')) return '#2563eb'
  if (type?.includes('sheet') || type?.includes('excel') || type?.includes('csv')) return '#16a34a'
  return '#64748b'
}
function previewDoc(doc) {
  const w = window.open('', '_blank')
  if (doc.type?.startsWith('image/')) {
    w.document.write(`<html><head><title>${doc.name}</title><style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#111}</style></head><body><img src="${doc.data}" style="max-width:100%;max-height:100vh;object-fit:contain"/></body></html>`)
  } else if (doc.type === 'application/pdf') {
    w.document.write(`<html><head><title>${doc.name}</title></head><body style="margin:0"><iframe src="${doc.data}" style="width:100%;height:100vh;border:none"></iframe></body></html>`)
  } else {
    const a = w.document.createElement('a')
    a.href = doc.data
    a.download = doc.name
    a.click()
    w.close()
  }
  w.document.close()
}

// Fuel calculator (6 miles per gallon — gallons = miles ÷ 6)
function fuelGallons(f) {
  const miles = parseFloat(f.miles) || 0
  return Math.round((miles / 6) * 100) / 100
}
function calcFuelEntry(f) {
  const gallons = fuelGallons(f)
  const price = parseFloat(f.pricePerGallon) || 0
  f.amount = Math.round(gallons * price * 100) / 100
}
function addFuelEntry() {
  form.value.fuel.push({ name: 'Fuel', miles: 0, pricePerGallon: 0, amount: 0 })
}

// Saved load names
const showNameSuggestions = ref(false)
const savedNames = computed(() => {
  const stored = JSON.parse(localStorage.getItem('sunshine_saved_names') || '[]')
  const fromLoads = state.managedLoads.map(l => l.name).filter(Boolean)
  return [...new Set([...stored, ...fromLoads])].sort()
})
const filteredSavedNames = computed(() => {
  const q = (form.value.name || '').toLowerCase()
  return savedNames.value.filter(n => !q || n.toLowerCase().includes(q))
})
function selectName(n) { form.value.name = n; showNameSuggestions.value = false }
function hideSuggestions() { setTimeout(() => { showNameSuggestions.value = false }, 150) }
function saveName(name) {
  if (!name?.trim()) return
  const stored = JSON.parse(localStorage.getItem('sunshine_saved_names') || '[]')
  if (!stored.includes(name.trim())) {
    stored.push(name.trim())
    localStorage.setItem('sunshine_saved_names', JSON.stringify(stored))
  }
}

// Filters
const search = ref('')
const showFilters = ref(false)
const filterStatus = ref('')
const filterDriver = ref('')
const period = ref('all')
const periods = [{ key: 'week', label: 'Week' }, { key: 'month', label: 'Month' }, { key: 'year', label: 'Year' }, { key: 'all', label: 'All' }]

const filters = computed(() => {
  const f = { search: search.value, status: filterStatus.value || undefined, driver: filterDriver.value || undefined }
  if (period.value !== 'all') Object.assign(f, getPeriodDates(period.value))
  return f
})
const filtered = computed(() => getFilteredLoads(filters.value))
const agg = computed(() => getAggregates(filters.value))

function statusClass(s) { return STATUS_COLORS[s] ? `${STATUS_COLORS[s].bg} ${STATUS_COLORS[s].text}` : 'bg-gray-100 text-gray-600' }
const STATUS_BORDER = { pending:'#eab308', 'in-transit':'#3b82f6', delivered:'#8b5cf6', paid:'#16a34a', cancelled:'#dc2626' }
function statusBorderColor(s) { return STATUS_BORDER[s] || '#d1d5db' }
function findIndex(l) { return state.managedLoads.indexOf(l) }

// Edit
const editing = ref(false)
const editIndex = ref(-1)
const form = ref({})

const formCalc = computed(() => calcLoad(form.value))

function startCreate() {
  editIndex.value = -1
  form.value = {
    loadNumber: '', name: '', amount: 0, loadDate: new Date().toISOString().slice(0, 10), deliveryDate: '', status: 'pending',
    driverName: state.settings.payeeName || '', payRate: state.settings.payRate || 20, factoringRate: state.settings.factoringRate ?? 2.5,
    payMethod: state.settings.paymentMethod || 'Monthly', taxStatus: state.settings.taxStatus || '1099',
    fuel: [], expenses: JSON.parse(JSON.stringify(state.settings.expenseTemplate || DEFAULT_EXPENSE_TEMPLATE)), notes: '',
    documents: [],
  }
  editing.value = true
}

function startEdit(i) {
  editIndex.value = i
  form.value = JSON.parse(JSON.stringify(state.managedLoads[i]))
  editing.value = true
}

function saveForm() {
  if (!form.value.loadNumber?.trim()) { showToast('Enter a Load Invoice #', 'error'); return }
  if (!form.value.name?.trim()) { showToast('Enter a load name', 'error'); return }
  saveName(form.value.name)
  if (editIndex.value >= 0) {
    updateLoad(editIndex.value, form.value)
    showToast('Load updated', 'success')
  } else {
    createLoad(form.value)
    showToast('Load created', 'success')
  }
  editing.value = false
}

const deleteModal = ref({ open: false, index: -1, name: '' })
function doDelete(i) {
  const load = state.managedLoads[i]
  deleteModal.value = { open: true, index: i, name: load?.name || 'this load' }
}
function confirmDelete() {
  deleteLoad(deleteModal.value.index)
  deleteModal.value.open = false
  showToast('Load deleted', 'info')
}

function exportInvoice(l) {
  const c = calcLoad(l)
  const s = state.settings
  const w = window.open('', '_blank')
  w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Invoice #${l.loadNumber||''} - ${l.name}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;background:#fff;color:#1a1a1a;padding:20px;max-width:800px;margin:0 auto}
.header{text-align:center;padding:24px;background:linear-gradient(135deg,#1e3a8a,#2563eb);border-radius:12px;margin-bottom:24px}
.header h1{color:#fff;font-size:1.5rem;font-weight:800;letter-spacing:0.05em}
.header p{color:rgba(255,255,255,.7);font-size:0.8rem;margin-top:4px}
.meta{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
.meta-card{padding:12px 16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0}
.meta-card .lbl{font-size:0.65rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em}
.meta-card .val{font-size:0.95rem;font-weight:600;color:#1e293b;margin-top:2px}
table{width:100%;border-collapse:collapse;margin-bottom:20px}
th{background:#f1f5f9;padding:8px 12px;text-align:left;font-size:0.7rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.04em;border-bottom:2px solid #e2e8f0}
td{padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:0.85rem}
td.amt{text-align:right;font-weight:600;font-family:'Courier New',monospace}
.totals{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:24px}
.total-box{text-align:center;padding:16px;border-radius:10px}
.total-box .lbl{font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px}
.total-box .val{font-size:1.3rem;font-weight:800}
.gross-box{background:#fef3c7;border:1px solid #fde68a}.gross-box .lbl{color:#92400e}.gross-box .val{color:#92400e}
.ded-box{background:#fee2e2;border:1px solid #fca5a5}.ded-box .lbl{color:#991b1b}.ded-box .val{color:#dc2626}
.net-box{background:${c.netPay>=0?'#dcfce7;border:1px solid #86efac':'#fee2e2;border:1px solid #fca5a5'}}.net-box .lbl{color:${c.netPay>=0?'#166534':'#991b1b'}}.net-box .val{color:${c.netPay>=0?'#16a34a':'#dc2626'}}
.footer{margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;color:#94a3b8;font-size:0.7rem}
.btn-bar{position:fixed;bottom:20px;right:20px;display:flex;gap:10px}
.btn-bar button{color:#fff;border:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:0.9rem;cursor:pointer;box-shadow:0 4px 15px rgba(0,0,0,.2);display:flex;align-items:center;gap:8px}
.print-btn{background:#1e3a8a}
@media print{.btn-bar{display:none}}
@media(max-width:600px){.meta{grid-template-columns:1fr 1fr}.totals{grid-template-columns:1fr 1fr}}
</style></head><body>
<div class="header">
  <h1>${s.companyName}</h1>
  <p>Load Invoice${l.loadNumber?' #'+l.loadNumber:''}</p>
</div>
<div class="meta">
  <div class="meta-card"><div class="lbl">Load Invoice #</div><div class="val" style="font-family:'Courier New',monospace;font-size:1.1rem;color:#1e3a8a">${l.loadNumber||'N/A'}</div></div>
  <div class="meta-card"><div class="lbl">Load Date</div><div class="val">${l.loadDate||'N/A'}</div></div>
  <div class="meta-card"><div class="lbl">Delivery Date</div><div class="val">${l.deliveryDate||'N/A'}</div></div>
  <div class="meta-card"><div class="lbl">Load / Route</div><div class="val">${l.name}</div></div>
  <div class="meta-card"><div class="lbl">Driver</div><div class="val">${l.driverName||'-'}</div></div>
  <div class="meta-card"><div class="lbl">Pay Rate</div><div class="val">${l.payRate}%</div></div>
  <div class="meta-card"><div class="lbl">Factoring Rate</div><div class="val">${c.factoringRate}%</div></div>
  <div class="meta-card"><div class="lbl">Tax Status</div><div class="val">${l.taxStatus||'1099'}</div></div>
</div>

<h3 style="font-size:0.85rem;font-weight:700;margin-bottom:8px;color:#1e3a8a">Pay Breakdown</h3>
<table>
<tr><th>Description</th><th style="text-align:right">Amount</th></tr>
<tr><td>Load Amount</td><td class="amt">${fmt(c.gross)}</td></tr>
<tr><td>Driver Pay (${l.payRate}%)</td><td class="amt">${fmt(c.driverPayGross)}</td></tr>
<tr style="border-top:2px solid #e2e8f0"><td><strong>Factoring (${c.factoringRate}%)</strong></td><td class="amt" style="color:#dc2626"><strong>-${fmt(c.factoring)}</strong></td></tr>
<tr><td><strong>Driver Pay After Factoring</strong></td><td class="amt" style="color:#16a34a"><strong>${fmt(c.driverPay)}</strong></td></tr>
</table>

${l.fuel&&l.fuel.length?`<h3 style="font-size:0.85rem;font-weight:700;margin-bottom:8px;color:#dc2626">Fuel Deductions</h3>
<table><tr><th>Description</th><th style="text-align:right">Amount</th></tr>
${l.fuel.map(f=>`<tr><td>${f.name}</td><td class="amt">${fmt(f.amount)}</td></tr>`).join('')}
<tr style="border-top:2px solid #fca5a5"><td><strong>Total Fuel</strong></td><td class="amt" style="color:#dc2626"><strong>${fmt(c.fuelTotal)}</strong></td></tr>
</table>`:''}

<h3 style="font-size:0.85rem;font-weight:700;margin-bottom:8px;color:#dc2626">Expense Deductions</h3>
<table><tr><th>Description</th><th style="text-align:right">Amount</th></tr>
${(l.expenses||[]).map(e=>`<tr><td>${e.name}${e.isDriverPay?' (calculated)':''}</td><td class="amt">${fmt(e.isDriverPay?c.driverPay:e.amount)}</td></tr>`).join('')}
<tr style="border-top:2px solid #fca5a5"><td><strong>Total Expenses</strong></td><td class="amt" style="color:#dc2626"><strong>${fmt(c.expensesTotal)}</strong></td></tr>
</table>

<div class="totals">
  <div class="total-box gross-box"><div class="lbl">Load Amount</div><div class="val">${fmt(c.gross)}</div></div>
  <div class="total-box" style="background:#ede9fe;border:1px solid #c4b5fd"><div class="lbl" style="color:#5b21b6">Factoring</div><div class="val" style="color:#7c3aed">-${fmt(c.factoring)}</div></div>
  <div class="total-box ded-box"><div class="lbl">Total Deductions</div><div class="val">${fmt(c.totalDeductions)}</div></div>
  <div class="total-box net-box"><div class="lbl">Net Pay</div><div class="val">${fmt(c.netPay)}</div></div>
</div>

${l.notes?`<div style="margin-top:20px;padding:12px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0"><div style="font-size:0.65rem;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:4px">Notes</div><div style="font-size:0.85rem;color:#475569">${l.notes}</div></div>`:''}
<div class="footer">Generated on ${new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})} &middot; ${s.companyName}</div>
<div class="btn-bar">
<button class="print-btn" onclick="window.print()">Print / Save PDF</button>
</div>
</body></html>`)
  w.document.close()
  showToast('Invoice opened', 'success')
}

const sharingLoad = ref(null)
async function sharePdf(l) {
  sharingLoad.value = l.id
  const c = calcLoad(l)
  const s = state.settings
  try {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const w = 210, m = 15
    let y = m

    // Header bar
    doc.setFillColor(30, 58, 138)
    doc.roundedRect(m, y, w - m * 2, 28, 4, 4, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text(s.companyName, w / 2, y + 12, { align: 'center' })
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Load Invoice' + (l.loadNumber ? ' #' + l.loadNumber : ''), w / 2, y + 20, { align: 'center' })
    y += 36
    const pageH = 297
    function checkPage(need) { if (y + need > pageH - m) { doc.addPage(); y = m } }

    // Info fields
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    const fields = [
      ['LOAD INVOICE #', l.loadNumber || 'N/A'],
      ['LOAD DATE', l.loadDate || 'N/A'],
      ['DELIVERY DATE', l.deliveryDate || 'N/A'],
      ['LOAD / ROUTE', l.name || '-'],
      ['DRIVER', l.driverName || '-'],
      ['PAY RATE', l.payRate + '%'],
      ['FACTORING RATE', c.factoringRate + '%'],
      ['TAX STATUS', l.taxStatus || '1099'],
    ]
    const colW = (w - m * 2) / 2
    fields.forEach((f, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = m + col * colW + 4
      const fy = y + row * 16
      doc.setFillColor(248, 250, 252)
      doc.roundedRect(m + col * colW, fy, colW - 4, 14, 2, 2, 'F')
      doc.setTextColor(100, 116, 139)
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text(f[0], x, fy + 5)
      doc.setTextColor(30, 41, 59)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(String(f[1]), x, fy + 11)
    })
    y += Math.ceil(fields.length / 2) * 16 + 6

    // Pay breakdown table
    checkPage(40)
    doc.setTextColor(30, 58, 138)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Pay Breakdown', m, y)
    y += 6
    doc.setFillColor(241, 245, 249)
    doc.rect(m, y, w - m * 2, 7, 'F')
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(7)
    doc.text('DESCRIPTION', m + 3, y + 5)
    doc.text('AMOUNT', w - m - 3, y + 5, { align: 'right' })
    y += 9
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    const rows = [
      ['Load Amount', fmt(c.gross)],
      ['Driver Pay (' + l.payRate + '%)', fmt(c.driverPayGross)],
      ['Factoring (' + c.factoringRate + '%)', '-' + fmt(c.factoring)],
      ['Driver Pay After Factoring', fmt(c.driverPay)],
    ]
    rows.forEach((r, i) => {
      if (i === 2) { doc.setDrawColor(200); doc.line(m, y - 1, w - m, y - 1) }
      if (i >= 2) doc.setFont('helvetica', 'bold')
      doc.text(r[0], m + 3, y + 4)
      doc.text(r[1], w - m - 3, y + 4, { align: 'right' })
      y += 7
    })
    y += 4

    // Fuel
    if (l.fuel && l.fuel.length) {
      checkPage(30)
      doc.setTextColor(220, 38, 38)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Fuel Deductions', m, y)
      y += 6
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(30, 41, 59)
      l.fuel.forEach(f => {
        doc.text(f.name, m + 3, y + 4)
        doc.text(fmt(f.amount), w - m - 3, y + 4, { align: 'right' })
        y += 7
      })
      doc.setFont('helvetica', 'bold')
      doc.setDrawColor(200)
      doc.line(m, y - 1, w - m, y - 1)
      doc.text('Total Fuel', m + 3, y + 4)
      doc.setTextColor(220, 38, 38)
      doc.text(fmt(c.fuelTotal), w - m - 3, y + 4, { align: 'right' })
      y += 10
    }

    // Expenses
    checkPage(30)
    doc.setTextColor(220, 38, 38)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Expense Deductions', m, y)
    y += 6
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 41, 59)
    ;(l.expenses || []).forEach(e => {
      checkPage(10)
      doc.setTextColor(30, 41, 59)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(e.name + (e.isDriverPay ? ' (calculated)' : ''), m + 3, y + 4)
      doc.text(fmt(e.isDriverPay ? c.driverPay : e.amount), w - m - 3, y + 4, { align: 'right' })
      y += 7
    })
    doc.setFont('helvetica', 'bold')
    doc.setDrawColor(200)
    doc.line(m, y - 1, w - m, y - 1)
    doc.text('Total Expenses', m + 3, y + 4)
    doc.setTextColor(220, 38, 38)
    doc.text(fmt(c.expensesTotal), w - m - 3, y + 4, { align: 'right' })
    y += 14

    // Summary boxes
    checkPage(35)
    const boxW = (w - m * 2 - 12) / 4
    const boxes = [
      { label: 'LOAD AMOUNT', val: fmt(c.gross), bg: [254, 243, 199], color: [146, 64, 14] },
      { label: 'FACTORING', val: '-' + fmt(c.factoring), bg: [237, 233, 254], color: [124, 58, 237] },
      { label: 'DEDUCTIONS', val: fmt(c.totalDeductions), bg: [254, 226, 226], color: [220, 38, 38] },
      { label: 'NET PAY', val: fmt(c.netPay), bg: c.netPay >= 0 ? [220, 252, 231] : [254, 226, 226], color: c.netPay >= 0 ? [22, 163, 74] : [220, 38, 38] },
    ]
    boxes.forEach((b, i) => {
      const bx = m + i * (boxW + 4)
      doc.setFillColor(...b.bg)
      doc.roundedRect(bx, y, boxW, 22, 3, 3, 'F')
      doc.setTextColor(...b.color)
      doc.setFontSize(5.5)
      doc.setFont('helvetica', 'bold')
      doc.text(b.label, bx + boxW / 2, y + 8, { align: 'center' })
      doc.setFontSize(11)
      doc.text(b.val, bx + boxW / 2, y + 17, { align: 'center' })
    })
    y += 30

    // Footer
    checkPage(15)
    doc.setTextColor(148, 163, 184)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text('Generated on ' + new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + ' · ' + s.companyName, w / 2, y, { align: 'center' })

    // Share or download
    const blob = doc.output('blob')
    const file = new File([blob], 'Invoice-' + (l.loadNumber || l.id) + '.pdf', { type: 'application/pdf' })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ title: 'Invoice ' + (l.loadNumber || ''), files: [file] })
      showToast('PDF shared', 'success')
    } else {
      doc.save('Invoice-' + (l.loadNumber || l.id) + '.pdf')
      showToast('PDF downloaded', 'success')
    }
  } catch (e) {
    if (e.name !== 'AbortError') showToast('Share failed: ' + e.message, 'error')
  }
  sharingLoad.value = null
}
</script>
