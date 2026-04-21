<template>
  <div class="min-h-screen flex items-center justify-center p-4" style="background:linear-gradient(145deg, #070b1a 0%, #0d1a3a 40%, #1e3a8a 100%);">
    <!-- Noise overlay -->
    <div class="fixed inset-0 opacity-[0.03] pointer-events-none" style="background-image:url('data:image/svg+xml,<svg viewBox=&quot;0 0 256 256&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;><filter id=&quot;n&quot;><feTurbulence type=&quot;fractalNoise&quot; baseFrequency=&quot;0.9&quot; numOctaves=&quot;4&quot; stitchTiles=&quot;stitch&quot;/></filter><rect width=&quot;100%25&quot; height=&quot;100%25&quot; filter=&quot;url(%23n)&quot;/></svg>');"></div>

    <div class="relative z-10 w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style="background:linear-gradient(135deg,#f59e0b,#fbbf24); box-shadow:0 8px 32px rgba(245,158,11,.3);">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1e3a8a" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/></svg>
        </div>
        <h1 class="text-white font-display font-extrabold text-2xl tracking-tight">SUNSHINE TRANS</h1>
        <p class="text-white/25 text-xs font-medium tracking-[0.2em] uppercase mt-1">INCORPORATED</p>
      </div>

      <!-- Login Card -->
      <div class="rounded-2xl p-6" style="background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); backdrop-filter:blur(20px);">
        <h2 class="text-white font-semibold text-lg mb-1">Welcome</h2>
        <p class="text-white/40 text-sm mb-6">Sign in to manage your loads and payroll</p>

        <button
          @click="signInWithGoogle"
          class="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] hover:shadow-lg"
          style="background:white; color:#1f2937;"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
      </div>

      <!-- Footer -->
      <p class="text-center text-white/15 text-xs mt-6 font-medium tracking-wider">&copy; 2026 Sunshine Trans INC</p>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth'

const { signInWithGoogle } = useAuth()
</script>
