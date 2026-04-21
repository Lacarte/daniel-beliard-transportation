<template>
  <ToastNotification />

  <!-- Mobile menu button -->
  <button class="lg:hidden fixed top-3 left-3 z-[60] text-white p-2 rounded-xl active:scale-95 transition-transform" style="background:rgba(255,255,255,.1); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);" @click="sidebarOpen = !sidebarOpen">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
  </button>
  <div v-if="sidebarOpen" class="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" @click="sidebarOpen = false"></div>

  <Sidebar :open="sidebarOpen" @close="sidebarOpen = false" />

  <main class="min-h-screen lg:ml-64 p-3 sm:p-5 pt-14 lg:pt-5 relative">
    <!-- Background gradient -->
    <div class="absolute top-0 left-0 right-0 h-56 sm:h-72 pointer-events-none z-0 overflow-hidden" style="background:linear-gradient(145deg, #070b1a 0%, #0d1a3a 40%, #1e3a8a 100%); border-radius:0 0 2rem 2rem;">
      <!-- Subtle noise texture overlay -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image:url('data:image/svg+xml,<svg viewBox=&quot;0 0 256 256&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;><filter id=&quot;n&quot;><feTurbulence type=&quot;fractalNoise&quot; baseFrequency=&quot;0.9&quot; numOctaves=&quot;4&quot; stitchTiles=&quot;stitch&quot;/></filter><rect width=&quot;100%25&quot; height=&quot;100%25&quot; filter=&quot;url(%23n)&quot;/></svg>');"></div>
      <img src="/images/truck-bg.jpg" alt="" class="absolute right-0 top-0 w-3/4 h-full object-cover object-right opacity-[0.08]" style="mask-image:linear-gradient(to left, black 10%, transparent 70%); filter:grayscale(1) brightness(2);" />
      <!-- Gold accent glow -->
      <div class="absolute -bottom-20 -left-20 w-60 h-60 rounded-full opacity-[0.07]" style="background:radial-gradient(circle, #fbbf24, transparent 70%);"></div>
    </div>

    <!-- Mobile Header -->
    <header class="sm:hidden mb-4 relative z-10">
      <div class="px-1 pt-2 pb-6">
        <div class="flex items-center justify-between mb-3">
          <div class="text-white/40 text-[0.65rem] font-semibold tracking-[0.15em] uppercase">Welcome back</div>
          <div class="flex gap-2">
            <button @click="toggle()" class="w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 transition-transform" style="background:rgba(255,255,255,.08); backdrop-filter:blur(4px);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:.6">
                <template v-if="isDark"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></template>
                <template v-else><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></template>
              </svg>
            </button>
            <router-link to="/settings" class="w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 transition-transform" style="background:rgba(255,255,255,.08); backdrop-filter:blur(4px);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </router-link>
            <router-link to="/dashboard" class="w-8 h-8 rounded-lg flex items-center justify-center active:scale-95 transition-transform" style="background:rgba(255,255,255,.08); backdrop-filter:blur(4px);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </router-link>
          </div>
        </div>
        <div class="text-white font-display font-extrabold text-2xl leading-tight tracking-tight">{{ state.settings.payeeName }}</div>
        <div class="text-amber-400/50 text-[0.65rem] font-bold mt-1.5 tracking-[0.12em] uppercase flex items-center gap-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          {{ state.settings.companyName }}
        </div>
      </div>

      <!-- Floating info card -->
      <div class="mx-1 rounded-2xl info-card overflow-hidden" style="background:#fff; box-shadow:0 4px 24px rgba(0,0,0,.08), 0 0 0 1px rgba(0,0,0,.03);">
        <div class="grid grid-cols-4 divide-x divide-gray-100">
          <div class="flex flex-col items-center py-3 px-1.5 gap-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
            <span class="text-[0.55rem] font-bold text-gray-400 uppercase tracking-wider">Period</span>
            <div class="flex flex-col items-center gap-0.5">
              <span class="text-[0.6rem] font-bold text-blue-600 bg-blue-50 rounded px-1.5 py-0.5 leading-none">{{ state.settings.paymentDate.split('-')[0] }}</span>
              <span class="text-[0.6rem] font-bold text-blue-600 bg-blue-50 rounded px-1.5 py-0.5 leading-none">{{ state.settings.paymentDate.split('-')[1] }}</span>
            </div>
          </div>
          <div class="flex flex-col items-center py-3 px-1.5 gap-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span class="text-[0.55rem] font-bold text-gray-400 uppercase tracking-wider">Tax</span>
            <span class="text-sm font-extrabold text-emerald-600 font-display">{{ state.settings.taxStatus }}</span>
          </div>
          <div class="flex flex-col items-center py-3 px-1.5 gap-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span class="text-[0.55rem] font-bold text-gray-400 uppercase tracking-wider">Rate</span>
            <span class="text-sm font-extrabold text-amber-600 font-display">{{ state.settings.payRate }}%</span>
          </div>
          <div class="flex flex-col items-center py-3 px-1.5 gap-1">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <span class="text-[0.55rem] font-bold text-gray-400 uppercase tracking-wider">Pay</span>
            <span class="text-[0.7rem] font-extrabold text-indigo-600 font-display">{{ state.settings.paymentMethod }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Desktop Header -->
    <header class="hidden sm:block card mb-5 relative overflow-hidden z-10">
      <div class="absolute inset-0 opacity-[0.03]" style="background:linear-gradient(135deg, #fbbf24, transparent 50%);"></div>
      <div class="p-4 lg:p-5 flex items-center gap-4 relative z-10">
        <div class="h-12 w-12 rounded-xl flex items-center justify-center text-white font-display font-extrabold text-lg uppercase flex-shrink-0" style="background:linear-gradient(135deg,#f59e0b,#fbbf24); box-shadow:0 4px 12px rgba(245,158,11,.3);">
          {{ initials }}
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="text-xl font-bold text-gray-900 truncate font-display">Welcome back, {{ state.settings.payeeName }}</h1>
          <div class="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
            <span class="text-xs">{{ todayDate }}</span>
            <span class="text-gray-300">&bull;</span>
            <span class="text-xs">Pay Period: <strong class="text-gray-700">{{ state.settings.paymentDate }}</strong></span>
            <span class="badge bg-emerald-50 text-emerald-700 border border-emerald-200/50">{{ state.settings.taxStatus }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3 flex-shrink-0">
          <button :class="['theme-toggle', { dark: isDark }]" @click="toggle()">
            <div class="toggle-knob">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" :stroke="isDark ? '#94a3b8' : '#f59e0b'" stroke-width="2">
                <template v-if="isDark"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></template>
                <template v-else><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/></template>
              </svg>
            </div>
          </button>
          <router-link to="/settings" class="btn btn-outline text-xs py-1.5 px-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg>
            Settings
          </router-link>
        </div>
      </div>
    </header>

    <router-view class="relative z-10" v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import Sidebar from './components/Sidebar.vue'
import ToastNotification from './components/ToastNotification.vue'
import { usePayroll } from './composables/usePayroll'
import { useTheme } from './composables/useTheme'

const { state } = usePayroll()
const { isDark, toggle } = useTheme()
const sidebarOpen = ref(false)

const initials = computed(() => state.settings.payeeName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase())
const todayDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
const shortDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
</script>
