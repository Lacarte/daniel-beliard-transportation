<template>
  <div class="fade-in">
    <div class="flex items-center justify-between mb-5 flex-wrap gap-2 sm:pl-0 pl-8">
      <h2 class="text-2xl font-bold text-gray-900 font-display">Pay History</h2>
      <button class="btn btn-gold text-xs" @click="save()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Save Current Period
      </button>
    </div>

    <template v-if="state.history.length">
      <!-- Summary -->
      <div class="grid grid-cols-3 gap-2 mb-4 stagger-in">
        <div class="card p-3 text-center">
          <div class="label">Periods</div>
          <div class="text-xl font-extrabold text-gray-900 font-display mt-1">{{ state.history.length }}</div>
        </div>
        <div class="card p-3 text-center">
          <div class="label">Total Gross</div>
          <div class="text-lg font-extrabold text-amber-600 font-mono mt-1">{{ fmt(totalGross) }}</div>
        </div>
        <div class="card p-3 text-center">
          <div class="label">Total Net</div>
          <div class="text-lg font-extrabold font-mono mt-1" :style="{color: totalNet >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(totalNet) }}</div>
        </div>
      </div>

      <!-- History cards -->
      <div class="space-y-3">
        <div v-for="(h, i) in state.history" :key="i" class="card overflow-hidden">
          <!-- Top accent -->
          <div class="h-1" style="background:linear-gradient(90deg, #fbbf24, #f59e0b, transparent);"></div>
          <div class="p-4">
            <!-- Header row -->
            <div class="flex items-start justify-between mb-3">
              <div>
                <div class="font-bold text-base text-gray-900 font-display">{{ h.period }}</div>
                <div class="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {{ h.payee }}
                  <span>&middot;</span>
                  {{ h.loadCount || '?' }} loads
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[0.6rem] text-gray-400 font-medium">{{ h.savedAt }}</span>
                <button class="btn btn-danger text-xs py-1.5 px-2" @click="removeHistory(i)" title="Delete">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                </button>
              </div>
            </div>
            <!-- Stats -->
            <div class="grid grid-cols-3 gap-2">
              <div class="rounded-lg p-2.5 text-center bg-amber-50">
                <div class="text-[0.55rem] font-bold text-gray-400 uppercase tracking-wider">Gross</div>
                <div class="font-bold text-sm text-amber-700 font-mono mt-0.5">{{ fmt(h.gross) }}</div>
              </div>
              <div class="rounded-lg p-2.5 text-center bg-red-50">
                <div class="text-[0.55rem] font-bold text-gray-400 uppercase tracking-wider">Deductions</div>
                <div class="font-bold text-sm text-red-600 font-mono mt-0.5">{{ fmt(h.deductions || 0) }}</div>
              </div>
              <div class="rounded-lg p-2.5 text-center" :class="h.net >= 0 ? 'bg-green-50' : 'bg-red-50'">
                <div class="text-[0.55rem] font-bold text-gray-400 uppercase tracking-wider">Net Pay</div>
                <div class="font-bold text-sm font-mono mt-0.5" :style="{color: h.net >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(h.net) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div v-else class="card">
      <div class="card-body text-center py-16">
        <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <p class="text-base font-semibold text-gray-400 font-display">No history yet</p>
        <p class="text-sm text-gray-400 mt-1">Save a pay period to see it here</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePayroll } from '../composables/usePayroll'
import { useToast } from '../composables/useToast'
const { state, fmt, saveToHistory, removeHistory } = usePayroll()
const { showToast } = useToast()
function save() { saveToHistory(); showToast('Saved to history', 'success') }

const totalGross = computed(() => state.history.reduce((s, h) => s + (h.gross || 0), 0))
const totalNet = computed(() => state.history.reduce((s, h) => s + (h.net || 0), 0))
</script>
