<template>
  <q-page class="q-pa-md">
    <div class="text-h5 text-weight-medium q-mb-md">Settings</div>

    <!-- Server health -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">Server Status</div>
        <div class="row items-center q-gutter-sm">
          <q-icon
            :name="serverOnline ? 'check_circle' : 'error'"
            :color="serverOnline ? 'positive' : 'negative'"
            size="24px"
          />
          <span :class="serverOnline ? 'text-positive' : 'text-negative'">
            {{ serverOnline ? `Online · uptime ${uptimeLabel}` : 'Backend unreachable' }}
          </span>
          <q-btn flat dense size="sm" icon="refresh" @click="checkHealth" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Fritz!Box connection info -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2 q-mb-xs">Fritz!Box Connection</div>
        <div class="text-caption text-grey q-mb-sm">
          Credentials are configured via the <code>.env</code> file on the server.
        </div>
        <q-list dense>
          <q-item>
            <q-item-section avatar><q-icon name="router" /></q-item-section>
            <q-item-section>
              <q-item-label caption>Host</q-item-label>
              <q-item-label>FRITZ_HOST (default: 192.168.178.1)</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar><q-icon name="person" /></q-item-section>
            <q-item-section>
              <q-item-label caption>User</q-item-label>
              <q-item-label>FRITZ_USER</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section avatar><q-icon name="lock" /></q-item-section>
            <q-item-section>
              <q-item-label caption>Password</q-item-label>
              <q-item-label>FRITZ_PASSWORD</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-actions align="left">
        <q-btn
          unelevated color="primary" icon="wifi_find" label="Test Fritz!Box Connection"
          :loading="testing"
          @click="testConnection"
        />
      </q-card-actions>
      <q-card-section v-if="testResult !== null" class="q-pt-none">
        <q-banner
          :class="testResult ? 'bg-positive text-white' : 'bg-negative text-white'"
          dense rounded
        >
          {{ testResult ? 'Fritz!Box reachable — devices discovered successfully.' : 'Could not reach Fritz!Box. Check your .env credentials and TR-064 is enabled.' }}
        </q-banner>
      </q-card-section>
    </q-card>

    <!-- Scheduler info -->
    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle2 q-mb-xs">Scheduler</div>
        <div class="text-caption text-grey">
          Block/unblock rules are evaluated every 60 seconds on the server.
          Overnight windows (e.g. 23:00 → 06:00) are supported.
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useFritzStatus } from '../composables/useFritzStatus';
import { useDeviceStore } from '../stores/deviceStore';

const { serverOnline, uptime, checkHealth } = useFritzStatus();
const store = useDeviceStore();

const testing = ref(false);
const testResult = ref<boolean | null>(null);

const uptimeLabel = computed(() => {
  const s = uptime.value;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
});

async function testConnection() {
  testing.value = true;
  testResult.value = null;
  try {
    await store.discoverHosts();
    testResult.value = true;
  } catch {
    testResult.value = false;
  } finally {
    testing.value = false;
  }
}
</script>
