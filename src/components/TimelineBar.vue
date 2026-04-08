<template>
  <div class="timeline-wrap">
    <div class="timeline-bar">
      <div
        v-for="hour in 24"
        :key="hour"
        class="timeline-segment"
        :class="isBlocked(hour - 1) ? 'blocked' : 'allowed'"
        :title="`${String(hour - 1).padStart(2, '0')}:00`"
      />
    </div>
    <div class="timeline-labels">
      <span v-for="h in [0, 6, 12, 18, 23]" :key="h" :style="{ left: `${(h / 23) * 100}%` }">
        {{ String(h).padStart(2, '0') }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DayOfWeek } from '../types';

interface BlockWindow {
  block_from: string;
  block_until: string;
  days: DayOfWeek[];
  enabled: number;
}

const props = defineProps<{ windows: BlockWindow[] }>();

const DAY_MAP: Record<number, DayOfWeek> = {
  0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat',
};
const today = DAY_MAP[new Date().getDay()];

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function isBlocked(hour: number): boolean {
  return props.windows.some((w) => {
    if (!w.enabled) return false;
    if (!today || !w.days.includes(today)) return false;
    const from = timeToMinutes(w.block_from);
    const until = timeToMinutes(w.block_until);
    const curr = hour * 60;
    if (from <= until) return curr >= from && curr < until;
    return curr >= from || curr < until;
  });
}
</script>

<style scoped>
.timeline-wrap {
  position: relative;
  padding-bottom: 18px;
}
.timeline-bar {
  display: flex;
  height: 12px;
  border-radius: 6px;
  overflow: hidden;
  gap: 1px;
}
.timeline-segment {
  flex: 1;
  border-radius: 2px;
}
.allowed { background: #66bb6a; }
.blocked { background: #ef5350; }
.timeline-labels {
  position: relative;
  height: 16px;
  font-size: 10px;
  color: #888;
}
.timeline-labels span {
  position: absolute;
  transform: translateX(-50%);
}
</style>
