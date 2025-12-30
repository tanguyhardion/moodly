<script setup lang="ts">
const props = defineProps<{
  modelValue: {
    healthyFood: boolean;
    caffeine: boolean;
    gym: boolean;
    hardWork: boolean;
    dayOff: boolean;
    alcohol: boolean;
    misc: boolean;
  };
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: typeof props.modelValue): void;
}>();

const updateCheckbox = (key: keyof typeof props.modelValue, value: boolean) => {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
};
</script>

<template>
  <div class="checkboxes-section">
    <div class="checkboxes-header">
      <div class="icon-container">
        <Icon
          name="solar:clipboard-check-bold"
          size="24"
          style="color: #1e40af"
        />
      </div>
      <h3 class="checkboxes-title">Daily Check-ins</h3>
    </div>
    <div class="checkbox-group">
      <label class="checkbox-item">
        <span class="checkbox-control">
          <input
            type="checkbox"
            :checked="modelValue.healthyFood"
            @change="
              updateCheckbox(
                'healthyFood',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          <span class="checkbox-icon" aria-hidden="true">
            <Icon name="solar:leaf-bold" size="18" />
          </span>
        </span>
        <span class="checkbox-label">Healthy Food</span>
      </label>
      <label class="checkbox-item">
        <span class="checkbox-control">
          <input
            type="checkbox"
            :checked="modelValue.caffeine"
            @change="
              updateCheckbox(
                'caffeine',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          <span class="checkbox-icon" aria-hidden="true">
            <Icon name="solar:cup-hot-bold" size="18" />
          </span>
        </span>
        <span class="checkbox-label">Caffeine</span>
      </label>
      <label class="checkbox-item">
        <span class="checkbox-control">
          <input
            type="checkbox"
            :checked="modelValue.gym"
            @change="
              updateCheckbox('gym', ($event.target as HTMLInputElement).checked)
            "
          />
          <span class="checkbox-icon" aria-hidden="true">
            <Icon name="solar:dumbbell-large-bold" size="18" />
          </span>
        </span>
        <span class="checkbox-label">Gym</span>
      </label>
      <label class="checkbox-item">
        <span class="checkbox-control">
          <input
            type="checkbox"
            :checked="modelValue.hardWork"
            @change="
              updateCheckbox(
                'hardWork',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          <span class="checkbox-icon" aria-hidden="true">
            <Icon name="solar:laptop-bold" size="18" />
          </span>
        </span>
        <span class="checkbox-label">Hard Work</span>
      </label>
      <label class="checkbox-item">
        <span class="checkbox-control">
          <input
            type="checkbox"
            :checked="modelValue.dayOff"
            @change="
              updateCheckbox(
                'dayOff',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          <span class="checkbox-icon" aria-hidden="true">
            <Icon name="solar:sofa-bold" size="18" />
          </span>
        </span>
        <span class="checkbox-label">Day Off</span>
      </label>
      <label class="checkbox-item">
        <span class="checkbox-control">
          <input
            type="checkbox"
            :checked="modelValue.alcohol"
            @change="
              updateCheckbox(
                'alcohol',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          <span class="checkbox-icon" aria-hidden="true">
            <Icon name="solar:cup-star-bold" size="18" />
          </span>
        </span>
        <span class="checkbox-label">Alcohol</span>
      </label>
      <label class="checkbox-item">
        <span class="checkbox-control">
          <input
            type="checkbox"
            :checked="modelValue.misc"
            @change="
              updateCheckbox(
                'misc',
                ($event.target as HTMLInputElement).checked,
              )
            "
          />
          <span class="checkbox-icon" aria-hidden="true">
            <Icon name="solar:star-bold" size="18" />
          </span>
        </span>
        <span class="checkbox-label">Misc</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.checkboxes-section {
  margin-bottom: 2rem;
  padding: 1.75rem;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.checkboxes-section:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}

.checkboxes-header {
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.checkboxes-section:hover .icon-container {
  transform: scale(1.1) rotate(-5deg);
}

.checkboxes-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  padding: 1rem 0.875rem;
  border-radius: var(--radius-md);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.checkbox-item:hover {
  background: var(--hover-bg);
  border-color: var(--border-light);
  transform: translateX(2px);
}

.checkbox-control {
  display: inline-block;
  width: 28px;
  height: 28px;
  position: relative;
}

.checkbox-control input[type="checkbox"] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.checkbox-icon {
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 2px solid var(--border);
  background: var(--card-bg);
  color: var(--text-secondary);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.checkbox-control input[type="checkbox"]:checked + .checkbox-icon {
  background: linear-gradient(135deg, #ff6b9d 0%, #ff8db5 100%);
  color: white;
  border-color: var(--primary);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3);
}

.checkbox-control input[type="checkbox"]:focus-visible + .checkbox-icon {
  outline: none;
  box-shadow: 0 0 0 3px var(--focus-ring);
  border-color: var(--primary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  user-select: none;
}
</style>
