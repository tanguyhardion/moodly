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
        <Icon name="mdi:note-edit" size="24" class="icon-primary" />
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
  margin-bottom: var(--spacing-xl);
  padding: 1.75rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
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

.note-label {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  cursor: pointer;
}

.note-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
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
