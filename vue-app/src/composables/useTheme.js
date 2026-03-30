import { ref, watchEffect } from 'vue'

const isDark = ref(localStorage.getItem('sunshine_theme') === 'dark')

watchEffect(() => {
  document.body.classList.toggle('dark', isDark.value)
  localStorage.setItem('sunshine_theme', isDark.value ? 'dark' : 'light')
})

export function useTheme() {
  function toggle() { isDark.value = !isDark.value }
  return { isDark, toggle }
}
