<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

import { useSessionStore } from '../stores/session';

const sessionStore = useSessionStore();
const { authenticated, user } = storeToRefs(sessionStore);

const accountLabel = computed(() => (authenticated.value && user.value ? `Signed in as ${user.value.username}` : 'Not signed in'));
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="topbar-inner">
        <router-link class="brand" to="/">PKLogin Demo</router-link>
        <nav class="topbar-nav">
          <router-link to="/auth/passkey">Passkey-only</router-link>
          <router-link to="/auth/username-passkey">Username + passkey</router-link>
          <router-link v-if="authenticated" to="/account">Account</router-link>
        </nav>
      </div>
      <p class="session-meta">{{ accountLabel }}</p>
    </header>

    <main class="page">
      <slot />
    </main>
  </div>
</template>
