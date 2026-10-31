<template>
  <div v-if="!isAuthenticated" class="fixed inset-0 z-[9999] grid place-items-center overflow-y-auto bg-bg px-4 py-10">
    <div class="w-full max-w-sm text-center">
      <MoodlyLogo class="mx-auto size-16" />
      <h1 class="mt-5 text-4xl font-extrabold">moodly</h1>
      <p class="mt-1 text-muted">Enter your password to open your journal.</p>

      <form class="mt-8 flex flex-col gap-3" @submit.prevent="handleSubmit">
        <input
          ref="passwordInput"
          v-model="password"
          type="password"
          pattern="[0-9]*"
          inputmode="numeric"
          placeholder="Password"
          aria-label="Password"
          class="input h-14 bg-surface text-center text-xl tracking-[0.3em] shadow-card dark:shadow-none"
          :class="{ 'ring-2 ring-danger': showError }"
          autofocus
          @input="showError = false"
        />
        <button type="submit" class="btn btn-primary h-14 text-base" :disabled="!password || isValidating">
          <Icon :name="isValidating ? 'svg-spinners:ring-resize' : 'solar:login-3-bold'" size="20" />
          {{ isValidating ? "Checking…" : "Unlock" }}
        </button>
        <button v-if="passkey.supported && passkey.enabled.value" type="button" class="btn btn-secondary h-14 text-base" :disabled="isValidating" @click="handlePasskey">
          <Icon name="solar:shield-check-bold" size="20" />
          Unlock with Face ID / fingerprint
        </button>
      </form>

      <Transition name="error">
        <p v-if="showError" class="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-danger">
          <Icon name="solar:danger-circle-bold" size="18" />
          That didn't work. Try again.
        </p>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
const password = ref("");
const showError = ref(false);
const isValidating = ref(false);
const passwordInput = ref<HTMLInputElement | null>(null);

const { isAuthenticated, login, loginWithPasskey } = useAuth();
const passkey = usePasskey();

const handlePasskey = async () => {
  isValidating.value = true;
  try {
    await loginWithPasskey();
  } catch (error) {
    // Cancelling the prompt (or the browser refusing it without a tap) isn't an error to show;
    // the button and the password form stay available
    if ((error as Error).name !== "NotAllowedError") {
      console.error("Passkey authentication error:", error);
      showError.value = true;
    }
  } finally {
    isValidating.value = false;
  }
};

// Ask for Face ID / fingerprint straight away when this device has a passkey
onMounted(() => {
  if (!isAuthenticated.value && passkey.supported && passkey.enabled.value) handlePasskey();
});

const handleSubmit = async () => {
  isValidating.value = true;
  try {
    await login(password.value);
  } catch (error) {
    console.error("Authentication error:", error);
    showError.value = true;
    password.value = "";
    // Refocus the input field
    nextTick(() => {
      passwordInput.value?.focus();
    });
  } finally {
    isValidating.value = false;
  }
};

// Emit to parent on login, and immediately when a stored session was restored
const emit = defineEmits<{
  authenticated: [];
}>();

watch(
  isAuthenticated,
  (value) => {
    if (value) {
      password.value = "";
      emit("authenticated");
    }
  },
  { immediate: true },
);
</script>
