<template>
  <q-card style="min-width: 340px">
    <q-card-section>
      <div class="text-h6">Add Block Schedule</div>
      <div class="text-caption text-grey">Internet is blocked during this window</div>
    </q-card-section>

    <q-card-section class="q-pt-none q-gutter-sm">
      <div class="row q-gutter-sm">
        <q-input
          v-model="form.blockFrom"
          label="Block from"
          type="time"
          outlined dense
          class="col"
        />
        <q-input
          v-model="form.blockUntil"
          label="Until"
          type="time"
          outlined dense
          class="col"
        />
      </div>

      <div class="text-caption text-grey q-mt-sm">Days</div>
      <div class="row q-gutter-xs">
        <q-btn
          v-for="day in DAYS"
          :key="day.value"
          :label="day.label"
          :color="form.days.includes(day.value) ? 'primary' : 'grey-3'"
          :text-color="form.days.includes(day.value) ? 'white' : 'grey-8'"
          dense size="sm" unelevated
          @click="toggleDay(day.value)"
        />
      </div>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Cancel" @click="$emit('cancel')" />
      <q-btn
        unelevated color="primary" label="Save"
        :disable="!isValid"
        @click="save"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import type { DayOfWeek } from '../types';

const props = defineProps<{ deviceId: string }>();
const emit = defineEmits<{
  save: [schedule: { deviceId: string; blockFrom: string; blockUntil: string; days: DayOfWeek[] }];
  cancel: [];
}>();

const DAYS: { label: string; value: DayOfWeek }[] = [
  { label: 'Mo', value: 'mon' },
  { label: 'Tu', value: 'tue' },
  { label: 'We', value: 'wed' },
  { label: 'Th', value: 'thu' },
  { label: 'Fr', value: 'fri' },
  { label: 'Sa', value: 'sat' },
  { label: 'Su', value: 'sun' },
];

const form = reactive({
  blockFrom: '22:00',
  blockUntil: '07:00',
  days: ['mon', 'tue', 'wed', 'thu', 'fri'] as DayOfWeek[],
});

const isValid = computed(() => form.blockFrom && form.blockUntil && form.days.length > 0);

function toggleDay(day: DayOfWeek) {
  const idx = form.days.indexOf(day);
  if (idx >= 0) form.days.splice(idx, 1);
  else form.days.push(day);
}

function save() {
  emit('save', {
    deviceId: props.deviceId,
    blockFrom: form.blockFrom,
    blockUntil: form.blockUntil,
    days: [...form.days],
  });
}
</script>
