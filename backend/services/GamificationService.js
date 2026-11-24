const User = require('../models/User');

class GamificationService {
  constructor() {
    this.XP_RULES = {
      post: { xp: 50, stat: 'postsCreated', label: 'Creating a Post' },
      learn_reel: { xp: 15, stat: 'educationalReelsWatched', label: 'Watching Educational Content' },
      join_room: { xp: 20, stat: 'roomsJoined', label: 'Joining a Collaboration Room' },
      focus_session: { xp: 100, stat: 'focusSessionsCompleted', label: 'Completing a Focus Session' },
      positive_comment: { xp: 20, stat: 'positiveCommentsCount', label: 'Healthy Communication' },
      help_others: { xp: 40, stat: null, label: 'Mentoring/Helping Others' }
    };
  }

  getXpForNextLevel(level) {
    return level * 200; // Level 1->2: 200XP, Level 2->3: 400XP, etc.
  }

  getLevelTitle(level) {
    if (level >= 50) return 'Sentient Master';
    if (level >= 20) return 'Thought Leader';
    if (level >= 10) return 'Community Builder';
    if (level >= 5) return 'Active Creator';
    return 'New Explorer';
  }

  /**
   * Award XP and evaluate badges/achievements
   */
  async awardXP(userId, actionType, details = {}, io = null) {
    try {
      const rule = this.XP_RULES[actionType];
      if (!rule) return null;

      const user = await User.findById(userId);
      if (!user) return null;

      // Ensure gamification fields exist
      if (!user.gamification) {
        user.gamification = {
          xp: 0,
          level: 1,
          streaks: { learning: 0, focus: 0 },
          achievements: [],
          badges: [],
          stats: {
            postsCreated: 0,
            focusSessionsCompleted: 0,
            roomsJoined: 0,
            positiveCommentsCount: 0,
            educationalReelsWatched: 0
          }
        };
      }

      let xpGained = rule.xp;
      let notificationMsg = `+${xpGained} XP: ${rule.label}`;

      // Update stat count
      if (rule.stat && user.gamification.stats) {
        user.gamification.stats[rule.stat] = (user.gamification.stats[rule.stat] || 0) + 1;
      }

      // Handle custom streaks
      if (actionType === 'learn_reel') {
        const today = new Date().toDateString();
        const lastDate = user.gamification.streaks.lastLearningDate 
          ? new Date(user.gamification.streaks.lastLearningDate).toDateString() 
          : null;

        if (!lastDate) {
          user.gamification.streaks.learning = 1;
          user.gamification.streaks.lastLearningDate = new Date();
        } else if (lastDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastDate === yesterday.toDateString()) {
            user.gamification.streaks.learning += 1;
          } else {
            user.gamification.streaks.learning = 1;
          }
          user.gamification.streaks.lastLearningDate = new Date();
        }
      }

      if (actionType === 'focus_session') {
        const today = new Date().toDateString();
        const lastDate = user.gamification.streaks.lastFocusDate 
          ? new Date(user.gamification.streaks.lastFocusDate).toDateString() 
          : null;

        if (!lastDate) {
          user.gamification.streaks.focus = 1;
          user.gamification.streaks.lastFocusDate = new Date();
        } else if (lastDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (lastDate === yesterday.toDateString()) {
            user.gamification.streaks.focus += 1;
          } else {
            user.gamification.streaks.focus = 1;
          }
          user.gamification.streaks.lastFocusDate = new Date();
        }
      }

      // Add XP
      user.gamification.xp += xpGained;

      // Level Up Check
      let levelUp = false;
      let currentLevel = user.gamification.level;
      let nextLevelXp = this.getXpForNextLevel(currentLevel);

      while (user.gamification.xp >= nextLevelXp) {
        user.gamification.xp -= nextLevelXp;
        user.gamification.level += 1;
        currentLevel = user.gamification.level;
        nextLevelXp = this.getXpForNextLevel(currentLevel);
        levelUp = true;
      }

      // Check achievements and badges
      const achievementsUnlocked = this._evaluateAchievements(user, details);
      const badgesUnlocked = this._evaluateBadges(user, details);

      // Save User changes
      await user.save();

      // Send real-time socket events if socket io is provided
      if (io) {
        const socketRoom = userId.toString();
        
        io.to(socketRoom).emit('xpGained', { 
          xp: user.gamification.xp, 
          level: user.gamification.level,
          gained: xpGained,
          reason: rule.label
        });

        if (levelUp) {
          io.to(socketRoom).emit('levelUp', { 
            level: user.gamification.level, 
            title: this.getLevelTitle(user.gamification.level) 
          });
        }

        achievementsUnlocked.forEach(ach => {
          io.to(socketRoom).emit('achievementUnlocked', { achievement: ach });
        });

        badgesUnlocked.forEach(badge => {
          io.to(socketRoom).emit('badgeUnlocked', { badge: badge });
        });
      }

      return {
        xpGained,
        level: user.gamification.level,
        xp: user.gamification.xp,
        levelUp,
        achievementsUnlocked,
        badgesUnlocked
      };
    } catch (error) {
      console.error('awardXP error:', error);
      return null;
    }
  }

  /**
   * Check conditions for achievements
   */
  _evaluateAchievements(user, details) {
    const unlocked = [];
    const hasAch = (id) => user.gamification.achievements.some(a => a.id === id);
    const addAch = (id, name, icon, desc) => {
      if (!hasAch(id)) {
        const achievement = { id, name, icon, description: desc, unlockedAt: new Date() };
        user.gamification.achievements.push(achievement);
        unlocked.push(achievement);
        user.gamification.xp += 100; // Bonus XP for achievement
      }
    };

    const stats = user.gamification.stats;
    const streaks = user.gamification.streaks;

    // 1. 🔥 7-Day Learning Streak
    if (streaks.learning >= 7) {
      addAch('learning-streak-7', '7-Day Learning Streak', '🔥', 'Maintained a learning streak for 7 consecutive days.');
    }

    // 2. 💻 First Coding Room Session
    if (details.roomId === 'room-coding' || (stats.roomsJoined >= 1 && details.roomType === 'coding')) {
      addAch('first-coding-room', 'First Coding Room Session', '💻', 'Collaborated in the coding room for the first time.');
    }

    // 3. 📚 50 Educational Reels Watched
    if (stats.educationalReelsWatched >= 50) {
      addAch('edu-reels-50', '50 Educational Reels Watched', '📚', 'Completed watching 50 educational posts or reels.');
    }

    // 4. 🚀 Startup Contributor
    if (details.roomId === 'room-startup' || (stats.roomsJoined >= 1 && details.roomType === 'startup')) {
      addAch('startup-contributor', 'Startup Contributor', '🚀', 'Shared ideas and networked in the Startup room.');
    }

    // 5. ❤️ Positive Communicator
    if (stats.positiveCommentsCount >= 5) {
      addAch('positive-communicator', 'Positive Communicator', '❤️', 'Exhibited healthy and constructive communication on 5 posts.');
    }

    return unlocked;
  }

  /**
   * Check conditions for badges
   */
  _evaluateBadges(user, details) {
    const unlocked = [];
    const hasBadge = (id) => user.gamification.badges.some(b => b.id === id);
    const addBadge = (id, name, icon, category, desc) => {
      if (!hasBadge(id)) {
        const badge = { id, name, icon, category, description: desc, unlockedAt: new Date() };
        user.gamification.badges.push(badge);
        unlocked.push(badge);
        user.gamification.xp += 150; // Bonus XP for badge
      }
    };

    const stats = user.gamification.stats;
    const burnout = user.moodAnalytics?.burnoutIndex || 0;

    // Wellness Badges
    if (burnout <= 25 && stats.focusSessionsCompleted >= 2) {
      addBadge('badge-balanced', 'Balanced User', '🌿', 'Wellness', 'Maintain high engagement while keeping burnout index under 25%.');
    }
    if (stats.focusSessionsCompleted >= 5) {
      addBadge('badge-focus-champion', 'Focus Champion', '⏳', 'Wellness', 'Complete 5 full-length Pomodoro focus sessions.');
    }
    if (details.screenTimeMinutes < 45 && details.reelsWatchMinutes <= 15 && stats.postsCreated > 0) {
      addBadge('badge-healthy-scroller', 'Healthy Scroller', '👁️', 'Wellness', 'Maintain healthy bounds of usage with rich contributions.');
    }
    if (details.preventedLock || details.recoveredFromBurnout) {
      addBadge('badge-burnout-preventer', 'Burnout Preventer', '🛡️', 'Wellness', 'Recovered burnout scores back into healthy green status.');
    }

    // Collaboration Badges
    if (details.helpOthersCount >= 5 || stats.positiveCommentsCount >= 10) {
      addBadge('badge-top-mentor', 'Top Mentor', '🤝', 'Collaboration', 'Actively support and mentor other builders in study/coding rooms.');
    }
    if (stats.roomsJoined >= 10) {
      addBadge('badge-room-contributor', 'Room Contributor', '💬', 'Collaboration', 'Active participant across 10 creator rooms.');
    }
    if (details.roomId === 'room-study' && stats.roomsJoined >= 3) {
      addBadge('badge-study-partner', 'Study Partner', '📖', 'Collaboration', 'Regular participant in group study focus sprints.');
    }
    
    return unlocked;
  }

  /**
   * Generate AI Insights context based on current progress
   */
  getAIInsights(user) {
    if (!user || !user.gamification) return [];

    const insights = [];
    const level = user.gamification.level;
    const xp = user.gamification.xp;
    const nextLevelXp = this.getXpForNextLevel(level);
    const xpRemaining = nextLevelXp - xp;

    insights.push(`You are ${xpRemaining} XP away from Level ${level + 1} (${this.getLevelTitle(level + 1)}).`);

    const stats = user.gamification.stats;
    const badges = user.gamification.badges;

    // Focus champion hint
    const hasFocusChamp = badges.some(b => b.id === 'badge-focus-champion');
    if (!hasFocusChamp) {
      const remainingFocus = 5 - (stats.focusSessionsCompleted || 0);
      if (remainingFocus > 0) {
        insights.push(`Complete ${remainingFocus} more focus session${remainingFocus > 1 ? 's' : ''} to unlock the "Focus Champion" badge.`);
      }
    }

    // Positive communicator hint
    const hasPositiveComm = user.gamification.achievements.some(a => a.id === 'positive-communicator');
    if (!hasPositiveComm) {
      const remainingComments = 5 - (stats.positiveCommentsCount || 0);
      if (remainingComments > 0) {
        insights.push(`Leave ${remainingComments} positive/constructive comment${remainingComments > 1 ? 's' : ''} to unlock "Positive Communicator".`);
      }
    }

    return insights;
  }
}

module.exports = new GamificationService();
