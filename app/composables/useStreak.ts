import type { StreakData } from "~/types";

// Global state for streak data
const streakData = ref<StreakData>({
  currentStreak: 0,
  longestStreak: 0,
  lastEntryDate: null,
});

const isLoadingStreak = ref(false);

// Helper to get local date string YYYY-MM-DD
const toLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper to parse YYYY-MM-DD to local Date (at 00:00:00)
const parseLocalDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export function useStreak() {
  /**
   * Calculate streak locally from entry dates
   * @param dates - Array of date strings (ISO format: YYYY-MM-DD)
   */
  const calculateLocalStreak = (dates: string[]): StreakData => {
    if (dates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastEntryDate: null,
      };
    }

    // Sort dates descending to ensure proper order
    const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));

    const today = new Date();
    const todayStr = toLocalDateString(today);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toLocalDateString(yesterday);

    // Check if streak is active (entry today or yesterday)
    const latestDate = sortedDates[0];
    const isStreakActive =
      latestDate === todayStr || latestDate === yesterdayStr;

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak (if active)
    if (isStreakActive) {
      let expectedDate = new Date(today);
      if (latestDate === yesterdayStr) {
        expectedDate = yesterday;
      }
      // Normalize to midnight just in case
      expectedDate.setHours(0, 0, 0, 0);

      for (const dateStr of sortedDates) {
        const expectedStr = toLocalDateString(expectedDate);

        if (dateStr === expectedStr) {
          currentStreak++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let expectedDate = parseLocalDateString(sortedDates[0]!);

    for (let i = 0; i < sortedDates.length; i++) {
      const dateStr = sortedDates[i]!;
      const expectedStr = toLocalDateString(expectedDate);

      if (dateStr === expectedStr) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        // Reset and start new streak from current date
        tempStreak = 1;
        expectedDate = parseLocalDateString(dateStr);
        expectedDate.setDate(expectedDate.getDate() - 1);
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      lastEntryDate: sortedDates[0] || null,
    };
  };

  /**
   * Update streak data from entries
   * @param entries - Array of daily entries
   */
  const updateStreakFromEntries = (entries: any[]) => {
    const dates = entries.map((e) => e.date);
    streakData.value = calculateLocalStreak(dates);
  };

  /**
   * Check if user needs to check in today to maintain streak
   */
  const needsCheckinToday = computed(() => {
    if (!streakData.value.lastEntryDate) return true;

    const today = toLocalDateString(new Date());
    return streakData.value.lastEntryDate !== today;
  });

  /**
   * Check if streak is at risk (no entry today and it's not the first day)
   */
  const isStreakAtRisk = computed(() => {
    if (streakData.value.currentStreak === 0) return false;

    const today = toLocalDateString(new Date());
    return streakData.value.lastEntryDate !== today;
  });

  /**
   * Get motivational message based on streak status
   */
  const streakMessage = computed(() => {
    const { currentStreak } = streakData.value;

    if (currentStreak === 0) {
      return "Start your streak today! 🎯";
    }

    if (isStreakAtRisk.value) {
      return `Don't break your ${currentStreak}-day streak! ⚠️`;
    }

    if (currentStreak === 1) {
      return "Great start! Keep it going! 🔥";
    }

    if (currentStreak < 7) {
      return `${currentStreak} days strong! Keep going! 🔥`;
    }

    if (currentStreak < 30) {
      return `Amazing ${currentStreak}-day streak! 🔥✨`;
    }

    if (currentStreak < 100) {
      return `Incredible ${currentStreak}-day streak! 🔥🏆`;
    }

    return `Legendary ${currentStreak}-day streak! 🔥🏆👑`;
  });

  return {
    streakData,
    isLoadingStreak,
    calculateLocalStreak,
    updateStreakFromEntries,
    needsCheckinToday,
    isStreakAtRisk,
    streakMessage,
  };
}
