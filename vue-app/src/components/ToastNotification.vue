<template>
  <transition name="fade">
    <div v-if="toast.show" :class="['toast show', `toast-${toast.type}`]">{{ toast.msg }}</div>
  </transition>
</template>

<script setup>
import { useToast } from '../composables/useToast'
const { toast } = useToast()
</script>
