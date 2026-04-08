import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Device, Schedule, FritzBoxHost } from "../types";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useDeviceStore = defineStore("devices", () => {
  const devices = ref<Device[]>([]);
  const schedules = ref<Schedule[]>([]);
  const discoveredHosts = ref<FritzBoxHost[]>([]);
  const loading = ref(false);

  const blockedDevices = computed(() =>
    devices.value.filter((d) => d.status === "blocked")
  );

  const onlineDevices = computed(() =>
    devices.value.filter((d) => d.status === "online")
  );

  async function fetchDevices() {
    loading.value = true;
    try {
      const res = await fetch(`${API}/api/devices`);
      const json = await res.json();
      devices.value = json.data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchSchedules() {
    const res = await fetch(`${API}/api/schedules`);
    const json = await res.json();
    schedules.value = json.data;
  }

  async function discoverHosts() {
    loading.value = true;
    try {
      const res = await fetch(`${API}/api/devices/discover`);
      const json = await res.json();
      discoveredHosts.value = json.data;
    } finally {
      loading.value = false;
    }
  }

  async function addDevice(device: Partial<Device>) {
    const res = await fetch(`${API}/api/devices`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(device),
    });
    const json = await res.json();
    devices.value.push(json.data);
  }

  async function addSchedule(schedule: Partial<Schedule>) {
    await fetch(`${API}/api/schedules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(schedule),
    });
    await fetchSchedules();
  }

  async function renameDevice(deviceId: string, name: string) {
    await fetch(`${API}/api/devices/${deviceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const device = devices.value.find((d) => d.id === deviceId);
    if (device) device.name = name;
  }

  async function removeDevice(deviceId: string) {
    await fetch(`${API}/api/devices/${deviceId}`, { method: "DELETE" });
    devices.value = devices.value.filter((d) => d.id !== deviceId);
  }

  async function blockNow(deviceId: string) {
    await fetch(`${API}/api/devices/${deviceId}/block`, { method: "POST" });
    await fetchDevices();
  }

  async function unblockNow(deviceId: string) {
    await fetch(`${API}/api/devices/${deviceId}/unblock`, { method: "POST" });
    await fetchDevices();
  }

  async function toggleSchedule(scheduleId: string) {
    await fetch(`${API}/api/schedules/${scheduleId}/toggle`, { method: "PUT" });
    await fetchSchedules();
  }

  async function deleteSchedule(scheduleId: string) {
    await fetch(`${API}/api/schedules/${scheduleId}`, { method: "DELETE" });
    schedules.value = schedules.value.filter((s) => s.id !== scheduleId);
  }

  return {
    devices, schedules, discoveredHosts, loading,
    blockedDevices, onlineDevices,
    fetchDevices, fetchSchedules, discoverHosts,
    addDevice, addSchedule, renameDevice, removeDevice, blockNow, unblockNow,
    toggleSchedule, deleteSchedule,
  };
});
