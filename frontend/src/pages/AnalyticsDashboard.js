import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowTrendingUpIcon, 
  HeartIcon, 
  SparklesIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { useWellness } from '../context/WellnessContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, trend, color, description }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card p-6 border-white/5 bg-gradient-to-br from-white/5 to-transparent"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl bg-${color}-500/10`}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      {trend !== undefined && (
        <span className={`text-[10px] font-bold ${trend >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'} px-2 py-1 rounded-lg`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest">{title}</h3>
    <p className="text-3xl font-black text-white mt-1">{value}</p>
  </motion.div>
);

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { burnoutIndex, dailySessions, reelCount, lastSync } = useWellness();

  const safeLastSync = lastSync ? new Date(lastSync) : new Date();

  const stats = [
    { 
      title: 'Burnout Level', 
      value: `${burnoutIndex}%`, 
      icon: BoltIcon, 
      trend: burnoutIndex > 50 ? 15 : -5, 
      color: burnoutIndex > 70 ? 'rose' : 'purple',
      description: burnoutIndex > 70 ? 'Take a break now' : 'You are doing great'
    },
    { 
      title: 'Time Spent', 
      value: `${dailySessions} mins`, 
      icon: SparklesIcon, 
      color: 'cyan',
      description: 'Total focus time today'
    },
    { 
      title: 'Videos Watched', 
      value: reelCount, 
      icon: HeartIcon, 
      trend: 5, 
      color: 'pink',
      description: 'Across all neural feeds'
    },
    { 
      title: 'Wellness Status', 
      value: burnoutIndex > 80 ? 'Rest Needed' : 'Healthy', 
      icon: ArrowTrendingUpIcon, 
      color: burnoutIndex > 80 ? 'rose' : 'orange',
      description: 'Current mental resonance'
    },
  ];

  const aiSuggestion = useMemo(() => {
    if (burnoutIndex > 80) return "You've been on the screen too long. We recommend closing the app for at least 30 minutes to reset your focus.";
    if (burnoutIndex > 50) return "You're starting to get tired. Try switching to a 'Calm' mood and taking a quick stretch.";
    return "Your energy levels are perfect! This is a great time for creative work or learning something new.";
  }, [burnoutIndex]);

  const handleDownload = () => {
    const reportData = {
      user: user?.username || 'Neural User',
      timestamp: new Date().toISOString(),
      metrics: {
        burnoutIndex,
        dailySessions,
        reelCount,
        status: burnoutIndex > 80 ? 'Critical' : 'Healthy'
      },
      insights: aiSuggestion
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `sentient_wellness_report_${new Date().toLocaleDateString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success('Neural Report Exported');
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic">Wellness Hub</h1>
          <p className="text-white/40 text-[10px] mt-1 uppercase tracking-[0.3em] font-black">Your Digital Balance & Progress</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
            Last Updated: {safeLastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={handleDownload}
              className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
            >
              Download Report
            </button>
            <button className="px-6 py-3 rounded-2xl bg-purple-600 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]">AI Wellness Guide</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <motion.div 
            key={stat.title}
            whileHover={{ y: -5 }}
            className="glass-card p-6 border-white/5 bg-gradient-to-br from-white/5 to-transparent"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-500/10`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
              {stat.trend !== undefined && (
                <span className={`text-[10px] font-bold ${stat.trend >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'} px-2 py-1 rounded-lg`}>
                  {stat.trend >= 0 ? '+' : ''}{stat.trend}%
                </span>
              )}
            </div>
            <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest">{stat.title}</h3>
            <p className="text-3xl font-black text-white mt-1">{stat.value}</p>
            <p className="text-[9px] font-bold text-white/20 uppercase mt-2 tracking-widest">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 glass-card p-8 border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Engagement Pulse</h3>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                <div className="w-2 h-2 rounded-full bg-purple-500" /> Focus Time
              </span>
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                <div className="w-2 h-2 rounded-full bg-cyan-400" /> Community
              </span>
            </div>
          </div>
          
          <div className="h-64 w-full relative">
            <svg viewBox="0 0 1000 300" className="w-full h-full">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#9333ea" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                d={`M0 250 Q 150 ${250 - dailySessions * 20}, 300 180 T 600 ${250 - reelCount * 10} T 1000 150`}
                fill="none"
                stroke="#9333ea"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                d={`M0 250 Q 150 ${250 - dailySessions * 20}, 300 180 T 600 ${250 - reelCount * 10} T 1000 150 L 1000 300 L 0 300 Z`}
                fill="url(#chartGradient)"
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full h-px bg-white" />
              ))}
            </div>
          </div>
          <p className="text-[9px] font-bold text-white/10 uppercase text-center mt-4 tracking-[0.5em]">Activity timeline over last 24 hours</p>
        </div>

        {/* Side Panel */}
        <div className="flex flex-col gap-8">
          <div className="glass-card p-8 border-white/5">
            <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-6">Health Score</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Digital Fatigue</span>
                  <span className={`text-[10px] font-black ${burnoutIndex > 70 ? 'text-rose-500' : 'text-cyan-400'}`}>{burnoutIndex}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${burnoutIndex}%` }}
                    className={`h-full ${burnoutIndex > 70 ? 'bg-rose-500' : 'bg-cyan-400'}`}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Daily Balance Goal</span>
                  <span className="text-[10px] font-black text-purple-500">{Math.min(100, dailySessions * 10)}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, dailySessions * 10)}%` }}
                    className="h-full bg-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className={`mt-12 p-6 rounded-[2rem] bg-gradient-to-br border ${burnoutIndex > 70 ? 'from-rose-500/10 border-rose-500/20' : 'from-purple-500/10 border-purple-500/20'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${burnoutIndex > 70 ? 'bg-rose-500/20' : 'bg-purple-500/20'}`}>
                  <SparklesIcon className={`w-5 h-5 ${burnoutIndex > 70 ? 'text-rose-400' : 'text-purple-400'}`} />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">AI Wellness Guide</span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed font-bold italic">
                "{aiSuggestion}"
              </p>
            </div>
          </div>

          {/* New: Community Impact Card */}
          <div className="glass-card p-6 border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-transparent">
            <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-4">Community Impact</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Kindness Quotient</span>
              <span className="text-sm font-black text-white italic">High Harmony</span>
            </div>
            <p className="text-[10px] text-white/60 font-medium leading-relaxed">
              Your interactions today have been 94% positive. You are contributing to a healthier neural collective.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
