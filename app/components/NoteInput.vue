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
    <label for="note" class="note-label">
      <Icon name="solar:notes-bold" size="18" />
      Add a note (optional)
    </label>
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
  padding: 1.125rem 1.25rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--card-bg);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.9375rem;
  line-height: 1.6;
  resize: vertical;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
}

.note-input:hover {
  border-color: var(--border-hover);
}

.note-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow:
    0 0 0 3px var(--focus-ring),
    var(--shadow-md);
  transform: translateY(-1px);
}

.note-input::placeholder {
  color: var(--text-tertiary);
}
</style>
