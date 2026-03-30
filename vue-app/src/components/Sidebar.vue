<template>
  <aside :class="['fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full']" style="background:#1e3a8a;">
    <div class="py-4 px-4 flex items-center justify-center gap-2 border-b border-blue-800">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFC000" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>
      <span class="text-white font-bold text-lg tracking-wide">SUNSHINE TRANS</span>
    </div>
    <nav class="flex-1 flex flex-col pt-1">
      <router-link v-for="item in nav" :key="item.to" :to="item.to" class="sidebar-link" exact-active-class="active" @click="$emit('close')">
        <span v-html="item.icon"></span>{{ item.label }}
      </router-link>
    </nav>
    <div class="px-4 py-3 border-t border-blue-800 text-blue-200 text-xs text-center">&copy; 2026 Sunshine Trans INC</div>
  </aside>
</template>

<script setup>
defineProps({ open: Boolean })
defineEmits(['close'])
const icon = (d) => `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${d}</svg>`
const nav = [
  { to: '/', label: 'Load Manager', icon: icon('<rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>') },
  { to: '/dashboard', label: 'Dashboard', icon: icon('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>') },
  { to: '/reports', label: 'Reports', icon: icon('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>') },
  { to: '/paystub', label: 'Pay Stub', icon: icon('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>') },
  { to: '/history', label: 'Pay History', icon: icon('<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>') },
  { to: '/settings', label: 'Settings', icon: icon('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09"/>') },
]
</script>
