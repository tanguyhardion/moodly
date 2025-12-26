<script setup lang="ts">
const { darkMode } = useMoodly();
const { streakData, streakMessage, isStreakAtRisk, needsCheckinToday } =
  useStreak();
</script>

<template>
  <div class="streak-wrapper">
    <div
      class="streak-compact"
      :class="{
        'dark-mode': darkMode,
        'at-risk': isStreakAtRisk,
        'has-streak': streakData.currentStreak > 0,
      }"
    >
      <div class="streak-stats">
        <div class="stat-item current">
          <span class="icon">{{ isStreakAtRisk ? '⚠️' : '🔥' }}</span>
          <span class="value">{{ streakData.currentStreak }}</span>
          <span class="label">streak</span>
        </div>
        
        <div class="divider"></div>
        
        <div class="stat-item best">
          <span class="icon">🏆</span>
          <span class="value">{{ streakData.longestStreak }}</span>
          <span class="label">best</span>
        </div>
      </div>
    </div>
    
    <div v-if="(streakData.currentStreak > 0 || needsCheckinToday) && streakMessage" class="streak-toast">
      {{ streakMessage }}
    </div>
  </div>
</template>

<style scoped>
.streak-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.streak-compact {
  display: inline-flex;
  align-items: center;
  background: var(--bg-glass);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1.25rem;
  border-radius: 100px;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.streak-compact:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
}

.streak-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--text-secondary);
  font-size: 0.9375rem;
  font-weight: 600;
}

.stat-item.current {
  color: var(--text-primary);
}

.stat-item.current .value {
  color: var(--primary);
  font-weight: 700;
}

.has-streak .stat-item.current .value {
  color: #f5576c; /* Fire color */
}

.at-risk .stat-item.current .value {
  color: #ff9f43; /* Warning color */
}

.stat-item.best .value {
  color: #fccb90; /* Gold/Trophy color */
  font-weight: 700;
}

.icon {
  font-size: 1.1rem;
  line-height: 1;
}

.label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.7;
  font-weight: 700;
  margin-top: 1px;
}

.divider {
  width: 1px;
  height: 16px;
  background-color: var(--border-color);
}

.streak-toast {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  font-weight: 500;
  opacity: 0.8;
  text-align: center;
  max-width: 300px;
}

/* Dark mode adjustments */
.dark-mode .streak-compact {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-mode .divider {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
