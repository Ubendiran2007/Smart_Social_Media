import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../../services/searchAPI';
import { usersAPI } from '../../services/usersAPI';
import { useMood } from '../../context/MoodContext';
import { GlassCard, AIBadge, NeonButton } from '../ui/SiliconValley';
import { 
  SparklesIcon, 
  ArrowTrendingUpIcon, 
  UserPlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const NeuralDiscoverySidebar = () => {
  const navigate = useNavigate();
  const { activeMood } = useMood();
  const [trending, setTrending] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscoveryData();
  }, [activeMood]);

  const fetchDiscoveryData = async () => {
    try {
      setLoading(true);
      const [trendingRes, suggestedRes] = await Promise.all([
        searchAPI.getTrendingHashtags(activeMood),
        usersAPI.searchUsers('') // Basic discovery for now
      ]);
      setTrending(trendingRes.data.trending || []);
      setSuggested(suggestedRes.data.users?.slice(0, 5) || []);
    } catch (error) {
      console.error("Discovery Sync Failure:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Trending Section */}
      {trending.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <ArrowTrendingUpIcon className="w-5 h-5 text-cyan-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-widest italic">
                Trending in {activeMood.toUpperCase()}
              </h3>
            </div>
          </div>

          <GlassCard className="p-6">
            <div className="space-y-4">
              {trending.map((item, idx) => (
                <motion.div 
                  key={item.tag}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between group cursor-pointer"
                  onClick={() => navigate(`/search?q=${item.tag.replace('#', '')}`)}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-white group-hover:text-cyan-400 transition-colors italic tracking-tight">
                      {item.tag}
                    </span>
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                      {item.count} neural syncs
                    </span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MagnifyingGlassIcon className="w-4 h-4 text-cyan-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Suggested Creators */}
      {suggested.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <SparklesIcon className="w-5 h-5 text-purple-400" />
              <h3 className="text-xs font-black text-white uppercase tracking-widest italic">
                Recommended for Frequency
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {suggested.map((creator) => (
              <GlassCard key={creator._id} className="p-4 group hover:border-purple-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <img 
                    src={creator.avatar || `https://ui-avatars.com/api/?name=${creator.username}`} 
                    className="w-12 h-12 rounded-2xl object-cover border border-white/10 group-hover:border-purple-500/50 transition-all"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-white truncate italic tracking-tighter uppercase">{creator.fullName}</h4>
                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest truncate">@{creator.username}</p>
                  </div>
                  <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all">
                    <UserPlusIcon className="w-5 h-5 text-white/40 hover:text-purple-400" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NeuralDiscoverySidebar;
