<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import AlertBox from '../components/AlertBox.vue';
import { api, toReadableError } from '../services/api';
import { assertWebAuthnSupport, isWebAuthnSupported, runAuthentication, runRegistration } from '../services/webauthn';
import { useSessionStore } from '../stores/session';

const router = useRouter();
const sessionStore = useSessionStore();

const loginLoading = ref(false);
const registerLoading = ref(false);
const message = ref<string | null>(null);
const error = ref<string | null>(null);

const username = ref('');
const label = ref('Primary passkey');

const supported = isWebAuthnSupported();

async function signInWithPasskey(): Promise<void> {
  message.value = null;
  error.value = null;
  loginLoading.value = true;

  try {
    assertWebAuthnSupport();

    const optionsResult = await api.startLogin({
      flow: 'passkey-only',
    });

    const response = await runAuthentication(optionsResult.options);

    const verifyResult = await api.finishLogin({
      challengeId: optionsResult.challengeId,
      response,
    });

    sessionStore.markAuthenticated(verifyResult.user);
    await router.push('/account');
  } catch (unknownError) {
    error.value = toReadableError(unknownError);
  } finally {
    loginLoading.value = false;
  }
}

async function registerNewAccount(): Promise<void> {
  message.value = null;
  error.value = null;
  registerLoading.value = true;

  try {
    assertWebAuthnSupport();

    const optionsResult = await api.startRegistration({
      username: username.value,
      label: label.value,
      flow: 'passkey-only',
    });

    const response = await runRegistration(optionsResult.options);

    const verifyResult = await api.finishRegistration({
      challengeId: optionsResult.challengeId,
      response,
    });

    sessionStore.markAuthenticated(verifyResult.user);
    await router.push('/account');
  } catch (unknownError) {
    error.value = toReadableError(unknownError);
  } finally {
    registerLoading.value = false;
  }
}
</script>

<template>
  <section class="stack">
    <h1>Passkey-only flow</h1>
    <p>Sign in with discoverable credentials or create a new account with username + passkey label.</p>

    <AlertBox
      v-if="!supported"
      type="error"
      message="This browser does not support passkeys/WebAuthn for this demo."
    />

    <AlertBox v-if="message" type="success" :message="message" />
    <AlertBox v-if="error" type="error" :message="error" />

    <div class="card">
      <h2>Returning user</h2>
      <p>Use a discoverable passkey. No username is required first.</p>
      <button class="button" type="button" :disabled="loginLoading || !supported" @click="signInWithPasskey">
        {{ loginLoading ? 'Opening passkey prompt…' : 'Sign in with passkey' }}
      </button>
    </div>

    <div class="card">
      <h2>New user registration</h2>
      <form class="stack" @submit.prevent="registerNewAccount">
        <label class="field">
          Username
          <input v-model.trim="username" name="username" autocomplete="username" required minlength="3" maxlength="32" />
        </label>

        <label class="field">
          Passkey label
          <input v-model.trim="label" name="label" required maxlength="64" />
        </label>

        <button class="button" type="submit" :disabled="registerLoading || !supported">
          {{ registerLoading ? 'Registering passkey…' : 'Create account and register passkey' }}
        </button>
      </form>
    </div>
  </section>
</template>
