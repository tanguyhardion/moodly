<script setup lang="ts">
const { metricConfigs, saveEntry, getTodayEntry, hasTodayEntry } = useMoodly();

const metrics = ref({
  mood: 3,
  energy: 3,
  sleep: 3,
  focus: 3,
});

const checkboxes = ref({
  healthyFood: false,
  gym: false,
  misc: false,
});

const note = ref("");
const showToast = ref(false);

// Load today's entry if it exists
onMounted(() => {
  const todayEntry = getTodayEntry();
  if (todayEntry) {
    metrics.value = { ...todayEntry.metrics };
    checkboxes.value = todayEntry.checkboxes
      ? { ...todayEntry.checkboxes }
      : {
          healthyFood: false,
          gym: false,
          misc: false,
        };
    note.value = todayEntry.note || "";
  }
});

const handleSave = () => {
  saveEntry(metrics.value, checkboxes.value, note.value || undefined);
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};
</script>

<template>
  <div class="page home-page">
    <div class="page-header">
      <h1 class="page-title">
        <Icon name="solar:hand-heart-bold" size="32" class="wave" />
        How are you feeling today?
      </h1>
      <p class="page-subtitle">
        {{
          hasTodayEntry
            ? "Update your daily check-in"
            : "Take a moment to check in with yourself"
        }}
      </p>
    </div>

    <div class="metrics-container">
      <MetricSlider
        v-for="config in metricConfigs"
        :key="config.key"
        v-model="metrics[config.key]"
        :config="config"
      />
    </div>

    <div class="checkboxes-section">
      <h3 class="checkboxes-title">
        <Icon name="solar:clipboard-check-bold" size="18" />
        Daily Check-ins
      </h3>
      <div class="checkbox-group">
        <label class="checkbox-item">
          <input type="checkbox" v-model="checkboxes.healthyFood" />
          <span class="checkbox-label">
            <Icon name="solar:leaf-bold" size="18" />
            Healthy Food
          </span>
        </label>
        <label class="checkbox-item">
          <input type="checkbox" v-model="checkboxes.gym" />
          <span class="checkbox-label">
            <Icon name="solar:dumbbell-large-bold" size="18" />
            Gym
          </span>
        </label>
        <label class="checkbox-item">
          <input type="checkbox" v-model="checkboxes.misc" />
          <span class="checkbox-label">
            <Icon name="solar:star-bold" size="18" />
            Misc
          </span>
        </label>
      </div>
    </div>

    <div class="note-section">
      <label for="note" class="note-label">
        <Icon name="solar:notes-bold" size="18" />
        Add a note (optional)
      </label>
      <textarea
        id="note"
        v-model="note"
        class="note-input"
        placeholder="How was your day? Any thoughts or reflections..."
        rows="4"
      ></textarea>
    </div>

    <div class="actions">
      <button @click="handleSave" class="btn btn-primary">
        <Icon name="solar:check-circle-bold" size="20" />
        {{ hasTodayEntry ? "Update Entry" : "Save Entry" }}
      </button>
    </div>

    <Transition name="toast">
      <div v-if="showToast" class="toast">
        <Icon name="solar:check-circle-bold" size="20" />
        Entry saved successfully!
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 600px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.wave {
  display: inline-flex;
  color: var(--primary);
  animation: wave 2s ease-in-out infinite;
}

@keyframes wave {
  0%,
  100% {
    transform: scale(1) rotate(0deg);
  }
  25% {
    transform: scale(1.1) rotate(10deg);
  }
  75% {
    transform: scale(1.1) rotate(-10deg);
  }
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.metrics-container {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.checkboxes-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--card-bg);
  border: 2px solid var(--border);
  border-radius: 0.75rem;
}

.checkboxes-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: background 0.2s ease;
}

.checkbox-item:hover {
  background: var(--hover-bg);
}

.checkbox-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--primary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  user-select: none;
}

.note-section {
  margin-bottom: 2rem;
}

.note-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.note-input {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border);
  border-radius: 0.75rem;
  background: var(--card-bg);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  transition: all 0.2s ease;
}

.note-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(255, 107, 157, 0.1);
}

.note-input::placeholder {
  color: var(--text-tertiary);
}

.actions {
  display: flex;
  justify-content: center;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  border: none;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(255, 107, 157, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: #4cd964;
  color: white;
  border-radius: 0.75rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(76, 217, 100, 0.3);
  z-index: 1000;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(1rem);
}
</style>
