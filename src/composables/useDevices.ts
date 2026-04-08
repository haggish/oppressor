import { useDeviceStore } from '../stores/deviceStore';
import { storeToRefs } from 'pinia';

export function useDevices() {
  const store = useDeviceStore();
  const { devices, loading, blockedDevices, onlineDevices } = storeToRefs(store);

  return {
    devices,
    loading,
    blockedDevices,
    onlineDevices,
    fetchDevices: store.fetchDevices,
    addDevice: store.addDevice,
    removeDevice: store.removeDevice,
    blockNow: store.blockNow,
    unblockNow: store.unblockNow,
  };
}
