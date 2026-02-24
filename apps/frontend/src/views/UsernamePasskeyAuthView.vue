<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import AlertBox from '../components/AlertBox.vue';
import { api, toReadableError } from '../services/api';
import { assertWebAuthnSupport, isWebAuthnSupported, runAuthentication, runRegistration } from '../services/webauthn';
import { useSessionStore } from '../stores/session';

const router = useRouter();
const sessionStore = useSessionStore();

const loginUsername = ref('');
const registerUsername = ref('');
const registerLabel = ref('Primary passkey');

const loginLoading = ref(false);
const registerLoading = ref(false);

const message = ref<string | null>(null);
const error = ref<string | null>(null);

const supported = isWebAuthnSupported();

async function loginWithUsername(): Promise<void> {
  message.value = null;
  error.value = null;
  loginLoading.value = true;

  try {
    assertWebAuthnSupport();

    const optionsResult = await api.startLogin({
      flow: 'username-passkey',
      username: loginUsername.value,
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

async function registerWithUsername(): Promise<void> {
  message.value = null;
  error.value = null;
  registerLoading.value = true;

  try {
    assertWebAuthnSupport();

    const optionsResult = await api.startRegistration({
      flow: 'username-passkey',
      username: registerUsername.value,
      label: registerLabel.value,
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
    <h1>Username + passkey flow</h1>
    <p>Enter username first, then continue with a passkey linked to that account.</p>

    <AlertBox
      v-if="!supported"
      type="error"
      message="This browser does not support passkeys/WebAuthn for this demo."
    />

    <AlertBox v-if="message" type="success" :message="message" />
    <AlertBox v-if="error" type="error" :message="error" />

    <div class="card">
      <h2>Returning user login</h2>
      <form class="stack" @submit.prevent="loginWithUsername">
        <label class="field">
          Username
          <input v-model.trim="loginUsername" name="username" autocomplete="username" required minlength="3" maxlength="32" />
        </label>

        <button class="button" type="submit" :disabled="loginLoading || !supported">
          {{ loginLoading ? 'Opening passkey prompt…' : 'Continue with passkey' }}
        </button>
      </form>
    </div>

    <div class="card">
      <h2>New user registration</h2>
      <form class="stack" @submit.prevent="registerWithUsername">
        <label class="field">
          Username
          <input v-model.trim="registerUsername" name="register-username" required minlength="3" maxlength="32" />
        </label>

        <label class="field">
          Passkey label
          <input v-model.trim="registerLabel" name="register-label" required maxlength="64" />
        </label>

        <button class="button" type="submit" :disabled="registerLoading || !supported">
          {{ registerLoading ? 'Registering passkey…' : 'Create account and register passkey' }}
        </button>
      </form>
    </div>
  </section>
</template>
