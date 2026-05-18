import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, XMarkIcon, ChatBubbleLeftRightIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import { useMood } from '../../context/MoodContext';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activeMood } = useMood();
  const [isChatting, setIsChatting] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I am your Sentient Neural Assistant. How can I optimize your experience today?", isAI: true }
  ]);
  const [input, setInput] = useState('');

  const alerts = [
    { title: 'Burnout Alert', message: 'You have been scrolling for 45 minutes. Time for a neural reset?', icon: BellAlertIcon, type: 'warning' },
    { title: 'Productivity Tip', message: 'Your "Learning" mood is high. Perfect time for the MERN tutorial.', icon: SparklesIcon, type: 'info' }
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { text: input, isAI: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Mock AI Response
    setTimeout(() => {
      let aiResponse = "I'm analyzing your neural patterns. Your current resonance is optimal.";
      if (input.toLowerCase().includes('help')) aiResponse = "Neural link established. I can help you filter content or set wellness reminders.";
      if (input.toLowerCase().includes('mood')) aiResponse = `Your current mood is synchronized to ${activeMood}.`;
      
      setMessages(prev => [...prev, { text: aiResponse, isAI: true }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-24 right-0 w-80 glass-panel p-6 rounded-[2.5rem] border-white/10 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 animate-pulse" />
                <span className="font-black text-sm uppercase tracking-widest text-white italic">Sentient AI</span>
              </div>
              <button onClick={() => { setIsOpen(false); setIsChatting(false); }} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {!isChatting ? (
              <>
                <div className="space-y-4 mb-6">
                  {alerts.map((alert, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                    >
                      <div className="flex gap-3">
                        <alert.icon className={`w-5 h-5 ${alert.type === 'warning' ? 'text-orange-400' : 'text-cyan-400'}`} />
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{alert.title}</h4>
                          <p className="text-xs text-white/80 leading-relaxed font-medium">{alert.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button 
                  onClick={() => setIsChatting(true)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-[1.02] transition-transform"
                >
                  Enter Neural Chat
                </button>
              </>
            ) : (
              <div className="flex flex-col h-80">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.isAI ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium ${
                        msg.isAI ? 'bg-white/5 text-white/80' : 'bg-purple-600 text-white'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 relative">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask the collective..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <button 
                    onClick={handleSend}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-400 hover:text-white transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full glass-panel border-white/20 flex items-center justify-center relative overflow-hidden group shadow-[0_0_30px_var(--mood-glow)]"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center animate-orb">
          <SparklesIcon className="w-4 h-4 text-white" />
        </div>
      </motion.button>
    </div>
  );
};

export default AIAssistant;
