const User = require('../../models/User');
const GamificationService = require('../../services/GamificationService');

const getGamificationProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize fields if missing
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
      await user.save();
    }

    const nextLevelXp = GamificationService.getXpForNextLevel(user.gamification.level);
    const title = GamificationService.getLevelTitle(user.gamification.level);
    const aiInsights = GamificationService.getAIInsights(user);

    res.json({
      success: true,
      profile: {
        xp: user.gamification.xp,
        level: user.gamification.level,
        title,
        nextLevelXp,
        streaks: user.gamification.streaks,
        achievements: user.gamification.achievements,
        badges: user.gamification.badges,
        stats: user.gamification.stats,
        aiInsights
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve gamification profile', error: error.message });
  }
};

const getLeaderboards = async (req, res) => {
  try {
    // 1. Top Learners (by educationalReelsWatched)
    const topLearners = await User.find({ 'gamification.stats.educationalReelsWatched': { $gt: 0 } })
      .select('username fullName avatar gamification.stats.educationalReelsWatched')
      .sort({ 'gamification.stats.educationalReelsWatched': -1 })
      .limit(10);

    // 2. Top Contributors (by postsCreated)
    const topContributors = await User.find({ 'gamification.stats.postsCreated': { $gt: 0 } })
      .select('username fullName avatar gamification.stats.postsCreated')
      .sort({ 'gamification.stats.postsCreated': -1 })
      .limit(10);

    // 3. Top Collaborators (by roomsJoined)
    const topCollaborators = await User.find({ 'gamification.stats.roomsJoined': { $gt: 0 } })
      .select('username fullName avatar gamification.stats.roomsJoined')
      .sort({ 'gamification.stats.roomsJoined': -1 })
      .limit(10);

    // 4. Top Creators (by total Level & XP)
    const topCreators = await User.find({})
      .select('username fullName avatar gamification.level gamification.xp')
      .sort({ 'gamification.level': -1, 'gamification.xp': -1 })
      .limit(10);

    res.json({
      success: true,
      leaderboards: {
        learners: topLearners.map(u => ({
          username: u.username,
          fullName: u.fullName,
          avatar: u.avatar,
          score: u.gamification.stats.educationalReelsWatched
        })),
        contributors: topContributors.map(u => ({
          username: u.username,
          fullName: u.fullName,
          avatar: u.avatar,
          score: u.gamification.stats.postsCreated
        })),
        collaborators: topCollaborators.map(u => ({
          username: u.username,
          fullName: u.fullName,
          avatar: u.avatar,
          score: u.gamification.stats.roomsJoined
        })),
        creators: topCreators.map(u => ({
          username: u.username,
          fullName: u.fullName,
          avatar: u.avatar,
          level: u.gamification.level,
          xp: u.gamification.xp
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve leaderboards', error: error.message });
  }
};

module.exports = {
  getGamificationProfile,
  getLeaderboards
};
