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
      </form>

      <Transition name="error">
        <p v-if="showError" class="mt-4 flex items-center justify-center gap-1.5 text-sm font-medium text-danger">
          <Icon name="solar:danger-circle-bold" size="18" />
          That password didn't work. Try again.
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

const { isAuthenticated, login } = useAuth();

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
