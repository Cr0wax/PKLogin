import { defineStore } from 'pinia';

import { api, toReadableError } from '../services/api';
import type { User } from '../types/domain';

interface SessionState {
  initialized: boolean;
  loading: boolean;
  user: User | null;
  authenticated: boolean;
  error: string | null;
}

export const useSessionStore = defineStore('session', {
  state: (): SessionState => ({
    initialized: false,
    loading: false,
    user: null,
    authenticated: false,
    error: null,
  }),
  actions: {
    async fetchMe(): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        const result = await api.me();
        this.authenticated = result.authenticated;
        this.user = result.user;
      } catch (error) {
        this.authenticated = false;
        this.user = null;
        this.error = toReadableError(error);
      } finally {
        this.loading = false;
        this.initialized = true;
      }
    },

    async logout(): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        await api.logout();
        this.authenticated = false;
        this.user = null;
      } catch (error) {
        this.error = toReadableError(error);
      } finally {
        this.loading = false;
      }
    },

    markAuthenticated(user: User): void {
      this.authenticated = true;
      this.user = user;
      this.initialized = true;
      this.error = null;
    },
  },
});
