import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

const user = ref(null)
const loading = ref(true)

// Initialize: check current session
supabase.auth.getSession().then(({ data: { session } }) => {
  user.value = session?.user ?? null
  loading.value = false
})

// Listen for auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
  user.value = session?.user ?? null
  loading.value = false
})

async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  })
  if (error) console.error('Google sign-in error:', error.message)
}

async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Sign-out error:', error.message)
  user.value = null
}

const isAuthenticated = computed(() => !!user.value)
const userEmail = computed(() => user.value?.email || '')
const userName = computed(() => {
  const meta = user.value?.user_metadata
  return meta?.full_name || meta?.name || userEmail.value.split('@')[0] || ''
})
const userAvatar = computed(() => user.value?.user_metadata?.avatar_url || '')

export function useAuth() {
  return {
    user,
    loading,
    isAuthenticated,
    userEmail,
    userName,
    userAvatar,
    signInWithGoogle,
    signOut,
  }
}
