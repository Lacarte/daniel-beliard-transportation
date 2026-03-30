import { ref } from 'vue'

const toast = ref({ msg: '', type: 'info', show: false })
let timer = null

export function useToast() {
  function showToast(msg, type = 'info') {
    clearTimeout(timer)
    toast.value = { msg, type, show: true }
    timer = setTimeout(() => { toast.value.show = false }, 3000)
  }
  return { toast, showToast }
}
