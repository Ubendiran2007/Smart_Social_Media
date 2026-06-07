import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/chatAPI';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useMood } from '../context/MoodContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PaperAirplaneIcon, 
  HashtagIcon,
  VideoCameraIcon,
  UsersIcon,
  LightBulbIcon,
  BoltIcon,
  CodeBracketIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { AIBadge, GlassCard } from '../components/ui/SiliconValley';

// --- Specialized Room Widgets ---

const PomodoroWidget = ({ roomId }) => {
  const { socket, startPomodoro } = useSocket();
  const [timer, setTimer] = useState(null); // { timeLeft, state: 'work'|'break' }
  
  useEffect(() => {
    if (!socket) return;
    const handleStarted = (data) => {
      if (data.roomId === roomId) {
        setTimer({ timeLeft: data.durationMinutes * 60, state: 'work' });
      }
    };
    socket.on('pomodoroStarted', handleStarted);
    return () => socket.off('pomodoroStarted', handleStarted);
  }, [socket, roomId]);

  useEffect(() => {
    if (!timer || timer.timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimer(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleStart = () => startPomodoro(roomId, 25);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="p-4 bg-surface-hover/50 rounded-xl border border-border">
      <div className="flex items-center gap-2 mb-3">
        <ClockIcon className="w-4 h-4 text-emerald-500" />
        <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Global Timer</h4>
      </div>
      {timer && timer.timeLeft > 0 ? (
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-emerald-500 mb-2">{formatTime(timer.timeLeft)}</div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Deep Work Phase</p>
        </div>
      ) : (
        <button 
          onClick={handleStart}
          className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 rounded-lg text-xs font-bold transition-colors"
        >
          Start 25m Focus Session
        </button>
      )}
    </div>
  );
};

const RoomAnalyticsWidget = ({ messages, membersCount }) => {
  // Simple analytics logic for UI demonstration
  const messagesToday = messages.length; // In real app, filter by today's date
  
  // Find top contributor (most messages)
  const contributors = {};
  messages.forEach(msg => {
    const username = msg.sender?.username;
    if (username) {
      contributors[username] = (contributors[username] || 0) + 1;
    }
  });
  const sortedContributors = Object.entries(contributors).sort((a, b) => b[1] - a[1]);
  const topContributor = sortedContributors.length > 0 ? sortedContributors[0][0] : 'None yet';

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <ChartBarIcon className="w-4 h-4 text-accent" />
        <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Room Analytics</h4>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Members Online</span>
          <span className="text-xs font-bold text-emerald-500">{membersCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Messages Today</span>
          <span className="text-xs font-bold text-foreground">{messagesToday}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Top Contributor</span>
          <span className="text-xs font-bold text-accent">@{topContributor}</span>
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

const CollaborationHub = () => {
  const { user } = useAuth();
  const { activeMood, theme } = useMood();
  const { socket, joinRoom, leaveRoom, sendRoomMessage, onlineUsers } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [discoveryUsers, setDiscoveryUsers] = useState([]);
  
  const [selectedChat, setSelectedChat] = useState(null); // Direct Message User
  const [selectedRoom, setSelectedRoom] = useState(null); // Public Room Object
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [roomMembersCount, setRoomMembersCount] = useState({});
  const messagesEndRef = useRef(null);

  const publicRooms = [
    { id: 'room-coding', name: 'Coding Room', icon: '💻', mood: 'Productive', desc: 'Live coding, code snippets, GitHub sync', badge: 'Tech' },
    { id: 'room-startup', name: 'Startup Room', icon: '🚀', mood: 'Motivational', desc: 'Idea pitching, founder networking', badge: 'Business' },
    { id: 'room-study', name: 'Study Room', icon: '📚', mood: 'Learning', desc: 'Learning goals, resource sharing', badge: 'Edu' },
    { id: 'room-pomodoro', name: 'Focus Room', icon: '⏳', mood: 'Productive', desc: 'Synced global Pomodoro timer', badge: 'Focus' },
    { id: 'room-ai', name: 'AI Builder Room', icon: '🤖', mood: 'Learning', desc: 'AI resource sharing, prompt engineering', badge: 'AI' },
    { id: 'room-design', name: 'Design Room', icon: '🎨', mood: 'Calm', desc: 'UI/UX critiques, inspiration', badge: 'Creative' },
    { id: 'room-general', name: 'General Lounge', icon: '✨', mood: 'None', desc: 'Chill and talk about anything', badge: 'Social' }
  ];

  const aiIcebreakers = {
    Motivational: ["What are you building this week?", "Any recent wins or milestones?", "How do you stay disciplined?"],
    Productive: ["Working on anything interesting?", "What's your preferred tech stack right now?", "Need a code review?"],
    Calm: ["How do you unplug after a long day?", "Read any good books lately?", "Share your best UI/UX resource."],
    Learning: ["What are you currently learning?", "Any good tutorial recommendations?", "Let's share study goals."],
    Funny: ["Send me your best dev meme.", "What's the most ridiculous bug you've encountered?", "Tabs or spaces?"],
    None: ["What's everyone working on?", "Share your latest project!", "Any good resources to share?"]
  };

  const currentIcebreakers = aiIcebreakers[activeMood] || aiIcebreakers.None;

  const sortedRooms = [...publicRooms].sort((a, b) => {
    if (a.mood === activeMood && b.mood !== activeMood) return -1;
    if (a.mood !== activeMood && b.mood === activeMood) return 1;
    return 0;
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
  }, [messages]);

  useEffect(() => {
    if (!socket) return;
    
    const handleNewRoomMsg = (data) => {
      if (selectedRoom && data.roomId === selectedRoom.id) {
        setMessages(prev => [...prev, data.message]);
      }
    };
    
    const handleRoomHistory = (data) => {
      if (selectedRoom && data.roomId === selectedRoom.id) {
        setMessages(data.messages);
      }
    };

    const handleRoomMembers = (data) => {
      setRoomMembersCount(prev => ({ ...prev, [data.roomId]: data.count }));
    };

    socket.on('newRoomMessage', handleNewRoomMsg);
    socket.on('roomHistory', handleRoomHistory);
    socket.on('roomMembersUpdate', handleRoomMembers);

    return () => {
      socket.off('newRoomMessage', handleNewRoomMsg);
      socket.off('roomHistory', handleRoomHistory);
      socket.off('roomMembersUpdate', handleRoomMembers);
    };
  }, [socket, selectedRoom]);

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

  const handleSelectRoom = (room) => {
    if (selectedRoom) leaveRoom(selectedRoom.id);
    setSelectedChat(null);
    setSelectedRoom(room);
    setMessages([]);
    joinRoom(room.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || (!selectedChat && !selectedRoom)) return;

    if (selectedRoom) {
      const isCode = newMessage.startsWith('```') && newMessage.endsWith('```');
      sendRoomMessage(selectedRoom.id, newMessage, isCode ? 'code' : 'text');
    } else if (selectedChat) {
       // Mock DM for now
       setMessages(prev => [...prev, { sender: { _id: user._id }, message: newMessage, createdAt: new Date() }]);
    }
    setNewMessage('');
  };

  const renderMessageContent = (msg) => {
    if (msg.message.startsWith('```') && msg.message.endsWith('```')) {
      const codeContent = msg.message.replace(/```[a-z]*\n?/g, '').replace(/```$/, '');
      return (
        <div className="bg-[#1e1e1e] p-3 rounded-lg mt-1 border border-border overflow-x-auto text-xs font-mono text-cyan-400">
          <pre><code>{codeContent}</code></pre>
        </div>
      );
    }
    return <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 rounded-full border-4 border-t-accent border-border animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 max-w-[1400px] mx-auto py-4 px-4">
      {/* ── Left Sidebar (Servers / Rooms) ── */}
      <div className="w-72 flex flex-col overflow-hidden bg-surface border border-border rounded-xl">
        <div className="p-4 border-b border-border bg-surface-hover/30 flex items-center gap-3">
          <div className="p-2 bg-accent/10 rounded-lg">
            <SparklesIcon className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Creator Rooms</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Real-time Ecosystem</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-hide py-4 space-y-6">
          <div className="px-3">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2 flex items-center justify-between">
              <span>Public Hubs</span>
              <span className="bg-surface-hover px-1.5 py-0.5 rounded text-[9px]">{publicRooms.length}</span>
            </h3>
            <div className="space-y-0.5">
              {sortedRooms.map(room => {
                const isActive = selectedRoom?.id === room.id;
                return (
                  <button 
                    key={room.id}
                    onClick={() => handleSelectRoom(room)}
                    className={`w-full flex flex-col text-left px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-accent/10 border border-accent/20' 
                        : 'hover:bg-surface-hover border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{room.icon}</span>
                        <span className={`text-sm font-semibold ${isActive ? 'text-accent' : 'text-foreground'}`}>{room.name}</span>
                        {room.mood === activeMood && activeMood !== 'None' && (
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.accent }} />
                        )}
                      </div>
                      <span className="text-[10px] font-bold bg-surface-hover border border-border px-1.5 py-0.5 rounded-md text-muted-foreground">
                        {roomMembersCount[room.id] || room.activeCount || 0}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Middle Chat Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-surface border border-border rounded-xl">
        {!selectedRoom && !selectedChat ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-surface-hover border border-border rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl">
                {theme.emoji}
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Sentient Rooms</h2>
              <p className="text-muted-foreground text-sm mb-8">
                Your mood is set to <strong style={{ color: theme.accent }}>{activeMood}</strong>. Select a room on the left to start collaborating in real-time.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={selectedRoom?.id || selectedChat?._id}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col h-full"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-hover/30 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedRoom?.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-foreground">{selectedRoom?.name}</h2>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface border border-border text-muted-foreground">
                      {selectedRoom?.badge}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{selectedRoom?.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-surface border border-border rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-foreground">{roomMembersCount[selectedRoom?.id] || 0} Online</span>
                </div>
              </div>
            </div>

            {/* Chat Feed */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <span className="text-4xl">{selectedRoom?.icon}</span>
                  <h3 className="text-lg font-bold text-foreground">Welcome to {selectedRoom?.name}</h3>
                  <p className="text-sm text-muted-foreground">Be the first to start the discussion.</p>
                </div>
              )}
              {messages.map((msg, idx) => {
                const isMe = msg.sender?._id === user?._id;
                return (
                  <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <img 
                      src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${msg.sender?.username}&background=27272a&color=fff`} 
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-border mt-1" 
                      alt="" 
                    />
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-foreground">{msg.sender?.username}</span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
                        isMe ? 'bg-accent text-white rounded-tr-sm' : 'bg-surface-hover text-foreground rounded-tl-sm border border-border'
                      }`}>
                        {renderMessageContent(msg)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-surface shrink-0">
              <div className="relative flex items-end bg-surface-hover border border-border rounded-xl focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }
                  }}
                  placeholder={`Message ${selectedRoom?.name}... (Tip: use \`\`\` for code blocks)`}
                  className="w-full pl-4 pr-12 py-3 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none resize-none min-h-[48px] max-h-[150px]"
                  rows={1}
                />
                <div className="absolute right-2 bottom-2 flex gap-1">
                  <button type="submit" disabled={!newMessage.trim()} className="p-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50">
                    <PaperAirplaneIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </div>

      {/* ── Right Sidebar (Room Details & AI) ── */}
      {selectedRoom && (
        <div className="w-72 hidden xl:flex flex-col gap-4 overflow-hidden">
          
          {/* Pomodoro Widget for specific rooms */}
          {(selectedRoom.id === 'room-pomodoro' || selectedRoom.id === 'room-study' || selectedRoom.id === 'room-coding') && (
            <PomodoroWidget roomId={selectedRoom.id} />
          )}

          {/* AI Assistant */}
          <div className="bg-surface border border-border rounded-xl flex flex-col overflow-hidden flex-1 min-h-0">
            <div className="p-4 border-b border-border bg-surface-hover/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accent }} />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Sentient AI</h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto scrollbar-hide">
              <p className="text-xs text-muted-foreground mb-4">
                Hi, I'm analyzing the mood and context of the <strong className="text-foreground">{selectedRoom.name}</strong>. Here are some prompts to spark collaboration:
              </p>
              <div className="space-y-2">
                {currentIcebreakers.map((ib, i) => (
                  <button 
                    key={i} 
                    onClick={() => setNewMessage(ib)}
                    className="w-full text-left p-3 rounded-lg bg-surface-hover border border-border hover:border-accent/50 text-xs text-muted-foreground hover:text-foreground transition-all flex items-start gap-2"
                  >
                    <LightBulbIcon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: theme.accent }} />
                    <span className="leading-snug">"{ib}"</span>
                  </button>
                ))}
              </div>

              {selectedRoom.id === 'room-coding' && (
                <div className="mt-6">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Room Tools</h4>
                  <button onClick={() => setNewMessage('```javascript\n// Paste your code here\n```')} className="w-full p-2.5 rounded-lg bg-surface border border-border hover:border-blue-500 text-xs font-semibold text-foreground flex items-center justify-center gap-2 transition-colors">
                    <CodeBracketIcon className="w-4 h-4" /> Share Code Snippet
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Room Analytics Widget */}
          <RoomAnalyticsWidget messages={messages} membersCount={roomMembersCount[selectedRoom.id] || 0} />
          
        </div>
      )}
    </div>
  );
};

export default CollaborationHub;