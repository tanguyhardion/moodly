<template>
  <div class="metric-slider">
    <div class="metric-header">
      <div class="metric-icon" :style="{ color: config.color }">
        <Icon :name="config.icon" size="24" />
      </div>
      <h3 class="metric-name">{{ config.name }}</h3>
    </div>
    
    <div class="emoji-display">
      <span class="emoji">{{ currentEmoji }}</span>
      <span class="label">{{ currentLabel }}</span>
    </div>

    <div class="slider-container">
      <input
        type="range"
        min="1"
        max="5"
        :value="modelValue"
        @input="handleInput"
        class="slider"
        :style="{ '--slider-color': config.color }"
      />
      <div class="slider-markers">
        <span v-for="i in 5" :key="i" class="marker" :class="{ active: modelValue >= i }"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MetricConfig } from '~/types';

interface Props {
  modelValue: number;
  config: MetricConfig;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();

const currentEmoji = computed(() => {
  const index = Math.max(0, Math.min(4, props.modelValue - 1));
  return props.config.emojis[index];
});

const currentLabel = computed(() => {
  const index = Math.max(0, Math.min(4, props.modelValue - 1));
  return props.config.labels[index];
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', parseInt(target.value));
};
</script>

<style scoped>
.metric-slider {
  padding: 1.5rem;
  background: var(--card-bg);
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.metric-slider:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.metric-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  position: relative;
}

.metric-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: currentColor;
  opacity: 0.15;
  border-radius: 0.5rem;
}

.metric-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.emoji-display {
  text-align: center;
  margin: 1.5rem 0;
  animation: fadeInScale 0.3s ease;
}

.emoji {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.slider-container {
  position: relative;
  padding: 0.5rem 0;
}

.slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: var(--slider-track);
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--slider-color);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.slider::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--slider-color);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.slider-markers {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding: 0 4px;
}

.marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--marker-inactive);
  transition: all 0.2s ease;
}

.marker.active {
  background: var(--slider-color);
  transform: scale(1.2);
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
