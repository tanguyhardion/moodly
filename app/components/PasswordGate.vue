<template>
  <div v-if="!isAuthenticated" class="password-gate">
    <div class="password-card">
      <div class="lock-icon">
        <Icon name="solar:lock-password-bold" size="48" />
      </div>
      <h1 class="title">Welcome to Moodly</h1>
      <p class="subtitle">Enter your master password to continue</p>

      <form @submit.prevent="handleSubmit" class="password-form">
        <input
          v-model="password"
          type="password"
          placeholder="Master Password"
          class="password-input"
          :class="{ error: showError }"
          @input="showError = false"
          autofocus
        />
        <button type="submit" class="submit-btn" :disabled="!password">
          <Icon name="solar:login-3-bold" size="20" />
          Unlock
        </button>
      </form>

      <Transition name="error">
        <p v-if="showError" class="error-message">
          <Icon name="solar:danger-circle-bold" size="18" />
          Incorrect password. Please try again.
        </p>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
const password = ref("");
const showError = ref(false);
const isAuthenticated = ref(false);

onMounted(() => {
  // Check if already authenticated
  const storedPassword = sessionStorage.getItem("moodly-master-password");
  if (storedPassword) {
    isAuthenticated.value = true;
  }
});

const handleSubmit = async () => {
  try {
    // Verify password by making a test call to the backend
    const response = await fetch(
      `${
        process.env.NODE_ENV === "development"
          ? "http://localhost:3001"
          : "https://moodly-backend.vercel.app"
      }/api/verify-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ masterPassword: password.value }),
      }
    );

    const data = await response.json();

    if (data.success) {
      // Store password in session storage
      sessionStorage.setItem("moodly-master-password", password.value);
      isAuthenticated.value = true;
    } else {
      showError.value = true;
      password.value = "";
    }
  } catch (error) {
    console.error("Authentication error:", error);
    showError.value = true;
    password.value = "";
  }
};

// Watch authentication status and emit to parent
const emit = defineEmits<{
  authenticated: [];
}>();

watch(isAuthenticated, (value) => {
  if (value) {
    emit("authenticated");
  }
});
</script>

<style scoped>
.password-gate {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(255, 107, 157, 0.1) 0%,
    rgba(255, 160, 107, 0.1) 100%
  );
  backdrop-filter: blur(10px);
  z-index: 9999;
}

.password-card {
  background: var(--card-bg);
  padding: 3rem;
  border-radius: 1.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.lock-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
  border-radius: 1.5rem;
  color: white;
  margin-bottom: 1.5rem;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
}

.subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 2rem;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.password-input {
  padding: 1rem;
  border: 2px solid var(--border);
  border-radius: 0.75rem;
  font-size: 1rem;
  color: var(--text-primary);
  background: var(--input-bg);
  transition: all 0.3s ease;
}

.password-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);
}

.password-input.error {
  border-color: #ff6b6b;
  animation: shake 0.3s ease;
}

.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 157, 0.4);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: #ff6b6b;
  font-size: 0.875rem;
  font-weight: 500;
}

.error-enter-active,
.error-leave-active {
  transition: all 0.3s ease;
}

.error-enter-from,
.error-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}
</style>
