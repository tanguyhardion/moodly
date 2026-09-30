// ============================================
// Moodly - Core Type System
// Uses Discriminated Unions for type-safe metric configurations
// ============================================

import type { MetricConfig, MetricType, MetricValue } from './shared';

export * from './shared';

// --- Default Values ---

export function getDefaultValueForType(config: MetricConfig): MetricValue {
  switch (config.type) {
    case 'slider':
      // Unset until the user picks a value, so an untouched scale isn't saved as its minimum
      return null;
    case 'checkbox':
      return false;
    case 'number':
      return config.min ?? 0;
    case 'time':
      return '';
    case 'location':
      return null;
    case 'text':
      return '';
    case 'calculated':
      return null;
  }
}

// --- Metric Type Metadata (for builder UI) ---

export interface MetricTypeOption {
  type: MetricType;
  label: string;
  description: string;
  icon: string;
}

export const METRIC_TYPE_OPTIONS: MetricTypeOption[] = [
  { type: 'slider', label: 'Slider', description: 'Rate on a scale (e.g. 1-5, 1-10)', icon: 'solar:slider-horizontal-bold' },
  { type: 'checkbox', label: 'Checkbox', description: 'Yes/No habit tracking', icon: 'solar:check-square-bold' },
  { type: 'number', label: 'Number', description: 'Quantitative value (e.g. glasses of water)', icon: 'solar:hashtag-bold' },
  { type: 'time', label: 'Time', description: 'Track a specific time (e.g. bedtime)', icon: 'solar:clock-circle-bold' },
  { type: 'location', label: 'Location', description: 'Tag a place or city', icon: 'solar:map-point-bold' },
  { type: 'text', label: 'Text / Note', description: 'Journal entry or short note', icon: 'solar:document-text-bold' },
  { type: 'calculated', label: 'Calculated', description: 'Auto-computed from other metrics (e.g. sleep hours)', icon: 'solar:calculator-bold' },
];
