<template>
  <div class="fade-in">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">Pay History</h2>
    <div class="card">
      <div class="card-body">
        <template v-if="state.history.length">
          <div v-for="(h, i) in state.history" :key="i" class="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <div class="font-semibold text-gray-900">{{ h.period }}</div>
              <div class="text-sm text-gray-500">{{ h.payee }} &middot; {{ h.loadCount || '?' }} loads &middot; {{ h.savedAt }}</div>
            </div>
            <div class="flex items-center gap-4">
              <div class="text-right"><div class="text-xs text-gray-500">Gross</div><div class="font-bold text-amber-600">{{ fmt(h.gross) }}</div></div>
              <div class="text-right"><div class="text-xs text-gray-500">Net</div><div class="font-bold" :style="{color: h.net >= 0 ? '#16a34a' : '#dc2626'}">{{ fmt(h.net) }}</div></div>
              <button class="btn btn-danger text-xs py-1 px-2" @click="removeHistory(i)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
              </button>
            </div>
          </div>
        </template>
        <div v-else class="text-center py-12 text-gray-400">
          <p class="text-lg font-semibold">No history yet</p>
          <p class="text-sm">Save a pay period to see it here</p>
        </div>
      </div>
    </div>
    <button class="btn btn-success mt-4" @click="save()">Save Current Period to History</button>
  </div>
</template>

<script setup>
import { usePayroll } from '../composables/usePayroll'
import { useToast } from '../composables/useToast'
const { state, fmt, saveToHistory, removeHistory } = usePayroll()
const { showToast } = useToast()
function save() { saveToHistory(); showToast('Saved to history', 'success') }
</script>
