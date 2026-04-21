<template>
  <div class="fade-in">
    <div class="flex items-center justify-between mb-5 flex-wrap gap-2 sm:pl-0 pl-8">
      <h2 class="text-2xl font-bold text-gray-900 font-display">Pay History</h2>
      <button class="btn btn-success text-xs" @click="save()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Save Current Period
      </button>
    </div>

    <div class="card">
      <div class="card-body">
        <template v-if="state.history.length">
          <div v-for="(h, i) in state.history" :key="i" class="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-0 gap-3">
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900 font-display">{{ h.period }}</div>
              <div class="text-xs text-gray-400 mt-0.5">{{ h.payee }} &middot; {{ h.loadCount || '?' }} loads &middot; {{ h.savedAt }}</div>
            </div>
            <div class="flex items-center gap-4 flex-shrink-0">
              <div class="text-right">
                <div class="text-[0.6rem] text-gray-400 font-semibold uppercase tracking-wider">Gross</div>
                <div class="font-bold text-amber-600 text-sm font-mono">{{ fmt(h.gross) }}</div>
              </div>
              <div class="text-right">
                <div class="text-[0.6rem] text-gray-400 font-semibold uppercase tracking-wider">Net</div>
                <div class="font-bold text-sm font-mono" :style="{color: h.net >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(h.net) }}</div>
              </div>
              <button class="btn btn-danger text-xs py-1.5 px-2" @click="removeHistory(i)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
              </button>
            </div>
          </div>
        </template>
        <div v-else class="text-center py-16">
          <div class="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <p class="text-base font-semibold text-gray-400 font-display">No history yet</p>
          <p class="text-sm text-gray-400 mt-1">Save a pay period to see it here</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePayroll } from '../composables/usePayroll'
import { useToast } from '../composables/useToast'
const { state, fmt, saveToHistory, removeHistory } = usePayroll()
const { showToast } = useToast()
function save() { saveToHistory(); showToast('Saved to history', 'success') }
</script>
