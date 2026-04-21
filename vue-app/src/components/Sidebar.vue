<template>
  <aside :class="['fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full']" style="background:linear-gradient(180deg, #070b1a 0%, #0d1225 100%);">
    <!-- Logo -->
    <div class="py-5 px-5 flex items-center gap-3 border-b border-white/[.06]">
      <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background:linear-gradient(135deg,#f59e0b,#fbbf24);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/></svg>
      </div>
      <div class="flex-1">
        <div class="text-white font-bold text-sm tracking-wide font-display">SUNSHINE TRANS</div>
        <div class="text-white/30 text-[0.6rem] font-medium tracking-widest">INCORPORATED</div>
      </div>
      <!-- Close button (mobile only) -->
      <button class="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[.06] transition-all active:scale-95" @click="$emit('close')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 flex flex-col pt-3 px-2 gap-0.5">
      <div class="px-3 py-2 text-[0.6rem] font-bold text-white/20 uppercase tracking-[0.15em]">Navigation</div>
      <router-link v-for="item in nav" :key="item.to" :to="item.to" class="sidebar-link rounded-lg" exact-active-class="active" @click="$emit('close')">
        <span v-html="item.icon"></span>{{ item.label }}
      </router-link>
    </nav>

    <!-- Sign In -->
    <div class="px-3 pb-2">
      <button class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-white/60 hover:text-white hover:bg-white/[.06] transition-all active:scale-[0.98]" @click="$emit('login')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Sign In
        <span class="ml-auto text-[0.55rem] font-bold text-amber-400/60 uppercase tracking-wider">Soon</span>
      </button>
    </div>

    <!-- Footer -->
    <div class="px-4 py-3 border-t border-white/[.04]">
      <div class="text-white/15 text-[0.6rem] text-center font-medium tracking-wider">&copy; 2026 Sunshine Trans INC</div>
    </div>
  </aside>
</template>

<script setup>
defineProps({ open: Boolean })
defineEmits(['close', 'login'])
const icon = (d) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`
const nav = [
  { to: '/', label: 'Load Manager', icon: icon('<rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>') },
  { to: '/dashboard', label: 'Dashboard', icon: icon('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>') },
  { to: '/reports', label: 'Reports', icon: icon('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>') },
  { to: '/paystub', label: 'Pay Stub', icon: icon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>') },
  { to: '/history', label: 'Pay History', icon: icon('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>') },
  { to: '/settings', label: 'Settings', icon: icon('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09"/>') },
]
</script>
