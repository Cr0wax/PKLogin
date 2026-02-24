<script setup lang="ts">
import type { Passkey } from '../types/domain';

const props = defineProps<{
  passkeys: Passkey[];
  deletingId: string | null;
}>();

const emit = defineEmits<{
  delete: [passkeyId: string];
}>();

function formatDateTime(value: string | null): string {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString();
}
</script>

<template>
  <div class="card">
    <h3>Registered passkeys</h3>
    <p v-if="props.passkeys.length === 0">No passkeys found.</p>

    <ul v-else class="passkey-list">
      <li v-for="passkey in props.passkeys" :key="passkey.id" class="passkey-item">
        <div>
          <p><strong>{{ passkey.label }}</strong></p>
          <p>Added: {{ formatDateTime(passkey.createdAt) }}</p>
          <p>Last used: {{ formatDateTime(passkey.lastUsedAt) }}</p>
          <p v-if="passkey.transports.length > 0">Transports: {{ passkey.transports.join(', ') }}</p>
        </div>

        <button
          type="button"
          class="button button-danger"
          :disabled="props.deletingId === passkey.id"
          @click="emit('delete', passkey.id)"
        >
          {{ props.deletingId === passkey.id ? 'Deleting…' : 'Delete' }}
        </button>
      </li>
    </ul>
  </div>
</template>
