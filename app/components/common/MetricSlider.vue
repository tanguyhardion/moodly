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
        <span
          v-for="i in 5"
          :key="i"
          class="marker"
          :class="{ active: modelValue >= i }"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MetricConfig } from "~/types";

interface Props {
  modelValue: number;
  config: MetricConfig;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: number];
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
  emit("update:modelValue", parseInt(target.value));
};
</script>

<style scoped>
.metric-slider {
  padding: 1.75rem;
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.metric-slider::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    var(--slider-color) 50%,
    transparent 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.metric-slider:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}

.metric-slider:hover::before {
  opacity: 0.5;
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
  width: 52px;
  height: 52px;
  border-radius: var(--radius-lg);
  background: var(--icon-bg);
  box-shadow: var(--shadow-icon);
  position: relative;
  transition: transform 0.3s ease;
}

.metric-slider:hover .metric-icon {
  transform: scale(1.1) rotate(-5deg);
}

.metric-slider:hover .metric-icon {
  transform: scale(1.1) rotate(5deg);
}

.metric-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.emoji-display {
  text-align: center;
  margin: 1.75rem 0;
  animation: fadeInScale 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.5rem;
}

.emoji {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 0.625rem;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease;
}

.metric-slider:hover .emoji {
  transform: scale(1.05);
}

.label {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  font-weight: 600;
  letter-spacing: -0.01em;
}

.slider-container {
  position: relative;
  padding: 0.5rem 0;
}

.slider {
  width: 100%;
  height: 10px;
  border-radius: 5px;
  background: var(--slider-track);
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--slider-color);
  cursor: pointer;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.15),
    0 0 0 3px rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid white;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.25);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.25),
    0 0 0 4px rgba(255, 255, 255, 0.9);
}

.slider::-webkit-slider-thumb:active {
  transform: scale(1.15);
}

.slider::-moz-range-thumb {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--slider-color);
  cursor: pointer;
  border: 2px solid white;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.15),
    0 0 0 3px rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.25);
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.25),
    0 0 0 4px rgba(255, 255, 255, 0.9);
}

.slider::-moz-range-thumb:active {
  transform: scale(1.15);
}

.slider-markers {
  display: flex;
  justify-content: space-between;
  margin-top: 0.625rem;
  padding: 0 6px;
}

.marker {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--marker-inactive);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
}

.marker.active {
  background: var(--slider-color);
  transform: scale(1.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.85) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
