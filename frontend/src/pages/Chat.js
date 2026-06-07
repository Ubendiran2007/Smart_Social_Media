import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/chatAPI';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperAirplaneIcon, 
  HashtagIcon,
  VideoCameraIcon,
  UsersIcon,
  LightBulbIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { AIBadge } from '../components/ui/SiliconValley';
import { useMood } from '../context/MoodContext';

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [discoveryUsers, setDiscoveryUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { socket, sendMessage, startTyping, stopTyping, onlineUsers } = useSocket();
  const { activeMood, theme } = useMood();

  const publicRooms = [
    { id: 'room-startup', name: 'Hustle Room', icon: '🚀', activeCount: 142, mood: 'Motivational' },
    { id: 'room-coding', name: 'Coding Room', icon: '💻', activeCount: 89, mood: 'Productive' },
    { id: 'room-ai', name: 'AI & Machine Learning', icon: '🤖', activeCount: 204, mood: 'Learning' },
    { id: 'room-study', name: 'Study Room', icon: '📚', activeCount: 56, mood: 'Learning' },
    { id: 'room-wellness', name: 'Wellness Room', icon: '🌿', activeCount: 34, mood: 'Calm' },
    { id: 'room-meme', name: 'Meme Lounge', icon: '😂', activeCount: 211, mood: 'Funny' },
    { id: 'room-general', name: 'General Lounge', icon: '✨', activeCount: 531, mood: 'None' }
  ];

  const aiIcebreakers = {
    Motivational: [
      "What are you building this week?",
      "Any recent wins or milestones?",
      "How do you stay disciplined when motivation drops?"
    ],
    Productive: [
      "Working on anything interesting?",
      "What's your preferred tech stack right now?",
      "Need a code review on anything?"
    ],
    Calm: [
      "How do you unplug after a long day?",
      "Read any good books lately?",
      "What's your morning routine?"
    ],
    Learning: [
      "What are you currently learning?",
      "Any good tutorial recommendations?",
      "How do you take notes when studying complex topics?"
    ],
    Funny: [
      "Send me your best dev meme.",
      "What's the most ridiculous bug you've encountered?",
      "Tabs or spaces? (Wrong answers only)"
    ],
    None: [
      "Ask about their latest MERN project",
      "Discuss recent YC startup ideas",
      "Share some modern UI/UX learning resources",
      "Ask for a code review on React hooks"
    ]
  };

  const currentIcebreakers = aiIcebreakers[activeMood] || aiIcebreakers.None;

  // Sort public rooms so the mood-recommended ones appear first
  const sortedRooms = [...publicRooms].sort((a, b) => {
    if (a.mood === activeMood && b.mood !== activeMood) return -1;
    if (a.mood !== activeMood && b.mood === activeMood) return 1;
    return b.activeCount - a.activeCount;
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const initChat = async () => {
      setLoading(true);
      await Promise.all([loadConversations(), loadDiscoveryUsers()]);
      setLoading(false);
    };
    initChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', (message) => {
        if (selectedChat && (message.sender._id === selectedChat._id || message.receiver._id === selectedChat._id)) {
          setMessages(prev => [...prev, message]);
        } else {
          setConversations(prev => prev.map(conv => {
            if (conv.user._id === message.sender._id) {
              return { ...conv, unreadCount: (conv.unreadCount || 0) + 1 };
            }
            return conv;
          }));
        }
      });

      socket.on('userTyping', (data) => {
        if (selectedChat?._id === data.userId) {
          setIsTyping(true);
        }
      });

      socket.on('userStoppedTyping', (data) => {
        if (selectedChat?._id === data.userId) {
          setIsTyping(false);
        }
      });
    }
    return () => {
      socket?.off('newMessage');
      socket?.off('userTyping');
      socket?.off('userStoppedTyping');
    };
  }, [socket, selectedChat]);

  const loadConversations = async () => {
    try {
      const response = await chatAPI.getConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadDiscoveryUsers = async () => {
    try {
      const response = await chatAPI.getDiscoveryUsers();
      setDiscoveryUsers(response.data.users || []);
    } catch (error) {
      console.error('Error loading discovery users:', error);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const response = await chatAPI.getConversation(userId);
      setMessages(response.data.messages || []);
      setConversations(prev => prev.map(conv => {
        if (conv.user._id === userId) return { ...conv, unreadCount: 0 };
        return conv;
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleTyping = () => {
    if (!selectedChat) return;
    startTyping(selectedChat._id);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedChat._id);
    }, 3000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || (!selectedChat && !selectedRoom)) return;

    try {
      if (selectedChat) {
        stopTyping(selectedChat._id);
        const tempMsg = {
          sender: { _id: 'me' },
          message: newMessage,
          createdAt: new Date()
        };
        setMessages(prev => [...prev, tempMsg]);
        
        const res = await chatAPI.sendMessage(selectedChat._id, newMessage);
        sendMessage(selectedChat._id, newMessage);
        
        setMessages(prev => prev.map(m => m === tempMsg ? res.data.message : m));
      } else if (selectedRoom) {
        // Mock sending to a public room
        const tempMsg = {
          sender: { _id: 'me' },
          message: newMessage,
          createdAt: new Date()
        };
        setMessages(prev => [...prev, tempMsg]);
      }
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedRoom(null);
    setSelectedChat(user);
    loadMessages(user._id);
  };

  const handleSelectRoom = (room) => {
    setSelectedChat(null);
    setSelectedRoom(room);
    setMessages([]); // Mock empty messages for room
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-t-accent border-border animate-spin" />
      </div>
    );
  }

  const renderHomeState = () => {
    const recommendedRoom = sortedRooms[0];
    const secondaryRoom = sortedRooms[1];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 overflow-y-auto p-8"
      >
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4 pt-10">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-surface mb-2">
              <span className="text-4xl">{theme.emoji}</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground">Welcome to the Hub</h2>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Your Sentient Mood is set to <strong style={{ color: theme.accent }}>{activeMood}</strong>.
              Join a public room to collaborate, or start a direct message with creators in your network.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[recommendedRoom, secondaryRoom].map((room, idx) => (
              <div 
                key={room.id}
                className={`card-base p-6 hover:border-accent transition-colors cursor-pointer relative overflow-hidden group ${idx === 0 ? 'border-accent/30' : ''}`} 
                onClick={() => handleSelectRoom(room)}
              >
                {idx === 0 && (
                  <div className="absolute top-0 inset-x-0 h-1" style={{ background: theme.gradient }} />
                )}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{room.icon}</span>
                    <h3 className="font-semibold text-foreground">{room.name}</h3>
                  </div>
                  {idx === 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" style={{ backgroundColor: `${theme.accent}20`, color: theme.accent }}>
                      Recommended
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-4">Connect with like-minded individuals.</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs font-medium text-emerald-500">{room.activeCount} Active</span>
                  <span className="text-xs font-medium group-hover:underline" style={{ color: theme.accent }}>Join Room &rarr;</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card-base p-6 bg-surface-hover/50 relative overflow-hidden">
             {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 pointer-events-none" style={{ backgroundColor: theme.accent }} />
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <LightBulbIcon className="w-5 h-5" style={{ color: theme.accent }} />
              <h3 className="font-semibold text-foreground">AI Icebreakers for {activeMood} Mode</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
              {currentIcebreakers.map((ib, i) => (
                <div 
                  key={i} 
                  onClick={() => setNewMessage(ib)}
                  className="p-3 rounded-lg bg-surface border border-border text-xs text-muted-foreground hover:text-foreground hover:border-accent/50 cursor-pointer transition-colors"
                >
                  "{ib}"
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 max-w-7xl mx-auto py-4 px-4">
      {/* Sidebar */}
      <div className="w-72 flex flex-col overflow-hidden card-base p-0 border-r border-border rounded-xl">
        <div className="p-4 border-b border-border bg-surface">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-muted-foreground" /> Collaboration Hub
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide py-4 space-y-6 bg-surface">
          
          {/* Public Rooms */}
          <div className="px-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Public Rooms</h3>
            <div className="space-y-1">
              {sortedRooms.map(room => (
                <div 
                  key={room.id}
                  onClick={() => handleSelectRoom(room)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${selectedRoom?.id === room.id ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'}`}
                >
                  <div className="flex items-center gap-2">
                    <HashtagIcon className="w-4 h-4" />
                    <span className="text-sm font-medium truncate">{room.name}</span>
                    {room.mood === activeMood && activeMood !== 'None' && (
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accent }} />
                    )}
                  </div>
                  <span className="text-[10px] font-medium bg-surface-hover px-1.5 py-0.5 rounded">{room.activeCount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Conversations */}
          {conversations.length > 0 && (
            <div className="px-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Direct Messages</h3>
              <div className="space-y-1">
                {conversations.map((conv) => {
                  const isOnline = onlineUsers.has(conv.user._id);
                  return (
                    <motion.div
                      key={conv.user._id}
                      onClick={() => handleSelectUser(conv.user)}
                      className={`p-2 cursor-pointer rounded-lg transition-all relative flex items-center gap-3 ${
                        selectedChat?._id === conv.user._id ? 'bg-surface-hover' : 'hover:bg-surface-hover'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={conv.user.avatar}
                          alt=""
                          className={`w-8 h-8 rounded-md object-cover ${!isOnline && 'opacity-60 grayscale'}`}
                        />
                        {isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground truncate text-sm">{conv.user.fullName}</p>
                          {conv.unreadCount > 0 && (
                            <span className="w-2 h-2 rounded-full bg-accent" />
                          )}
                        </div>
                        <p className="text-xs truncate text-muted-foreground">
                          {conv.lastMessage?.message || 'Sync Established'}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggested Partners */}
          <div className="px-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              Suggested Partners
            </h3>
            <div className="space-y-1">
              {discoveryUsers.filter(u => !conversations.some(c => c.user._id === u._id)).map((u) => {
                const isOnline = onlineUsers.has(u._id) || u.isOnline;
                return (
                  <motion.div
                    key={u._id}
                    onClick={() => handleSelectUser(u)}
                    className="p-2 cursor-pointer rounded-lg transition-all hover:bg-surface-hover"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0 mt-0.5">
                        <img
                          src={u.avatar}
                          alt=""
                          className={`w-8 h-8 rounded-md object-cover ${!isOnline && 'opacity-60 grayscale'}`}
                        />
                        {isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-surface" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground truncate text-sm">{u.fullName}</p>
                        </div>
                        <p className="text-[10px] text-accent font-medium mt-0.5">
                          {u.moodAnalytics?.currentMood || 'Productive'} Mood
                        </p>
                        <p className="text-xs truncate text-muted-foreground mt-0.5">
                          {u.bio || 'MERN Developer'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-surface border border-border rounded-xl">
        <AnimatePresence mode="wait">
          {!selectedChat && !selectedRoom ? (
            renderHomeState()
          ) : (
            <motion.div
              key={selectedChat?._id || selectedRoom?.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-surface-hover/30">
                <div className="flex items-center gap-3">
                  {selectedRoom ? (
                    <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-xl">
                      {selectedRoom.icon}
                    </div>
                  ) : (
                    <img
                      src={selectedChat.avatar}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover border border-border"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {selectedRoom ? selectedRoom.name : selectedChat.fullName}
                    </p>
                    {selectedRoom ? (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {selectedRoom.activeCount} members online
                      </p>
                    ) : (
                      <p className="text-xs flex items-center gap-1.5">
                        {isTyping ? (
                          <span className="text-accent">typing...</span>
                        ) : (
                          <>
                            <span className={`w-1.5 h-1.5 rounded-full ${onlineUsers.has(selectedChat._id) ? 'bg-emerald-500' : 'bg-muted'}`} />
                            <span className="text-muted-foreground">{onlineUsers.has(selectedChat._id) ? 'Online' : 'Offline'}</span>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedRoom && (
                    <button className="p-1.5 rounded-md hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-colors">
                      <VideoCameraIcon className="w-5 h-5" />
                    </button>
                  )}
                  {selectedChat && (
                    <AIBadge>{selectedChat.username}</AIBadge>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                {messages.length === 0 && selectedRoom && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                    <span className="text-4xl">{selectedRoom.icon}</span>
                    <h3 className="text-lg font-semibold text-foreground">Welcome to {selectedRoom.name}</h3>
                    <p className="text-sm text-muted-foreground">This is the beginning of the room history.</p>
                  </div>
                )}
                {messages.map((msg, idx) => {
                  const isMe = msg.sender._id === 'me' || msg.sender._id === socket?.userId || msg.sender === socket?.userId;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                        <div
                          className={`px-4 py-2.5 rounded-2xl text-sm ${
                            isMe
                              ? 'bg-accent text-white rounded-br-sm'
                              : 'bg-surface-hover text-foreground rounded-bl-sm border border-border'
                          }`}
                        >
                          <p className="leading-relaxed">{msg.message}</p>
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && <span className="ml-2 text-accent/80">✓</span>}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-surface">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder={`Message ${selectedRoom ? selectedRoom.name : selectedChat?.fullName}...`}
                    className="w-full pl-4 pr-12 py-3 rounded-xl bg-surface-hover border border-border text-sm text-foreground placeholder:text-muted focus:ring-1 focus:ring-accent focus:border-accent transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="absolute right-2 p-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:hover:bg-accent"
                  >
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Chat;