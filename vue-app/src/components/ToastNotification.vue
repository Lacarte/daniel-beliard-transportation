<template>
  <div :class="['toast', `toast-${toast.type}`, { show: toast.show }]">{{ toast.msg }}</div>
</template>

<script setup>
import { useToast } from '../composables/useToast'
const { toast } = useToast()
</script>
