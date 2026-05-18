import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/chatAPI';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PaperAirplaneIcon, ChatBubbleBottomCenterTextIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { GlassCard, AIBadge } from '../components/ui/SiliconValley';

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [discoveryUsers, setDiscoveryUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { socket, sendMessage, startTyping, stopTyping, onlineUsers } = useSocket();

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
          // Update unread count for other conversations
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
      // Reset unread count locally
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
    if (!newMessage.trim() || !selectedChat) return;

    try {
      stopTyping(selectedChat._id);
      const tempMsg = {
        sender: { _id: 'me' },
        message: newMessage,
        createdAt: new Date()
      };
      setMessages(prev => [...prev, tempMsg]);
      
      const res = await chatAPI.sendMessage(selectedChat._id, newMessage);
      sendMessage(selectedChat._id, newMessage);
      
      // Update local message with real ID and user data
      setMessages(prev => prev.map(m => m === tempMsg ? res.data.message : m));
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 max-w-7xl mx-auto py-4 px-4">
      {/* Conversations List */}
      <GlassCard className="w-1/3 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white italic">Neural Links</h2>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{onlineUsers.size} Active</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2">
          {conversations.length > 0 && (
            <div className="px-6 py-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4">Active Frequencies</h3>
              <div className="space-y-1">
                {conversations.map((conv) => {
                  const isOnline = onlineUsers.has(conv.user._id);
                  return (
                    <motion.div
                      key={conv.user._id}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      onClick={() => {
                        setSelectedChat(conv.user);
                        loadMessages(conv.user._id);
                      }}
                      className={`p-4 cursor-pointer rounded-2xl transition-all relative ${
                        selectedChat?._id === conv.user._id ? 'bg-white/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={conv.user.avatar}
                            alt=""
                            className={`w-10 h-10 rounded-xl object-cover border-2 ${isOnline ? 'border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border-white/5 opacity-50'}`}
                          />
                          {isOnline && <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-black text-white truncate text-[11px] uppercase tracking-widest italic">{conv.user.fullName}</p>
                            {conv.unreadCount > 0 && (
                              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                            )}
                          </div>
                          <p className={`text-[9px] truncate font-bold uppercase tracking-tighter ${isOnline ? 'text-emerald-400' : 'text-white/20'}`}>
                            {conv.lastMessage?.message || 'Sync Established'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Discovery Section */}
          <div className="px-6 py-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4 flex items-center gap-2">
              Neural Discovery <SparklesIcon className="w-3 h-3 text-purple-400" />
            </h3>
            <div className="space-y-1">
              {discoveryUsers.filter(u => !conversations.some(c => c.user._id === u._id)).map((u) => {
                const isOnline = onlineUsers.has(u._id) || u.isOnline;
                return (
                  <motion.div
                    key={u._id}
                    whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.03)' }}
                    onClick={() => {
                      setSelectedChat(u);
                      loadMessages(u._id);
                    }}
                    className="p-4 cursor-pointer rounded-2xl transition-all group border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={u.avatar}
                          alt=""
                          className={`w-10 h-10 rounded-xl object-cover border border-white/10 ${isOnline ? 'opacity-100' : 'opacity-40 grayscale'}`}
                        />
                        {isOnline && <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-black text-white truncate text-[11px] uppercase tracking-widest italic">{u.fullName}</p>
                          <AIBadge className="scale-75 origin-right opacity-0 group-hover:opacity-100 transition-opacity">
                            {u.moodAnalytics?.currentMood || 'NEURAL'}
                          </AIBadge>
                        </div>
                        <p className="text-[9px] truncate font-bold uppercase tracking-tighter text-white/20">
                          {u.bio || 'Neural Creator'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Chat Area */}
      <GlassCard className="flex-1 flex flex-col overflow-hidden relative">
        <AnimatePresence mode="wait">
          {selectedChat ? (
            <motion.div
              key={selectedChat._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Chat Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/2 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedChat.avatar || `https://ui-avatars.com/api/?name=${selectedChat.username}&background=9333ea&color=fff`}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover border border-white/10 shadow-2xl"
                  />
                  <div>
                    <p className="font-black text-white uppercase text-xs tracking-widest italic">{selectedChat.fullName}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-tighter flex items-center gap-2 ${isTyping ? 'text-purple-400' : 'text-emerald-400'}`}>
                      {isTyping ? (
                        <>
                          <div className="flex gap-0.5">
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 h-1 rounded-full bg-purple-500" />
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1 h-1 rounded-full bg-purple-500" />
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1 h-1 rounded-full bg-purple-500" />
                          </div>
                          Neural Transmission...
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {onlineUsers.has(selectedChat._id) ? 'Direct Connection Active' : 'Relay Link (Offline)'}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <AIBadge>{selectedChat.username.toUpperCase()}</AIBadge>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                {messages.map((msg, idx) => {
                  const isMe = msg.sender._id === 'me' || msg.sender._id === socket?.userId || msg.sender === socket?.userId;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-6 py-4 rounded-[2rem] text-sm font-bold relative group ${
                          isMe
                            ? 'bg-gradient-to-tr from-purple-600/80 to-cyan-500/80 text-white rounded-br-none shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                            : 'bg-white/5 text-white/80 rounded-bl-none border border-white/5'
                        }`}
                      >
                        <p className="leading-relaxed">{msg.message}</p>
                        <span className={`absolute -bottom-5 text-[8px] font-black uppercase tracking-widest text-white/10 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'right-2' : 'left-2'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-8 border-t border-white/5 bg-white/2 backdrop-blur-xl">
                <div className="relative group">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Establish connection..."
                    className="w-full pl-8 pr-16 py-5 rounded-[2rem] bg-white/5 border-white/5 text-white font-bold placeholder:text-white/20 focus:ring-2 focus:ring-purple-500/50 transition-all shadow-2xl"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-110 active:scale-95 transition-all"
                  >
                    <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-20"
            >
              <div className="w-24 h-24 rounded-[3rem] bg-white/5 flex items-center justify-center mb-8 relative">
                <ChatBubbleBottomCenterTextIcon className="w-10 h-10 text-white/10" />
                <div className="absolute inset-0 rounded-[3rem] border-2 border-white/5 animate-ping" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic mb-2">Initialize Connection</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Choose a neural node to start transmitting</p>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
};

export default Chat;