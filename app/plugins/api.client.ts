import { configureApi } from '~/utils/moodly-backend';

export default defineNuxtPlugin(() => {
  const { restoreSession, logout } = useAuth();

  configureApi({
    baseUrl: useRuntimeConfig().public.apiBase,
    // Expired or revoked token: drop back to the password gate.
    onUnauthorized: logout,
  });

  // Older builds kept the raw master password in sessionStorage.
  sessionStorage.removeItem('moodly-master-password');

  restoreSession();
});
