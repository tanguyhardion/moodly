import { reactive } from "vue";
import { moodlyBackendService } from "~/utils/moodly-backend";

/** The VAPID public key is URL-safe base64; `subscribe` wants raw bytes. */
function keyToBytes(key: string): Uint8Array<ArrayBuffer> {
  const base64 = (key + "=".repeat((4 - (key.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

/** Web Push for this device: whether it is on, and turning it on or off. */
export function usePushNotifications() {
  const hasApis = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  const state = reactive({
    // iOS only exposes the push APIs once the app is on the Home Screen, so still show a hint there
    supported: hasApis || isIos,
    needsInstall: !hasApis && isIos,
    enabled: false,
    denied: false,
    busy: false,
  });

  async function getSubscription() {
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  }

  async function refresh() {
    if (!hasApis) return;
    state.denied = Notification.permission === "denied";
    state.enabled = !state.denied && !!(await getSubscription());
  }

  async function enable() {
    state.busy = true;
    try {
      if ((await Notification.requestPermission()) !== "granted") {
        state.denied = Notification.permission === "denied";
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyToBytes(await moodlyBackendService.getPushPublicKey()),
        }));
      await moodlyBackendService.savePushSubscription(subscription.toJSON());
      state.enabled = true;
    } finally {
      state.busy = false;
    }
  }

  async function disable() {
    state.busy = true;
    try {
      const subscription = await getSubscription();
      if (subscription) {
        await moodlyBackendService.deletePushSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }
      state.enabled = false;
    } finally {
      state.busy = false;
    }
  }

  refresh();
  return Object.assign(state, { refresh, enable, disable, isStandalone });
}
