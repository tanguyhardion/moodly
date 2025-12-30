<script setup lang="ts">
defineProps<{
  checkInRate: {
    healthyFood: number;
    caffeine: number;
    gym: number;
    hardWork: number;
    alcohol: number;
    misc: number;
  };
}>();
</script>

<template>
  <div class="checkins-card">
    <div class="checkins-header">
      <div class="icon-container">
        <Icon
          name="solar:clipboard-check-bold"
          size="24"
          class="icon-pink"
        />
      </div>
      <h3 class="checkins-title">Daily Check-ins</h3>
    </div>
    <div class="checkins-grid">
      <div class="checkin-stat">
        <div class="checkin-icon healthy-food">
          <Icon name="solar:leaf-bold" size="24" />
        </div>
        <div class="checkin-info">
          <span class="checkin-label">Healthy Food</span>
          <div class="checkin-progress-container">
            <div
              class="checkin-progress-bar"
              :style="{ width: checkInRate.healthyFood + '%' }"
            ></div>
          </div>
          <span class="checkin-percentage">{{ checkInRate.healthyFood }}%</span>
        </div>
      </div>
      <div class="checkin-stat">
        <div class="checkin-icon caffeine">
          <Icon name="solar:cup-hot-bold" size="24" />
        </div>
        <div class="checkin-info">
          <span class="checkin-label">Caffeine</span>
          <div class="checkin-progress-container">
            <div
              class="checkin-progress-bar"
              :style="{ width: checkInRate.caffeine + '%' }"
            ></div>
          </div>
          <span class="checkin-percentage">{{ checkInRate.caffeine }}%</span>
        </div>
      </div>
      <div class="checkin-stat">
        <div class="checkin-icon gym">
          <Icon name="solar:dumbbell-large-bold" size="24" />
        </div>
        <div class="checkin-info">
          <span class="checkin-label">Gym</span>
          <div class="checkin-progress-container">
            <div
              class="checkin-progress-bar"
              :style="{ width: checkInRate.gym + '%' }"
            ></div>
          </div>
          <span class="checkin-percentage">{{ checkInRate.gym }}%</span>
        </div>
      </div>
      <div class="checkin-stat">
        <div class="checkin-icon hard-work">
          <Icon name="solar:laptop-bold" size="24" />
        </div>
        <div class="checkin-info">
          <span class="checkin-label">Hard Work</span>
          <div class="checkin-progress-container">
            <div
              class="checkin-progress-bar"
              :style="{ width: checkInRate.hardWork + '%' }"
            ></div>
          </div>
          <span class="checkin-percentage">{{ checkInRate.hardWork }}%</span>
        </div>
      </div>
      <div class="checkin-stat">
        <div class="checkin-icon alcohol">
          <Icon name="solar:cup-star-bold" size="24" />
        </div>
        <div class="checkin-info">
          <span class="checkin-label">Alcohol</span>
          <div class="checkin-progress-container">
            <div
              class="checkin-progress-bar"
              :style="{ width: checkInRate.alcohol + '%' }"
            ></div>
          </div>
          <span class="checkin-percentage">{{ checkInRate.alcohol }}%</span>
        </div>
      </div>
      <div class="checkin-stat">
        <div class="checkin-icon misc">
          <Icon name="solar:star-bold" size="24" />
        </div>
        <div class="checkin-info">
          <span class="checkin-label">Misc</span>
          <div class="checkin-progress-container">
            <div
              class="checkin-progress-bar"
              :style="{ width: checkInRate.misc + '%' }"
            ></div>
          </div>
          <span class="checkin-percentage">{{ checkInRate.misc }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkins-card {
  padding: 1.75rem;
  background: var(--card-bg);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xl);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.checkins-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}

.checkins-header {
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
  border-radius: var(--radius-lg);
  background: var(--icon-bg);
  box-shadow: var(--shadow-card);
  transition: transform 0.3s ease;
}

.checkins-card:hover .icon-container {
  transform: scale(1.1) rotate(-5deg);
}

.checkins-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.checkins-grid {
  display: grid;
  gap: 1.5rem;
}

.checkin-stat {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: var(--note-bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.checkin-stat:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--border-hover);
}

.checkin-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  flex-shrink: 0;
  transition: transform 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.checkin-stat:hover .checkin-icon {
  transform: scale(1.1) rotate(5deg);
}

.checkin-icon.healthy-food {
  background: linear-gradient(135deg, #34c759 0%, #30d158 100%);
  color: white;
}

.checkin-icon.caffeine {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
}

.checkin-icon.gym {
  background: linear-gradient(135deg, #ff453a 0%, #ff6b6b 100%);
  color: white;
}

.checkin-icon.hard-work {
  background: linear-gradient(135deg, #007aff 0%, #5ac8fa 100%);
  color: white;
}

.checkin-icon.alcohol {
  background: linear-gradient(135deg, #bf5af2 0%, #da8fff 100%);
  color: white;
}

.checkin-icon.misc {
  background: linear-gradient(135deg, #ffd60a 0%, #ffcc00 100%);
  color: white;
}

.checkin-info {
  flex: 1;
  min-width: 0;
}

.checkin-label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.checkin-progress-container {
  width: 100%;
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.checkin-progress-bar {
  height: 100%;
  background: linear-gradient(135deg, #ff6b9d 0%, #ffa06b 100%);
  border-radius: 4px;
  transition: width 0.6s ease;
}

.checkin-percentage {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}
</style>
