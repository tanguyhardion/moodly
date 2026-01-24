<template>
  <div class="metric-slider">
    <div class="metric-header">
      <div class="icon-container" :style="{ color: config.color }">
        <Icon :name="config.icon" size="24" />
      </div>
      <h3 class="metric-name">{{ config.name }}</h3>
    </div>

    <div v-if="!bedtimeOnly" class="emoji-display">
      <span class="emoji">{{ currentEmoji }}</span>
      <span class="label">{{ currentLabel }}</span>
    </div>

    <div v-if="!bedtimeOnly" class="slider-container">
      <input
        type="range"
        min="1"
        max="5"
        :value="modelValue"
        @input="handleInput"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
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

    <div v-if="showHoursInput" class="hours-input-container" :class="{ 'bedtime-only': bedtimeOnly }">
      <div class="time-input-group">
        <label for="bedtime" class="hours-label">
          <Icon name="solar:moon-stars-bold" size="18" />
          Went to bed
        </label>
        <ClientOnly>
          <div class="time-picker-with-button">
            <VueDatePicker
              id="bedtime"
              :model-value="bedtime"
              @update:model-value="emit('update:bedtime', $event)"
              time-picker
              format="hh:mm a"
              model-type="HH:mm"
              :dark="darkMode"
              :time-config="{ is24: false }"
              auto-apply
              class="time-picker"
              :style="{ '--slider-color': config.color }"
            >
              <template #input-icon>
                <span class="picker-icon">
                  <Icon name="solar:clock-circle-bold" size="18" />
                </span>
              </template>
            </VueDatePicker>
            <button 
              type="button" 
              @click="setCurrentTimeBedtime" 
              class="now-button"
              :style="{ '--slider-color': config.color }"
              title="Set current time"
            >
              Now
            </button>
          </div>
        </ClientOnly>
      </div>
      <div v-if="!bedtimeOnly" class="time-input-group">
        <label for="wake-up-time" class="hours-label">
          <Icon name="solar:sun-bold" size="18" />
          Woke up
        </label>
        <ClientOnly>
          <div class="time-picker-with-button">
            <VueDatePicker
              id="wake-up-time"
              :model-value="wakeUpTime"
              @update:model-value="emit('update:wakeUpTime', $event)"
              time-picker
              format="hh:mm a"
              model-type="HH:mm"
              :dark="darkMode"
              :time-config="{ is24: false }"
              auto-apply
              class="time-picker"
              :style="{ '--slider-color': config.color }"
            >
              <template #input-icon>
                <span class="picker-icon">
                  <Icon name="solar:clock-circle-bold" size="18" />
                </span>
              </template>
            </VueDatePicker>
            <button 
              type="button" 
              @click="setCurrentTimeWakeup" 
              class="now-button"
              :style="{ '--slider-color': config.color }"
              title="Set current time"
            >
              Now
            </button>
          </div>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VueDatePicker } from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import type { MetricConfig } from "~/types";

interface Props {
  modelValue: number;
  bedtime?: string | null;
  wakeUpTime?: string | null;
  config: MetricConfig;
  showHoursInput?: boolean;
  bedtimeOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showHoursInput: false,
  bedtime: null,
  wakeUpTime: null,
  bedtimeOnly: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: number];
  "update:bedtime": [value: string | null];
  "update:wakeUpTime": [value: string | null];
}>();

const { darkMode } = useDarkMode();

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

// Track touch interactions to distinguish between scrolling and slider interaction
let touchStartX = 0;
let touchStartY = 0;
let isIntentionalSliderTouch = false;

const handleTouchStart = (event: TouchEvent) => {
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
  isIntentionalSliderTouch = false;
};

const handleTouchMove = (event: TouchEvent) => {
  if (isIntentionalSliderTouch) return;

  const touchMoveX = event.touches[0].clientX;
  const touchMoveY = event.touches[0].clientY;
  const deltaX = Math.abs(touchMoveX - touchStartX);
  const deltaY = Math.abs(touchMoveY - touchStartY);

  // If vertical movement is greater than horizontal, prevent slider interaction
  if (deltaY > deltaX) {
    event.preventDefault();
  } else if (deltaX > 10) {
    // If horizontal movement is intentional (>10px), allow slider interaction
    isIntentionalSliderTouch = true;
  }
};

const setCurrentTimeBedtime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  emit('update:bedtime', `${hours}:${minutes}`);
};

const setCurrentTimeWakeup = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  emit('update:wakeUpTime', `${hours}:${minutes}`);
};
</script>

<style scoped lang="scss">
.metric-slider {
  padding: 1.75rem;
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
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

  &:hover {
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-light);

    &::before {
      opacity: 0.5;
    }

    .emoji {
      transform: scale(1.05);
    }
  }

  .metric-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;

    .metric-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }
  }

  .emoji-display {
    text-align: center;
    margin: 1.75rem 0;
    animation: fadeInScale 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 0.5rem;

    .emoji {
      font-size: 3.5rem;
      display: block;
      margin-bottom: 0.625rem;
      filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
      transition: transform 0.3s ease;
    }

    .label {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      font-weight: 600;
      letter-spacing: -0.01em;
    }
  }

  .slider-container {
    position: relative;
    padding: 0.5rem 0;
    touch-action: pan-y; // Allow vertical scrolling, prevent horizontal pan

    .slider {
      width: 100%;
      height: 10px;
      border-radius: 5px;
      background: var(--slider-track);
      outline: none;
      -webkit-appearance: none;
      appearance: none;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
      touch-action: none; // Allow full control over touch on the slider itself

      &::-webkit-slider-thumb {
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

        &:hover {
          transform: scale(1.25);
          box-shadow:
            0 4px 16px rgba(0, 0, 0, 0.25),
            0 0 0 4px rgba(255, 255, 255, 0.9);
        }

        &:active {
          transform: scale(1.15);
        }
      }

      &::-moz-range-thumb {
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

        &:hover {
          transform: scale(1.25);
          box-shadow:
            0 4px 16px rgba(0, 0, 0, 0.25),
            0 0 0 4px rgba(255, 255, 255, 0.9);
        }

        &:active {
          transform: scale(1.15);
        }
      }
    }

    .slider-markers {
      display: flex;
      justify-content: space-between;
      margin-top: 0.625rem;
      padding: 0 6px;

      .marker {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--marker-inactive);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 2px solid transparent;

        &.active {
          background: var(--slider-color);
          transform: scale(1.3);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          border-color: rgba(255, 255, 255, 0.5);
        }
      }
    }
  }

  .hours-input-container {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    &.bedtime-only {
      grid-template-columns: 1fr;
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }

    .time-input-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .hours-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    .time-picker-with-button {
      display: flex;
      gap: 0.5rem;
      align-items: stretch;
    }

    .time-picker {
      flex: 1;
      --dp-border-radius: var(--radius-lg);
      --dp-input-padding: 0.625rem 0.875rem 0.625rem 2.5rem;
      --dp-background-color: var(--input-bg);
      --dp-text-color: var(--text-primary);
      --dp-border-color: var(--border);
      --dp-border-color-hover: var(--slider-color);
      --dp-primary-color: var(--slider-color);

      :deep(.dp__input) {
        font-family: inherit;
        font-weight: 500;
        font-size: 1rem;
        height: auto;
        border: 1px solid var(--border);
        transition: all 0.2s ease;
        padding-top: 0.625rem;
        padding-bottom: 0.625rem;

        &:hover {
          border-color: var(--slider-color);
        }

        &:focus {
          border-color: var(--slider-color);
        }
      }

      .picker-icon {
        display: flex;
        align-items: center;
        color: var(--text-tertiary);
        margin-left: 0.5rem;
      }
    }

    .now-button {
      padding: 0.625rem 1rem;
      background: var(--slider-color);
      color: white;
      border: none;
      border-radius: var(--radius-lg);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &:hover {
        opacity: 0.9;
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }
  }
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
