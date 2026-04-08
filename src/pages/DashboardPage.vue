<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-medium">Dashboard</div>
        <div class="text-caption text-grey">{{ devices.length }} managed device(s)</div>
      </div>
      <q-btn unelevated color="primary" icon="search" label="Discover Devices" @click="scanDialog = true" />
    </div>

    <!-- Summary chips -->
    <div class="row q-gutter-sm q-mb-lg">
      <q-chip icon="wifi" color="positive" text-color="white" :label="`${onlineDevices.length} Online`" />
      <q-chip icon="block" color="negative" text-color="white" :label="`${blockedDevices.length} Blocked`" />
      <q-chip icon="wifi_off" color="grey-6" text-color="white" :label="`${offlineCount} Offline`" />
    </div>

    <!-- Device grid -->
    <div v-if="loading" class="row justify-center q-mt-xl">
      <q-spinner color="primary" size="40px" />
    </div>

    <div v-else-if="!devices.length" class="text-center q-mt-xl text-grey">
      <q-icon name="devices" size="64px" />
      <p>No devices yet. Click "Discover Devices" to scan your Fritz!Box.</p>
    </div>

    <div v-else class="row q-gutter-md">
      <div
        v-for="device in devices"
        :key="device.id"
        class="col-xs-12 col-sm-6 col-md-4"
      >
        <DeviceCard
          :device="device"
          @block="blockNow"
          @unblock="unblockNow"
          @manage="router.push(`/device/${$event}`)"
          @remove="removeDevice"
        />
      </div>
    </div>

    <!-- Discover dialog -->
    <q-dialog v-model="scanDialog">
      <DeviceScanner @close="scanDialog = false" />
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDevices } from '../composables/useDevices';
import { useSchedules } from '../composables/useSchedules';
import DeviceCard from '../components/DeviceCard.vue';
import DeviceScanner from '../components/DeviceScanner.vue';

const router = useRouter();
const { devices, loading, blockedDevices, onlineDevices, fetchDevices, blockNow, unblockNow, removeDevice } = useDevices();
const { fetchSchedules } = useSchedules();

const scanDialog = ref(false);
const offlineCount = computed(() => devices.value.filter((d) => (d.status ?? 'offline') === 'offline').length);

onMounted(async () => {
  await Promise.all([fetchDevices(), fetchSchedules()]);
});
</script>
