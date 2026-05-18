/**
 * Wellness Service
 * Handles burnout detection and digital well-being logic.
 */
class WellnessService {
  /**
   * Tracks user activity and updates burnout index.
   * High session duration and reel counts increase burnout risk.
   */
  async updateActivityMetrics(user, sessionTime, reelsWatched) {
    // Logic: 
    // 1. Every 30 mins of session time adds 10 to burnout index.
    // 2. Every 20 reels watched adds 5 to burnout index.
    // 3. Focus mode usage reduces burnout index.

    let burnoutIncrease = 0;
    burnoutIncrease += Math.floor(sessionTime / 30) * 10;
    burnoutIncrease += Math.floor(reelsWatched / 20) * 5;

    if (user.productivity?.focusMode) {
      burnoutIncrease -= 5;
    }

    user.moodAnalytics.burnoutIndex = Math.min(
      Math.max(user.moodAnalytics.burnoutIndex + burnoutIncrease, 0),
      100
    );

    // AI Recommendation based on burnout index
    let recommendation = 'You are in a healthy synchronization state.';
    if (user.moodAnalytics.burnoutIndex > 70) {
      recommendation = 'CRITICAL: High burnout risk detected. Focus mode recommended.';
    } else if (user.moodAnalytics.burnoutIndex > 40) {
      recommendation = 'WARNING: Moderate digital fatigue. Consider a 5-minute sync break.';
    }

    await user.save();

    return {
      burnoutIndex: user.moodAnalytics.burnoutIndex,
      recommendation,
      isHighRisk: user.moodAnalytics.burnoutIndex > 70
    };
  }

  /**
   * Calculates the best 'Sync Break' type for the user.
   */
  getSuggestedBreak(burnoutIndex) {
    if (burnoutIndex > 80) return { type: 'Deep Rest', duration: 15, activity: 'Meditation' };
    if (burnoutIndex > 50) return { type: 'Hydration Sync', duration: 2, activity: 'Drink Water' };
    return { type: 'Micro Sync', duration: 1, activity: 'Eye Exercise' };
  }
}

module.exports = new WellnessService();
