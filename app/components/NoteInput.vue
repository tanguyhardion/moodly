<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();

defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();
</script>

<template>
  <div class="note-section">
    <div class="note-header">
      <div class="icon-container">
        <Icon name="solar:notes-bold" size="24" />
      </div>
      <label for="note" class="note-label">Add a note (optional)</label>
    </div>
    <textarea
      id="note"
      :value="modelValue"
      @input="
        $emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)
      "
      class="note-input"
      placeholder="How was your day? Any thoughts or reflections..."
      rows="4"
    ></textarea>
  </div>
</template>

<style scoped>
.note-section {
  margin-bottom: 2rem;
  padding: 1.75rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.note-section:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}

.note-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 1rem;
  background: white;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.18);
  transition: transform 0.3s ease;
}

.note-section:hover .icon-container {
  transform: scale(1.1) rotate(-5deg);
}

.note-label {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;
}

.note-input {
  width: 100%;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 1rem;
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.9375rem;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.2s ease;
}

.note-input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--card-bg);
  box-shadow: 0 0 0 3px var(--focus-ring);
}

.note-input::placeholder {
  color: var(--text-tertiary);
}
</style>
