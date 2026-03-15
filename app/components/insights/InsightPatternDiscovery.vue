<template>
  <section class="insight-section">
    <div class="insight-section-header">
      <Icon name="solar:graph-up-bold" size="20" class="icon-primary" />
      <h2 class="insight-section-title">Pattern Discovery</h2>
    </div>

    <!-- Day of Week -->
    <div class="insight-card">
      <div class="insight-card-title">
        <Icon name="solar:calendar-bold" size="16" />
        Best &amp; Worst Days
      </div>
      <template v-if="dayOfWeekInfo.hasData">
        <div class="dow-badges">
          <div class="dow-badge best">
            <span class="dow-badge-label">Best</span>
            <span class="dow-badge-day">{{ dayOfWeekInfo.bestDay }}</span>
            <span class="dow-badge-val">avg {{ fmtNum(dayOfWeekInfo.bestVal, primaryMetric) }}</span>
          </div>
          <div class="dow-badge worst">
            <span class="dow-badge-label">Worst</span>
            <span class="dow-badge-day">{{ dayOfWeekInfo.worstDay }}</span>
            <span class="dow-badge-val">avg {{ fmtNum(dayOfWeekInfo.worstVal, primaryMetric) }}</span>
          </div>
        </div>
        <div class="chart-wrap">
          <BarChart
            :data="dayOfWeekChartData"
            :height="140"
            :categories="{ v: { name: primaryMetric!.label, color: primaryMetric!.color || '#1e40af' } }"
            :yAxis="['v']"
            :xFormatter="(i: number) => DAY_NAMES[i] ?? ''"
            :hideLegend="true"
            :barPadding="0.3"
            :padding="{ top: 10, right: 10, bottom: 30, left: 30 }"
          />
        </div>
      </template>
      <p v-else class="insight-note">
        <Icon name="solar:info-circle-bold" size="14" />
        Need entries across at least 3 different days of the week to show day patterns.
      </p>
    </div>

    <!-- Trends -->
    <div class="insight-card">
      <div class="insight-card-title">
        <Icon name="solar:graph-new-up-bold" size="16" />
        Trends
      </div>
      <div v-if="trendData.length" class="trends-grid">
        <div v-for="t in trendData" :key="t.metricId" class="trend-item">
          <div class="trend-icon" :style="{ background: hexToRgba(t.color, 0.12) }">
            <Icon v-if="t.icon" :name="t.icon" size="14" :style="{ color: t.color }" />
            <Icon v-else name="solar:chart-2-bold" size="14" :style="{ color: t.color }" />
          </div>
          <div class="trend-info">
            <span class="trend-label">{{ t.label }}</span>
            <div class="trend-direction" :class="t.direction">
              <Icon
                :name="t.direction === 'up' ? 'solar:arrow-up-bold' : t.direction === 'down' ? 'solar:arrow-down-bold' : 'solar:minus-bold'"
                size="12"
              />
              <span>{{ t.summary }}</span>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="insight-note">
        <Icon name="solar:info-circle-bold" size="14" />
        Need at least 5 entries per metric to detect trends.
      </p>
    </div>

    <!-- Correlations -->
    <div class="insight-card">
      <div class="insight-card-title">
        <Icon name="solar:link-bold" size="16" />
        Correlations
      </div>
      <div v-if="correlationPairs.length" class="corr-list">
        <div v-for="c in correlationPairs" :key="c.key" class="corr-item">
          <div class="corr-labels">
            <span class="corr-metric">{{ c.labelA }}</span>
            <Icon name="solar:link-bold" size="11" style="color: var(--text-tertiary); flex-shrink: 0" />
            <span class="corr-metric">{{ c.labelB }}</span>
          </div>
          <div class="corr-bar-wrap">
            <div
              class="corr-bar"
              :class="c.r > 0 ? 'positive' : 'negative'"
              :style="{ width: Math.abs(c.r) * 100 + '%' }"
            />
          </div>
          <span class="corr-value" :class="c.r > 0 ? 'positive' : 'negative'">
            {{ c.r > 0 ? '+' : '' }}{{ (c.r * 100).toFixed(0) }}%
          </span>
        </div>
      </div>
      <p v-else class="insight-note">
        <Icon name="solar:info-circle-bold" size="14" />
        Need at least 2 numeric metrics with 5+ shared entries to detect correlations.
      </p>
    </div>

    <!-- Triggers -->
    <div v-if="triggers.length" class="insight-card">
      <div class="insight-card-title">
        <Icon name="solar:bolt-bold" size="16" />
        Triggers
      </div>
      <p class="insight-card-subtitle">Effect of habits on {{ primaryMetric!.label }}</p>
      <div class="triggers-list">
        <div v-for="t in triggers" :key="t.metricId" class="trigger-item">
          <div class="trigger-icon" :style="{ background: hexToRgba(t.color, 0.12) }">
            <Icon v-if="t.icon" :name="t.icon" size="14" :style="{ color: t.color }" />
            <Icon v-else name="solar:check-square-bold" size="14" :style="{ color: t.color }" />
          </div>
          <div class="trigger-info">
            <span class="trigger-label">{{ t.label }}</span>
            <div class="trigger-rows">
              <span class="trigger-row">✓ {{ fmtNum(t.avgWhenChecked, primaryMetric) }}</span>
              <span class="trigger-row muted">✗ {{ fmtNum(t.avgWhenUnchecked, primaryMetric) }}</span>
            </div>
          </div>
          <div class="trigger-delta" :class="t.delta > 0 ? 'positive' : t.delta < 0 ? 'negative' : 'neutral'">
            <Icon
              :name="t.delta > 0 ? 'solar:arrow-up-bold' : t.delta < 0 ? 'solar:arrow-down-bold' : 'solar:minus-bold'"
              size="12"
            />
            {{ t.delta > 0 ? '+' : '' }}{{ fmtNum(Math.abs(t.delta), primaryMetric) }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { primaryMetric, dayOfWeekInfo, dayOfWeekChartData, trendData, correlationPairs, triggers } = useInsightsData();
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
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

.insight-card-subtitle {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  margin: -0.5rem 0 1rem;
}

.insight-note {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  font-style: italic;
}

.chart-wrap {
  margin-top: 0.75rem;
  border-radius: var(--radius-md);
  overflow: hidden;
}

// ── Day of Week ────────────────────────────────────────────────────────────────

.dow-badges {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.dow-badge {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.625rem 1rem;
  border-radius: var(--radius-lg);
  flex: 1;

  &.best {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
  }

  &.worst {
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.15);
  }

  .dow-badge-label {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-tertiary);
  }

  .dow-badge-day {
    font-size: 1.125rem;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

  .dow-badge-val {
    font-size: 0.8125rem;
    color: var(--text-secondary);
    font-weight: 500;
  }
}

// ── Trends ─────────────────────────────────────────────────────────────────────

.trends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.625rem;
}

.trend-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.75rem;
  background: var(--hover-bg);
  border-radius: var(--radius-md);
}

.trend-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.trend-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.trend-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trend-direction {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;

  &.up { color: var(--success); }
  &.down { color: var(--error); }
  &.flat { color: var(--text-tertiary); }
}

// ── Correlations ───────────────────────────────────────────────────────────────

.corr-list {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.corr-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 0.75rem;
}

.corr-labels {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
  overflow: hidden;
}

.corr-metric {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.corr-bar-wrap {
  width: 80px;
  height: 6px;
  background: var(--hover-bg);
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 1px solid var(--border);
}

.corr-bar {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.4s ease;

  &.positive { background: var(--success); }
  &.negative { background: var(--error); }
}

.corr-value {
  font-size: 0.8125rem;
  font-weight: 700;
  min-width: 36px;
  text-align: right;

  &.positive { color: var(--success); }
  &.negative { color: var(--error); }
}

// ── Triggers ───────────────────────────────────────────────────────────────────

.triggers-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.trigger-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  background: var(--hover-bg);
  border-radius: var(--radius-md);
}

.trigger-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.trigger-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.trigger-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.trigger-rows {
  display: flex;
  gap: 0.75rem;
}

.trigger-row {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;

  &.muted { color: var(--text-tertiary); }
}

.trigger-delta {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.875rem;
  font-weight: 700;
  flex-shrink: 0;

  &.positive { color: var(--success); }
  &.negative { color: var(--error); }
  &.neutral { color: var(--text-tertiary); }
}
</style>
