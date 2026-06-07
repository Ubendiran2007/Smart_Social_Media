import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowTrendingUpIcon, 
  HeartIcon, 
  SparklesIcon,
  BoltIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useWellness } from '../context/WellnessContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, trend, color, description }) => {
  const isPositive = trend >= 0;
  
  return (
    <div className="bg-surface border border-border rounded-xl p-5 hover:border-border-strong transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg bg-${color}-500/10`}>
          <Icon className={`w-5 h-5 text-${color}-500`} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-md ${isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10'}`}>
            {isPositive ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
};

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const { burnoutIndex, dailySessions, reelCount, lastSync } = useWellness();

  const safeLastSync = lastSync ? new Date(lastSync) : new Date();

  const stats = [
    { 
      title: 'Digital Fatigue', 
      value: `${burnoutIndex}%`, 
      icon: BoltIcon, 
      trend: burnoutIndex > 50 ? 15 : -5, 
      color: burnoutIndex > 70 ? 'rose' : 'purple',
      description: burnoutIndex > 70 ? 'Take a break soon' : 'Healthy usage'
    },
    { 
      title: 'Time Spent', 
      value: `${dailySessions} mins`, 
      icon: SparklesIcon, 
      color: 'cyan',
      description: 'Active screen time today'
    },
    { 
      title: 'Content Viewed', 
      value: reelCount, 
      icon: HeartIcon, 
      trend: 5, 
      color: 'pink',
      description: 'Posts and reels seen'
    },
    { 
      title: 'Status', 
      value: burnoutIndex > 80 ? 'Rest Needed' : 'Balanced', 
      icon: ArrowTrendingUpIcon, 
      color: burnoutIndex > 80 ? 'rose' : 'emerald',
      description: 'Current wellness assessment'
    },
  ];

  const aiSuggestion = useMemo(() => {
    if (burnoutIndex > 80) return "You've been active for a while. We recommend stepping away from the screen for at least 30 minutes to recharge.";
    if (burnoutIndex > 50) return "You're starting to build up screen time. Try taking a quick 5-minute stretch break.";
    return "Your screen time is well balanced! Keep up the good habits.";
  }, [burnoutIndex]);

  const handleDownload = () => {
    const reportData = {
      user: user?.username || 'User',
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
    downloadAnchorNode.setAttribute("download", `wellness_report_${new Date().toLocaleDateString()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success('Report downloaded');
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-1">Wellness Portal</h1>
          <p className="text-sm text-muted-foreground">Monitor your digital balance and screen habits</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs text-muted-foreground">
            Updated today at {safeLastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border text-sm font-medium text-foreground transition-colors shadow-sm"
          >
            <ArrowDownTrayIcon className="w-4 h-4" /> Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-foreground">Activity Timeline</h3>
            <div className="flex gap-4">
              <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-accent" /> Focus
              </span>
              <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-cyan-500" /> Browsing
              </span>
            </div>
          </div>
          
          <div className="h-[240px] w-full relative">
            <svg viewBox="0 0 1000 300" className="w-full h-full preserve-aspect-ratio-none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--mood-primary)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--mood-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                d={`M0 250 Q 150 ${250 - dailySessions * 20}, 300 180 T 600 ${250 - reelCount * 10} T 1000 150`}
                fill="none"
                stroke="var(--mood-primary)"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                d={`M0 250 Q 150 ${250 - dailySessions * 20}, 300 180 T 600 ${250 - reelCount * 10} T 1000 150 L 1000 300 L 0 300 Z`}
                fill="url(#chartGradient)"
              />
            </svg>
            
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full border-t border-border opacity-50" />
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-base font-semibold text-foreground mb-5">Summary</h3>
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Digital Fatigue</span>
                  <span className={`text-xs font-semibold ${burnoutIndex > 70 ? 'text-rose-500' : 'text-foreground'}`}>{burnoutIndex}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${burnoutIndex}%` }}
                    className={`h-full ${burnoutIndex > 70 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Daily Goal</span>
                  <span className="text-xs font-semibold text-foreground">{Math.min(100, dailySessions * 10)}%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-hover rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, dailySessions * 10)}%` }}
                    className="h-full bg-accent"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-surface-hover/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="w-4 h-4 text-accent" />
                <span className="text-xs font-semibold text-foreground">AI Insight</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {aiSuggestion}
              </p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Community Impact</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Interaction Quality</span>
              <span className="text-xs font-semibold text-emerald-500">Positive</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your interactions today have been predominantly positive, contributing to a healthier platform environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
