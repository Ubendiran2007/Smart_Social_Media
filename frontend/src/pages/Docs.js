import React from 'react';
import { motion } from 'framer-motion';
import { 
  AcademicCapIcon, 
  CpuChipIcon, 
  GlobeAltIcon, 
  ShieldCheckIcon,
  SparklesIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { GlassCard, AIBadge } from '../components/ui/SiliconValley';
import { useNavigate } from 'react-router-dom';

const Docs = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Project Overview",
      icon: GlobeAltIcon,
      content: "Sentient is a next-generation AI-powered social ecosystem designed for the high-fidelity synchronization of human creativity and synthetic intelligence. It leverages neural architecture to provide a seamless, mood-based content experience."
    },
    {
      title: "AI Architecture",
      icon: CpuChipIcon,
      content: "Built on top of a sophisticated neural engine, Sentient uses real-time toxicity filtering, mood-based feed ranking, and automated content analysis to ensure a high-quality, productive environment for all synthetic identities."
    },
    {
      title: "Feature Explanation",
      icon: SparklesIcon,
      content: "From 'Neural Stories' that provide a live stream of consciousness to 'Cinematic Reels' that adapt to your cognitive load, every feature in Sentient is engineered for maximum synchronization."
    },
    {
      title: "Security Protocols",
      icon: ShieldCheckIcon,
      content: "Your data is protected by industry-standard encryption and real-time neural guards. We prioritize privacy while enabling seamless connectivity across the decentralized network."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="flex justify-center mb-4">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all group"
          >
            <HomeIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Back to Neural Feed
          </button>
        </div>
        <AIBadge className="mx-auto">DOCUMENTATION</AIBadge>
        <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic">The Sentient Protocol</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 max-w-2xl mx-auto leading-loose">
          A comprehensive guide to the architecture, features, and philosophy of the world's first AI-driven social synchronization layer.
        </p>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <GlassCard className="p-10 space-y-6 h-full hover:border-purple-500/30 transition-all duration-500">
              <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                <section.icon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">{section.title}</h2>
              <p className="text-sm text-white/60 leading-relaxed font-medium">
                {section.content}
              </p>
              <div className="pt-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Protocol Node {idx + 1}</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Footer / Call to action */}
      <GlassCard className="p-12 text-center border-dashed border-white/5">
        <div className="max-w-2xl mx-auto space-y-8">
          <AcademicCapIcon className="w-16 h-16 text-purple-500/20 mx-auto" />
          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Ready to Build?</h3>
          <p className="text-xs text-white/40 font-bold uppercase tracking-widest leading-loose">
            Join thousands of developers and creators building the next layer of human-AI collaboration. Access the developer API and start synthesizing.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-4 rounded-[2rem] bg-purple-600 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(147,51,234,0.4)]">Request API Key</button>
            <button className="px-8 py-4 rounded-[2rem] bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Join Discord</button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Docs;
