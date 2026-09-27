import { clearSessionToken, getSessionToken, moodlyBackendService } from '~/utils/moodly-backend';

// Shared across the app; the `api` plugin flips it to false when the backend rejects the token.
const isAuthenticated = ref(false);

export function useAuth() {
  /** Restores the session from sessionStorage. The backend still validates the token on every call. */
  const restoreSession = () => {
    isAuthenticated.value = !!getSessionToken();
  };

  const login = async (password: string) => {
    await moodlyBackendService.login(password);
    isAuthenticated.value = true;
  };

  const logout = () => {
    clearSessionToken();
    isAuthenticated.value = false;
  };

  return {
    isAuthenticated: readonly(isAuthenticated),
    restoreSession,
    login,
    logout,
  };
}
