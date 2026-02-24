import { createRouter, createWebHistory } from 'vue-router';

import { api } from '../services/api';
import AccountView from '../views/AccountView.vue';
import PasskeyOnlyAuthView from '../views/PasskeyOnlyAuthView.vue';
import UsernamePasskeyAuthView from '../views/UsernamePasskeyAuthView.vue';
import WelcomeView from '../views/WelcomeView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: WelcomeView,
    },
    {
      path: '/auth/passkey',
      name: 'auth-passkey',
      component: PasskeyOnlyAuthView,
    },
    {
      path: '/auth/username-passkey',
      name: 'auth-username-passkey',
      component: UsernamePasskeyAuthView,
    },
    {
      path: '/account',
      name: 'account',
      component: AccountView,
      beforeEnter: async () => {
        const me = await api.me();
        if (!me.authenticated) {
          return { path: '/' };
        }

        return true;
      },
    },
  ],
});
