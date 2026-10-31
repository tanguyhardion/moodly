import { browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { moodlyBackendService } from "~/utils/moodly-backend";

const PASSKEY_ID_KEY = "moodly-passkey-id";

// Shared so the settings toggle and the password gate stay in sync
const passkeyId = ref<string | null>(null);

function readStoredId(): string | null {
  try {
    return localStorage.getItem(PASSKEY_ID_KEY);
  } catch {
    return null;
  }
}

/** Face ID / fingerprint unlock. The id is remembered per device, since a passkey lives on one. */
export function usePasskey() {
  passkeyId.value = readStoredId();

  async function enable() {
    const id = await moodlyBackendService.registerPasskey();
    try {
      localStorage.setItem(PASSKEY_ID_KEY, id);
    } catch {
      // Still registered, but this device won't offer the unlock button
    }
    passkeyId.value = id;
  }

  async function disable() {
    if (passkeyId.value) await moodlyBackendService.removePasskey(passkeyId.value);
    try {
      localStorage.removeItem(PASSKEY_ID_KEY);
    } catch {
      // Nothing to clean up
    }
    passkeyId.value = null;
  }

  return {
    supported: browserSupportsWebAuthn(),
    enabled: computed(() => !!passkeyId.value),
    enable,
    disable,
  };
}
