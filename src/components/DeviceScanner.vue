<template>
  <q-card style="min-width: 480px; max-width: 600px">
    <q-card-section class="row items-center">
      <div class="text-h6">Discover Devices</div>
      <q-space />
      <q-btn icon="refresh" flat round dense :loading="loading" @click="scan" />
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-banner v-if="error" class="bg-negative text-white q-mb-sm" dense rounded>
        {{ error }}
      </q-banner>

      <q-list separator>
        <q-item v-if="!hosts.length && !loading" class="text-grey text-center">
          <q-item-section>No devices found. Click refresh to scan.</q-item-section>
        </q-item>

        <q-item v-for="host in hosts" :key="host.mac" class="q-py-sm">
          <q-item-section avatar>
            <q-icon :name="host.active ? 'wifi' : 'wifi_off'" :color="host.active ? 'positive' : 'grey'" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ host.hostname || host.mac }}</q-item-label>
            <q-item-label caption>{{ host.mac }} · {{ host.ip }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              v-if="!isManaged(host.mac)"
              unelevated size="sm" color="primary" label="Add"
              @click="addHost(host)"
            />
            <q-chip v-else dense color="grey-3" text-color="grey-7" label="Managed" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Close" @click="$emit('close')" />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDeviceStore } from '../stores/deviceStore';
import { storeToRefs } from 'pinia';
import type { FritzBoxHost } from '../types';

defineEmits<{ close: [] }>();

const store = useDeviceStore();
const { devices, loading, discoveredHosts } = storeToRefs(store);

const hosts = computed(() => discoveredHosts.value as FritzBoxHost[]);
const error = ref('');

async function scan() {
  error.value = '';
  try {
    await store.discoverHosts();
  } catch {
    error.value = 'Could not reach Fritz!Box. Check your .env configuration.';
  }
}

function isManaged(mac: string): boolean {
  return devices.value.some((d) => d.mac.toLowerCase() === mac.toLowerCase());
}

async function addHost(host: FritzBoxHost) {
  await store.addDevice({
    name: host.hostname || host.mac,
    mac: host.mac,
    ip: host.ip,
    hostname: host.hostname,
  });
}

onMounted(scan);
</script>
