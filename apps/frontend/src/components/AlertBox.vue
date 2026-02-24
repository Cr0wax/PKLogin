<script setup lang="ts">
const props = defineProps<{
  type: 'error' | 'success' | 'info';
  message: string;
}>();
</script>

<template>
  <p :class="['alert', `alert-${props.type}`]">{{ props.message }}</p>
</template>
