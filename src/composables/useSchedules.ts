import { useDeviceStore } from '../stores/deviceStore';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import type { DayOfWeek } from '../types';

export interface RawSchedule {
  id: string;
  device_id: string;
  device_name: string;
  mac: string;
  block_from: string;
  block_until: string;
  days: string; // JSON string
  enabled: number;
  created_at: string;
}

export function useSchedules(deviceId?: string) {
  const store = useDeviceStore();
  const { schedules } = storeToRefs(store);

  const deviceSchedules = computed(() => {
    const raw = schedules.value as unknown as RawSchedule[];
    if (!deviceId) return raw;
    return raw.filter((s) => s.device_id === deviceId);
  });

  function parseDays(daysJson: string): DayOfWeek[] {
    try {
      return JSON.parse(daysJson);
    } catch {
      return [];
    }
  }

  return {
    schedules,
    deviceSchedules,
    parseDays,
    fetchSchedules: store.fetchSchedules,
    addSchedule: store.addSchedule,
    toggleSchedule: store.toggleSchedule,
    deleteSchedule: store.deleteSchedule,
  };
}
