const Message = require('../../models/Message');
const User = require('../../models/User');

// Send message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newMessage = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      message
    });

    await newMessage.populate('sender', 'username fullName avatar');
    await newMessage.populate('receiver', 'username fullName avatar');

    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get conversation between two users
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ]
    })
    .populate('sender', 'username fullName avatar')
    .populate('receiver', 'username fullName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    res.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all conversations for a user
const getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { receiver: req.user._id }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', req.user._id] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', req.user._id] },
                    { $eq: ['$isRead', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          user: {
            _id: '$user._id',
            username: '$user.username',
            fullName: '$user.fullName',
            avatar: '$user.avatar',
            isOnline: '$user.isOnline'
          },
          lastMessage: '$lastMessage',
          unreadCount: '$unreadCount'
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark messages as read
const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user.id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get suggested users to chat with
const getDiscoveryUsers = async (req, res) => {
  try {
    // Get users who are not the current user
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('username fullName avatar bio isOnline moodAnalytics')
      .limit(20)
      .sort({ isOnline: -1, createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { sendMessage, getConversation, getConversations, markAsRead, getDiscoveryUsers };