<template>
  <q-chip
    :color="color"
    text-color="white"
    :icon="icon"
    :label="label"
    dense
    square
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Device } from '../types';

const props = defineProps<{ status: Device['status'] }>();

const color = computed(() =>
  ({ online: 'positive', blocked: 'negative', offline: 'grey-6' }[props.status])
);
const icon = computed(() =>
  ({ online: 'wifi', blocked: 'block', offline: 'wifi_off' }[props.status])
);
const label = computed(() => props.status.charAt(0).toUpperCase() + props.status.slice(1));
</script>
