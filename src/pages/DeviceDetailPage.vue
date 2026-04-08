<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-btn flat round icon="arrow_back" @click="router.push('/')" class="q-mr-sm" />
      <div class="col">
        <div v-if="!renaming" class="row items-center">
          <span class="text-h5 text-weight-medium">{{ device?.name ?? 'Device' }}</span>
          <q-btn flat round dense icon="edit" size="sm" class="q-ml-xs" @click="startRename" />
        </div>
        <div v-else class="row items-center q-gutter-xs">
          <q-input
            v-model="nameEdit"
            dense outlined autofocus
            style="min-width: 200px"
            @keyup.enter="saveRename"
            @keyup.escape="renaming = false"
          />
          <q-btn flat dense icon="check" color="positive" @click="saveRename" />
          <q-btn flat dense icon="close" @click="renaming = false" />
        </div>
        <div class="text-caption text-grey">{{ device?.mac }}</div>
      </div>
      <StatusBadge v-if="device" :status="device.status ?? 'offline'" />
    </div>

    <div v-if="!device" class="text-center text-grey q-mt-xl">
      <q-icon name="error_outline" size="48px" />
      <p>Device not found.</p>
    </div>

    <template v-else>
      <!-- Quick actions -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Quick Actions</div>
          <div class="row q-gutter-sm">
            <q-btn
              unelevated color="negative" icon="block" label="Block Now"
              :disable="device.status === 'blocked'"
              :loading="acting"
              @click="doBlock"
            />
            <q-btn
              unelevated color="positive" icon="check_circle" label="Unblock Now"
              :disable="device.status !== 'blocked'"
              :loading="acting"
              @click="doUnblock"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Today's timeline -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Today's Schedule</div>
          <TimelineBar :windows="scheduleWindows" />
        </q-card-section>
      </q-card>

      <!-- Schedules list -->
      <q-card flat bordered>
        <q-card-section class="row items-center">
          <div class="text-subtitle2 col">Block Schedules</div>
          <q-btn flat dense icon="add" label="Add" color="primary" @click="addDialog = true" />
        </q-card-section>

        <q-separator />

        <q-list separator>
          <q-item v-if="!deviceSchedules.length" class="text-grey">
            <q-item-section>No schedules yet.</q-item-section>
          </q-item>

          <q-item v-for="s in deviceSchedules" :key="s.id" class="q-py-sm">
            <q-item-section avatar>
              <q-toggle
                :model-value="!!s.enabled"
                color="primary"
                @update:model-value="toggleSchedule(s.id)"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                {{ s.block_from }} – {{ s.block_until }}
              </q-item-label>
              <q-item-label caption>
                {{ parseDays(s.days).map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ') }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat round icon="delete" color="negative" size="sm" @click="doDelete(s.id)" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </template>

    <!-- Add schedule dialog -->
    <q-dialog v-model="addDialog">
      <ScheduleEditor
        v-if="device"
        :device-id="device.id"
        @save="onSaveSchedule"
        @cancel="addDialog = false"
      />
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useDeviceStore } from '../stores/deviceStore';
import { useSchedules } from '../composables/useSchedules';
import StatusBadge from '../components/StatusBadge.vue';
import TimelineBar from '../components/TimelineBar.vue';
import ScheduleEditor from '../components/ScheduleEditor.vue';
import type { DayOfWeek } from '../types';

const route = useRoute();
const router = useRouter();
const store = useDeviceStore();
const { devices } = storeToRefs(store);

const deviceId = route.params.id as string;
const device = computed(() => devices.value.find((d) => d.id === deviceId));

const { deviceSchedules, parseDays, fetchSchedules, addSchedule, toggleSchedule, deleteSchedule } =
  useSchedules(deviceId);

const scheduleWindows = computed(() =>
  deviceSchedules.value.map((s) => ({
    block_from: s.block_from,
    block_until: s.block_until,
    days: parseDays(s.days),
    enabled: s.enabled,
  }))
);

const addDialog = ref(false);
const acting = ref(false);
const renaming = ref(false);
const nameEdit = ref('');

function startRename() {
  nameEdit.value = device.value?.name ?? '';
  renaming.value = true;
}

async function saveRename() {
  const name = nameEdit.value.trim();
  if (name && name !== device.value?.name) {
    await store.renameDevice(deviceId, name);
  }
  renaming.value = false;
}

async function doBlock() {
  acting.value = true;
  await store.blockNow(deviceId);
  acting.value = false;
}

async function doUnblock() {
  acting.value = true;
  await store.unblockNow(deviceId);
  acting.value = false;
}

async function doDelete(scheduleId: string) {
  await deleteSchedule(scheduleId);
}

async function onSaveSchedule(schedule: {
  deviceId: string;
  blockFrom: string;
  blockUntil: string;
  days: DayOfWeek[];
}) {
  await addSchedule(schedule);
  addDialog.value = false;
}

onMounted(async () => {
  await Promise.all([store.fetchDevices(), fetchSchedules()]);
});
</script>
