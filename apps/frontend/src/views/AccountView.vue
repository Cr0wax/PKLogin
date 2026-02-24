<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import AlertBox from '../components/AlertBox.vue';
import PasskeyList from '../components/PasskeyList.vue';
import { api, toReadableError } from '../services/api';
import { assertWebAuthnSupport, runRegistration } from '../services/webauthn';
import { useSessionStore } from '../stores/session';
import type { Passkey } from '../types/domain';

const router = useRouter();
const sessionStore = useSessionStore();

const passkeys = ref<Passkey[]>([]);
const loading = ref(true);
const adding = ref(false);
const deletingId = ref<string | null>(null);

const addLabel = ref('Additional passkey');
const success = ref<string | null>(null);
const error = ref<string | null>(null);

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

async function loadAccountData(): Promise<void> {
  loading.value = true;
  error.value = null;

  try {
    await sessionStore.fetchMe();
    if (!sessionStore.authenticated || !sessionStore.user) {
      await router.replace('/');
      return;
    }

    const result = await api.listPasskeys();
    passkeys.value = result.passkeys;
  } catch (unknownError) {
    error.value = toReadableError(unknownError);
  } finally {
    loading.value = false;
  }
}

async function addPasskey(): Promise<void> {
  success.value = null;
  error.value = null;
  adding.value = true;

  try {
    assertWebAuthnSupport();

    const options = await api.startAddPasskey({ label: addLabel.value });
    const response = await runRegistration(options.options);

    await api.finishAddPasskey({
      challengeId: options.challengeId,
      response,
    });

    const result = await api.listPasskeys();
    passkeys.value = result.passkeys;
    success.value = 'Passkey added successfully.';
  } catch (unknownError) {
    error.value = toReadableError(unknownError);
  } finally {
    adding.value = false;
  }
}

async function deletePasskey(passkeyId: string): Promise<void> {
  const confirmed = window.confirm('Delete this passkey? If it is the last one, the account will be deleted.');
  if (!confirmed) {
    return;
  }

  success.value = null;
  error.value = null;
  deletingId.value = passkeyId;

  try {
    const result = await api.deletePasskey(passkeyId);

    if (result.accountDeleted) {
      await sessionStore.fetchMe();
      await router.push({ path: '/', query: { message: 'Account deleted because the last passkey was removed.' } });
      return;
    }

    const refreshed = await api.listPasskeys();
    passkeys.value = refreshed.passkeys;
    success.value = 'Passkey deleted.';
  } catch (unknownError) {
    error.value = toReadableError(unknownError);
  } finally {
    deletingId.value = null;
  }
}

async function logout(): Promise<void> {
  await sessionStore.logout();
  await router.push('/');
}

onMounted(() => {
  void loadAccountData();
});
</script>

<template>
  <section class="stack">
    <h1>Account</h1>

    <div v-if="loading" class="card">
      <p>Loading account…</p>
    </div>

    <template v-else>
      <AlertBox v-if="success" type="success" :message="success" />
      <AlertBox v-if="error" type="error" :message="error" />

      <div v-if="sessionStore.user" class="card">
        <h2>User details</h2>
        <p><strong>Username:</strong> {{ sessionStore.user.username }}</p>
        <p><strong>User ID:</strong> {{ sessionStore.user.id }}</p>
        <p><strong>Created:</strong> {{ formatDateTime(sessionStore.user.createdAt) }}</p>
      </div>

      <PasskeyList :passkeys="passkeys" :deleting-id="deletingId" @delete="deletePasskey" />

      <div class="card">
        <h3>Add passkey</h3>
        <form class="stack" @submit.prevent="addPasskey">
          <label class="field">
            Label
            <input v-model.trim="addLabel" required maxlength="64" />
          </label>
          <button class="button" type="submit" :disabled="adding">
            {{ adding ? 'Adding passkey…' : 'Add passkey' }}
          </button>
        </form>
      </div>

      <div class="card">
        <button class="button button-secondary" type="button" @click="logout">Logout</button>
      </div>
    </template>
  </section>
</template>
