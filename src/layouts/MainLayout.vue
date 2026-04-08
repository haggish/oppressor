<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawer = !drawer" />
        <q-toolbar-title class="text-weight-bold">Oppressor</q-toolbar-title>
        <q-icon
          :name="serverOnline ? 'cloud_done' : 'cloud_off'"
          :color="serverOnline ? 'white' : 'yellow'"
          size="20px"
        >
          <q-tooltip>{{ serverOnline ? 'Backend online' : 'Backend offline' }}</q-tooltip>
        </q-icon>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" show-if-above bordered>
      <q-list padding>
        <q-item-label header class="text-grey-6 text-uppercase text-caption">Navigation</q-item-label>
        <q-item clickable v-ripple :to="'/'">
          <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>
        <q-item clickable v-ripple :to="'/settings'">
          <q-item-section avatar><q-icon name="settings" /></q-item-section>
          <q-item-section>Settings</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFritzStatus } from '../composables/useFritzStatus';

const drawer = ref(false);
const { serverOnline } = useFritzStatus();
</script>
