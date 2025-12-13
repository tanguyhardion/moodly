import type { MoodEntry, MetricType } from "~/types";
import {
  sampleCorrelation,
  linearRegression,
  linearRegressionLine,
  variance,
} from "simple-statistics";

interface InsightResult {
  icon: string;
  text: string;
  category:
    | "patterns"
    | "correlations"
    | "predictions"
    | "achievements"
    | "recommendations";
  confidence: number; // 0-1
}

export const useAdvancedInsights = () => {
  /**
   * Calculate correlation between two metrics
   * Returns value between -1 (negative correlation) and 1 (positive correlation)
   */
  const calculateCorrelation = (data1: number[], data2: number[]): number => {
    if (data1.length !== data2.length || data1.length === 0) return 0;

    try {
      return sampleCorrelation(data1, data2);
    } catch {
      return 0;
    }
  };

  /**
   * Detect patterns: if metric X is high, what happens in the next few days?
   */
  const detectSequentialPatterns = (
    entries: MoodEntry[],
    metric: MetricType,
    lookAhead: number = 2
  ): { avgFollowingValue: number; count: number; threshold: number } | null => {
    if (entries.length < lookAhead + 2) return null;

    const sortedEntries = [...entries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const threshold = 4; // High metric value
    let totalFollowingValues = 0;
    let count = 0;

    for (let i = 0; i < sortedEntries.length - lookAhead; i++) {
      if (sortedEntries[i]!.metrics[metric] >= threshold) {
        // Calculate average of next few days
        let followingSum = 0;
        for (let j = 1; j <= lookAhead; j++) {
          followingSum += sortedEntries[i + j]!.metrics[metric];
        }
        totalFollowingValues += followingSum / lookAhead;
        count++;
      }
    }

    if (count === 0) return null;

    return {
      avgFollowingValue: totalFollowingValues / count,
      count,
      threshold,
    };
  };

  /**
   * Detect checkbox impact on metrics
   */
  const detectCheckboxImpact = (
    entries: MoodEntry[],
    checkboxKey: keyof NonNullable<MoodEntry["checkboxes"]>,
    metric: MetricType
  ): { impact: number; sampleSize: number } => {
    const withCheckbox = entries.filter(
      (e) => e.checkboxes?.[checkboxKey] === true
    );
    const withoutCheckbox = entries.filter(
      (e) => e.checkboxes?.[checkboxKey] === false
    );

    if (withCheckbox.length === 0 || withoutCheckbox.length === 0) {
      return { impact: 0, sampleSize: 0 };
    }

    const avgWith =
      withCheckbox.reduce((sum, e) => sum + e.metrics[metric], 0) /
      withCheckbox.length;
    const avgWithout =
      withoutCheckbox.reduce((sum, e) => sum + e.metrics[metric], 0) /
      withoutCheckbox.length;

    return {
      impact: avgWith - avgWithout,
      sampleSize: Math.min(withCheckbox.length, withoutCheckbox.length),
    };
  };

  /**
   * Detect day of week patterns
   */
  const detectDayOfWeekPattern = (
    entries: MoodEntry[],
    metric: MetricType
  ): { bestDay: string; worstDay: string; variance: number } | null => {
    if (entries.length < 7) return null;

    const dayAverages: { [key: number]: { sum: number; count: number } } = {};

    entries.forEach((entry) => {
      const day = new Date(entry.date).getDay(); // 0 = Sunday, 6 = Saturday
      if (!dayAverages[day]) {
        dayAverages[day] = { sum: 0, count: 0 };
      }
      dayAverages[day].sum += entry.metrics[metric];
      dayAverages[day].count++;
    });

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    let bestDay = "";
    let worstDay = "";
    let maxAvg = -Infinity;
    let minAvg = Infinity;
    const avgs: number[] = [];

    Object.entries(dayAverages).forEach(([day, data]) => {
      const avg = data.sum / data.count;
      avgs.push(avg);

      if (avg > maxAvg && data.count >= 2) {
        maxAvg = avg;
        bestDay = dayNames[parseInt(day)]!;
      }
      if (avg < minAvg && data.count >= 2) {
        minAvg = avg;
        worstDay = dayNames[parseInt(day)]!;
      }
    });

    // Calculate variance
    const varianceValue = avgs.length > 0 ? variance(avgs) : 0;

    return { bestDay, worstDay, variance: varianceValue };
  };

  /**
   * Detect streaks
   */
  const detectStreaks = (
    entries: MoodEntry[],
    metric: MetricType,
    threshold: number
  ): { currentStreak: number; longestStreak: number } => {
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = 0; i < sortedEntries.length; i++) {
      if (sortedEntries[i]!.metrics[metric] >= threshold) {
        tempStreak++;
        if (i === 0 || currentStreak === i) {
          currentStreak = tempStreak;
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { currentStreak, longestStreak };
  };

  /**
   * Predict next day's metric based on recent trend
   */
  const predictNextValue = (
    entries: MoodEntry[],
    metric: MetricType,
    days: number = 7
  ): number | null => {
    if (entries.length < 3) return null;

    const sortedEntries = [...entries]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-days);

    try {
      // Prepare data for linear regression
      const data = sortedEntries.map((e, i) => [i, e.metrics[metric]] as [number, number]);
      
      // Calculate linear regression
      const regression = linearRegression(data);
      const predict = linearRegressionLine(regression);
      
      // Predict next value (x = n)
      const prediction = predict(data.length);

      // Clamp between 1 and 5
      return Math.max(1, Math.min(5, prediction));
    } catch {
      // Fallback to mean if regression fails
      const yValues = sortedEntries.map((e) => e.metrics[metric]);
      const yMean = yValues.reduce((sum, val) => sum + val, 0) / yValues.length;
      return Math.max(1, Math.min(5, yMean));
    }
  };

  /**
   * Generate all advanced insights
   */
  const generateAdvancedInsights = (
    entries: MoodEntry[],
    metricConfigs: any[],
    selectedDays: number
  ): InsightResult[] => {
    if (entries.length < 3) return [];

    const insights: InsightResult[] = [];
    const metricNames = {
      mood: "mood",
      energy: "energy",
      sleep: "sleep quality",
      focus: "focus",
    };

    // 1. CORRELATION INSIGHTS
    const metrics: MetricType[] = ["mood", "energy", "sleep", "focus"];
    for (let i = 0; i < metrics.length; i++) {
      for (let j = i + 1; j < metrics.length; j++) {
        const metric1 = metrics[i]!;
        const metric2 = metrics[j]!;

        const data1 = entries.map((e) => e.metrics[metric1]);
        const data2 = entries.map((e) => e.metrics[metric2]);

        const correlation = calculateCorrelation(data1, data2);

        if (Math.abs(correlation) >= 0.6 && entries.length >= 7) {
          const confidence = Math.min(Math.abs(correlation), 0.95);
          if (correlation > 0) {
            insights.push({
              icon: "solar:link-circle-bold",
              text: `Strong link detected: Better ${
                metricNames[metric1]
              } correlates with better ${metricNames[metric2]} (${Math.round(
                correlation * 100
              )}% correlation)`,
              category: "correlations",
              confidence,
            });
          } else {
            insights.push({
              icon: "solar:link-broken-bold",
              text: `Inverse relationship: Higher ${metricNames[metric1]} tends to mean lower ${metricNames[metric2]}`,
              category: "correlations",
              confidence,
            });
          }
        }
      }
    }

    // 2. SEQUENTIAL PATTERN INSIGHTS
    metrics.forEach((metric) => {
      const pattern = detectSequentialPatterns(entries, metric, 2);
      if (pattern && pattern.count >= 3) {
        const avgDiff = pattern.avgFollowingValue - pattern.threshold;
        const confidence = Math.min(pattern.count / 10, 0.9);

        if (avgDiff > 0.5) {
          insights.push({
            icon: "solar:chart-2-bold",
            text: `Pattern found: High ${metricNames[metric]} days (${
              pattern.threshold
            }+) tend to be followed by continued good ${
              metricNames[metric]
            } (avg ${pattern.avgFollowingValue.toFixed(1)})`,
            category: "patterns",
            confidence,
          });
        } else if (avgDiff < -0.5) {
          insights.push({
            icon: "solar:chart-bold",
            text: `Watch out: High ${
              metricNames[metric]
            } days often precede a dip (avg drops to ${pattern.avgFollowingValue.toFixed(
              1
            )})`,
            category: "patterns",
            confidence,
          });
        }
      }
    });

    // 3. CHECKBOX IMPACT INSIGHTS
    const checkboxes: Array<{
      key: keyof NonNullable<MoodEntry["checkboxes"]>;
      name: string;
    }> = [
      { key: "healthyFood", name: "eating healthy" },
      { key: "caffeine", name: "caffeine" },
      { key: "gym", name: "gym" },
      { key: "hardWork", name: "hard work" },
    ];

    checkboxes.forEach((checkbox) => {
      metrics.forEach((metric) => {
        const impact = detectCheckboxImpact(entries, checkbox.key, metric);
        if (impact.sampleSize >= 3 && Math.abs(impact.impact) >= 0.5) {
          const confidence = Math.min(impact.sampleSize / 10, 0.85);

          if (impact.impact > 0) {
            insights.push({
              icon: "solar:chart-square-bold",
              text: `${
                checkbox.name.charAt(0).toUpperCase() + checkbox.name.slice(1)
              } boosts your ${metricNames[metric]} by ${impact.impact.toFixed(
                1
              )} points on average`,
              category: "correlations",
              confidence,
            });
          } else {
            insights.push({
              icon: "solar:danger-triangle-bold",
              text: `${
                checkbox.name.charAt(0).toUpperCase() + checkbox.name.slice(1)
              } may reduce your ${metricNames[metric]} by ${Math.abs(
                impact.impact
              ).toFixed(1)} points`,
              category: "correlations",
              confidence,
            });
          }
        }
      });
    });

    // 4. DAY OF WEEK PATTERNS
    if (selectedDays >= 14) {
      metrics.forEach((metric) => {
        const dayPattern = detectDayOfWeekPattern(entries, metric);
        if (dayPattern && dayPattern.variance > 0.3) {
          insights.push({
            icon: "solar:calendar-mark-bold",
            text: `Weekly pattern: Your ${metricNames[metric]} tends to be highest on ${dayPattern.bestDay}s and lowest on ${dayPattern.worstDay}s`,
            category: "patterns",
            confidence: 0.75,
          });
        }
      });
    }

    // 5. STREAK ACHIEVEMENTS
    metrics.forEach((metric) => {
      const streaks = detectStreaks(entries, metric, 4);
      if (streaks.currentStreak >= 3) {
        insights.push({
          icon: "solar:fire-bold",
          text: `${streaks.currentStreak}-day streak of great ${metricNames[metric]}! Keep it going!`,
          category: "achievements",
          confidence: 1.0,
        });
      }
      if (
        streaks.longestStreak >= 5 &&
        streaks.longestStreak > streaks.currentStreak
      ) {
        insights.push({
          icon: "solar:cup-star-bold",
          text: `Your record: ${streaks.longestStreak} consecutive days of high ${metricNames[metric]}. Can you beat it?`,
          category: "achievements",
          confidence: 1.0,
        });
      }
    });

    // 6. PREDICTIONS
    if (selectedDays >= 7) {
      metrics.forEach((metric) => {
        const prediction = predictNextValue(entries, metric, 7);
        if (prediction !== null) {
          const recentAvg =
            entries.slice(-3).reduce((sum, e) => sum + e.metrics[metric], 0) /
            3;
          const trend = prediction - recentAvg;

          if (Math.abs(trend) >= 0.3) {
            const direction = trend > 0 ? "improve" : "decline";
            const icon =
              trend > 0 ? "solar:arrow-up-bold" : "solar:arrow-down-bold";

            insights.push({
              icon,
              text: `Trend forecast: Your ${
                metricNames[metric]
              } is likely to ${direction} (predicted: ${prediction.toFixed(
                1
              )}/5)`,
              category: "predictions",
              confidence: 0.65,
            });
          }
        }
      });
    }

    // 7. RECOMMENDATIONS
    const overallMoodAvg =
      entries.reduce((sum, e) => sum + e.metrics.mood, 0) / entries.length;

    if (overallMoodAvg < 3) {
      const sleepAvg =
        entries.reduce((sum, e) => sum + e.metrics.sleep, 0) / entries.length;
      if (sleepAvg < 3) {
        insights.push({
          icon: "solar:moon-stars-bold",
          text: `Recommendation: Your mood might improve by focusing on better sleep quality`,
          category: "recommendations",
          confidence: 0.8,
        });
      }

      const gymRate =
        entries.filter((e) => e.checkboxes?.gym).length / entries.length;
      if (gymRate < 0.3) {
        insights.push({
          icon: "solar:running-round-bold",
          text: `Recommendation: Regular exercise could help boost your overall mood`,
          category: "recommendations",
          confidence: 0.75,
        });
      }
    }

    // Sort by confidence and return top insights
    return insights.sort((a, b) => b.confidence - a.confidence).slice(0, 12);
  };

  return {
    generateAdvancedInsights,
  };
};
