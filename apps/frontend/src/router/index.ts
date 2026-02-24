import { createRouter, createWebHistory } from 'vue-router';

import WelcomeView from '../views/WelcomeView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'welcome',
      component: WelcomeView,
    },
  ],
});
