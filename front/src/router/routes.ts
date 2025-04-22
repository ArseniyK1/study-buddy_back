import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'HomePage',
    component: () => import('../views/HomePage.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/AuthPage.vue'),
    meta: { requiresGuest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/AuthPage.vue'),
    meta: { requiresGuest: true },
  },
];

export { routes };
