<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import AlertBox from '../components/AlertBox.vue';
import { api, toReadableError } from '../services/api';
import { isWebAuthnSupported } from '../services/webauthn';
import { useSessionStore } from '../stores/session';

const route = useRoute();
const sessionStore = useSessionStore();

const resetMessage = ref<string | null>(null);
const resetError = ref<string | null>(null);
const resetting = ref(false);

const queryMessage = typeof route.query.message === 'string' ? route.query.message : null;
const webAuthnSupported = isWebAuthnSupported();
const devResetEnabled = import.meta.env.VITE_DEV_RESET_ENABLED === 'true' && import.meta.env.DEV;

async function resetDemoData(): Promise<void> {
  const confirmed = window.confirm('Reset all demo data? This will delete users, passkeys, sessions, and challenges.');
  if (!confirmed) {
    return;
  }

  resetMessage.value = null;
  resetError.value = null;
  resetting.value = true;

  try {
    const result = await api.resetDemoData();
    resetMessage.value = result.message;
    await sessionStore.fetchMe();
  } catch (error) {
    resetError.value = toReadableError(error);
  } finally {
    resetting.value = false;
  }
}
</script>

<template>
  <section class="stack">
    <h1>Local Passkey Demonstrator</h1>
    <p>
      This demo runs a real WebAuthn flow on localhost. The backend generates and verifies challenges,
      and passkeys are persisted in local JSON files.
    </p>

    <AlertBox
      v-if="!webAuthnSupported"
      type="error"
      message="This browser does not support passkeys/WebAuthn. Use a modern browser with passkeys enabled."
    />

    <AlertBox v-if="queryMessage" type="info" :message="queryMessage" />
    <AlertBox v-if="resetMessage" type="success" :message="resetMessage" />
    <AlertBox v-if="resetError" type="error" :message="resetError" />

    <div class="card">
      <h2>Choose login method</h2>
      <p>You can use either discoverable passkeys or username-first flow.</p>
      <div class="button-row">
        <router-link class="button" to="/auth/passkey">Passkey-only login</router-link>
        <router-link class="button button-secondary" to="/auth/username-passkey">Username + passkey login</router-link>
      </div>
    </div>

    <div class="card">
      <h2>Browser/Origin notes</h2>
      <ul>
        <li>WebAuthn works in secure contexts; localhost qualifies for local demo use.</li>
        <li>If ceremonies fail, confirm RP ID and expected origin values in backend environment config.</li>
      </ul>
    </div>

    <div v-if="devResetEnabled" class="card dev-card">
      <h2>Dev-only reset</h2>
      <p>This action clears all demo data and logs out active sessions.</p>
      <button class="button button-danger" type="button" :disabled="resetting" @click="resetDemoData">
        {{ resetting ? 'Resetting…' : 'Reset demo data' }}
      </button>
    </div>
  </section>
</template>
