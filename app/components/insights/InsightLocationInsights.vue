<template>
  <section class="insight-section">
    <div class="insight-section-header">
      <Icon name="solar:map-point-bold" size="20" style="color: var(--pink)" />
      <h2 class="insight-section-title">Location Insights</h2>
    </div>
    <div v-for="loc in locationInsights" :key="loc.metricId" class="insight-card">
      <div class="insight-card-title">
        <Icon v-if="loc.icon" :name="loc.icon" size="16" :style="{ color: loc.color }" />
        <Icon v-else name="solar:map-point-bold" size="16" :style="{ color: loc.color }" />
        {{ loc.metricLabel }}
      </div>
      <div class="location-list">
        <div v-for="place in loc.places" :key="place.name" class="location-item">
          <Icon name="solar:map-point-bold" size="13" :style="{ color: loc.color }" />
          <span class="location-name">{{ place.name }}</span>
          <span class="location-visits">{{ place.count }}×</span>
          <div v-if="primaryMetric && place.avgMood !== null" class="location-mood">
            <span class="location-mood-label">avg {{ primaryMetric.label }}</span>
            <span class="location-mood-val" :style="{ color: loc.color }">
              {{ fmtNum(place.avgMood, primaryMetric) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Weather Insights Section -->
    <template v-if="weatherInsights.length > 0">
      <div class="insight-section-header" style="margin-top: 1.5rem">
        <Icon name="solar:cloud-sun-bold" size="20" style="color: var(--primary)" />
        <h2 class="insight-section-title">Weather Insights</h2>
      </div>

      <!-- Weather-Mood Correlation Summary -->
      <div v-if="weatherMoodCorrelation.hasData && weatherMoodCorrelation.summary" class="weather-summary-card">
        <Icon name="solar:lightbulb-bold" size="18" class="summary-icon" />
        <p class="summary-text">{{ weatherMoodCorrelation.summary }}</p>
      </div>

      <!-- Weather Conditions Breakdown -->
      <div class="insight-card">
        <div class="insight-card-title">
          <Icon name="solar:cloud-bolt-bold" size="16" style="color: var(--primary)" />
          Weather &amp; Mood by Condition
        </div>
        <div class="weather-list">
          <div v-for="w in weatherInsights" :key="w.condition" class="weather-item">
            <Icon :name="getWeatherIcon(w.icon)" size="16" class="weather-condition-icon" />
            <span class="weather-condition">{{ w.condition }}</span>
            <span class="weather-count">{{ w.count }}×</span>
            <span v-if="w.avgTemp !== null" class="weather-temp">{{ w.avgTemp }}°C</span>
            <div v-if="primaryMetric && w.avgMood !== null" class="weather-mood">
              <span class="weather-mood-label">avg</span>
              <span class="weather-mood-val">{{ fmtNum(w.avgMood, primaryMetric) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Best & Worst Weather -->
      <div v-if="weatherMoodCorrelation.bestWeather || weatherMoodCorrelation.worstWeather" class="weather-extremes">
        <div v-if="weatherMoodCorrelation.bestWeather" class="weather-extreme-card best">
          <Icon name="solar:face-scan-circle-bold" size="18" class="extreme-icon" />
          <div class="extreme-content">
            <span class="extreme-label">Best {{ primaryMetric?.label || 'mood' }} weather</span>
            <span class="extreme-value">{{ weatherMoodCorrelation.bestWeather.condition }}</span>
            <span v-if="primaryMetric" class="extreme-mood">
              avg {{ fmtNum(weatherMoodCorrelation.bestWeather.avgMood, primaryMetric) }}
            </span>
          </div>
        </div>
        <div v-if="weatherMoodCorrelation.worstWeather" class="weather-extreme-card worst">
          <Icon name="solar:emoji-sad-bold" size="18" class="extreme-icon" />
          <div class="extreme-content">
            <span class="extreme-label">Lowest {{ primaryMetric?.label || 'mood' }} weather</span>
            <span class="extreme-value">{{ weatherMoodCorrelation.worstWeather.condition }}</span>
            <span v-if="primaryMetric" class="extreme-mood">
              avg {{ fmtNum(weatherMoodCorrelation.worstWeather.avgMood, primaryMetric) }}
            </span>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
const { locationInsights, primaryMetric, weatherInsights, weatherMoodCorrelation } = useInsightsData();

function getWeatherIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    'sunny': 'solar:sun-bold',
    'partly-cloudy': 'solar:cloud-sun-bold',
    'cloudy': 'solar:cloud-bold',
    'foggy': 'solar:fog-bold',
    'drizzle': 'solar:cloud-rain-bold',
    'rainy': 'solar:cloud-storm-bold',
    'snowy': 'solar:snowflake-bold',
    'stormy': 'solar:cloud-bolt-bold',
  };
  return iconMap[icon] ?? 'solar:cloud-bold';
}
</script>

<style scoped lang="scss">
.insight-section {
  margin-bottom: 2rem;
}

.insight-section-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1rem;
}

.insight-section-title {
  font-size: 1.0625rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.insight-card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow-sm);
  margin-bottom: 0.875rem;
  transition: box-shadow 0.2s ease;

  &:last-child { margin-bottom: 0; }
  &:hover { box-shadow: var(--shadow-md); }
}

.insight-card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.location-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.location-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--hover-bg);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.location-name {
  flex: 1;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.location-visits {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-tertiary);
}

.location-mood {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-left: 0.5rem;
}

.location-mood-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.location-mood-val {
  font-size: 0.875rem;
  font-weight: 700;
}

// Weather Insights Styles
.weather-summary-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: var(--primary-rgba-08);
  border: 1px solid var(--primary-rgba-20);
  border-radius: var(--radius-lg);
  margin-bottom: 0.875rem;

  .summary-icon {
    flex-shrink: 0;
    color: var(--primary);
    margin-top: 2px;
  }

  .summary-text {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.5;
  }
}

.weather-list {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.weather-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--hover-bg);
  border-radius: var(--radius-md);
  font-size: 0.875rem;

  .weather-condition-icon {
    color: var(--primary);
    flex-shrink: 0;
  }

  .weather-condition {
    flex: 1;
    font-weight: 600;
    color: var(--text-primary);
  }

  .weather-count {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-tertiary);
  }

  .weather-temp {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--text-secondary);
    padding: 0.125rem 0.375rem;
    background: var(--card-bg);
    border-radius: var(--radius-sm);
  }

  .weather-mood {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-left: 0.25rem;

    .weather-mood-label {
      font-size: 0.75rem;
      color: var(--text-tertiary);
    }

    .weather-mood-val {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--primary);
    }
  }
}

.weather-extremes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-top: 0.875rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.weather-extreme-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);

  &.best {
    background: rgba(16, 185, 129, 0.08);
    border-color: rgba(16, 185, 129, 0.2);

    .extreme-icon {
      color: var(--success);
    }
  }

  &.worst {
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.2);

    .extreme-icon {
      color: var(--error);
    }
  }

  .extreme-icon {
    flex-shrink: 0;
    margin-top: 2px;
  }

  .extreme-content {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .extreme-label {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .extreme-value {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .extreme-mood {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }
}
</style>
