<template>
  <q-card class="device-card" bordered flat>
    <q-card-section class="row items-center no-wrap q-pb-xs">
      <q-icon :name="deviceIcon" size="28px" color="primary" class="q-mr-sm" />
      <div class="col">
        <div class="text-subtitle1 text-weight-medium">{{ device.name }}</div>
        <div class="text-caption text-grey">{{ device.hostname || device.mac }}</div>
      </div>
      <StatusBadge :status="device.status ?? 'offline'" />
    </q-card-section>

    <q-card-section class="q-pt-xs q-pb-sm">
      <TimelineBar :windows="scheduleWindows" />
    </q-card-section>

    <q-card-actions align="right" class="q-pt-none">
      <q-btn
        flat dense size="sm" color="negative" icon="block" label="Block"
        :disable="device.status === 'blocked'"
        @click="$emit('block', device.id)"
      />
      <q-btn
        flat dense size="sm" color="positive" icon="check_circle" label="Unblock"
        :disable="device.status !== 'blocked'"
        @click="$emit('unblock', device.id)"
      />
      <q-btn flat dense size="sm" icon="edit" @click="$emit('manage', device.id)" />
      <q-btn flat dense size="sm" color="negative" icon="delete_outline" @click="confirmRemove = true" />
    </q-card-actions>

    <q-dialog v-model="confirmRemove">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-subtitle1">Remove {{ device.name }}?</div>
          <div class="text-caption text-grey q-mt-xs">This will also delete all schedules for this device.</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat color="negative" label="Remove" @click="onRemove" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import StatusBadge from './StatusBadge.vue';
import TimelineBar from './TimelineBar.vue';
import type { Device } from '../types';
import { useSchedules } from '../composables/useSchedules';

const props = defineProps<{ device: Device }>();
const emit = defineEmits<{
  block: [id: string];
  unblock: [id: string];
  manage: [id: string];
  remove: [id: string];
}>();

const confirmRemove = ref(false);

function onRemove() {
  confirmRemove.value = false;
  emit('remove', props.device.id);
}

const { deviceSchedules, parseDays } = useSchedules(props.device.id);

const scheduleWindows = computed(() =>
  deviceSchedules.value.map((s) => ({
    block_from: s.block_from,
    block_until: s.block_until,
    days: parseDays(s.days),
    enabled: s.enabled,
  }))
);

const deviceIcon = computed(() => {
  const t = props.device.deviceType?.toLowerCase() ?? '';
  if (t.includes('phone') || t.includes('mobile')) return 'smartphone';
  if (t.includes('tablet')) return 'tablet';
  if (t.includes('laptop') || t.includes('computer')) return 'laptop';
  if (t.includes('tv')) return 'tv';
  return 'devices';
});
</script>

<style scoped>
.device-card {
  transition: box-shadow 0.2s;
}
.device-card:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
}
</style>
