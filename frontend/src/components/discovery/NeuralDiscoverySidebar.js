import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { searchAPI } from '../../services/searchAPI';
import { usersAPI } from '../../services/usersAPI';
import { useMood } from '../../context/MoodContext';
import { useWellness } from '../../context/WellnessContext';
import { 
  SparklesIcon, 
  ArrowTrendingUpIcon, 
  UserPlusIcon,
  VideoCameraIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

const DiscoverySidebar = () => {
  const navigate = useNavigate();
  const { activeMood } = useMood();
  const { burnoutIndex } = useWellness();
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
        usersAPI.searchUsers('') 
      ]);
      setTrending(trendingRes.data.trending || []);
      setSuggested(suggestedRes.data.users?.slice(0, 4) || []);
    } catch (error) {
      console.error("Discovery Sync Failure:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeRooms = [
    { id: 1, name: 'Design Critiques', viewers: 124 },
    { id: 2, name: 'React Developers', viewers: 89 }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card-base p-5 space-y-4">
          <div className="h-4 w-32 skeleton" />
          {[1,2,3].map(i => <div key={i} className="h-3 w-full skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mood Insights & Stats */}
      <div className="card-base p-5 bg-gradient-to-br from-surface to-surface-hover">
        <div className="flex items-center gap-2 mb-3">
          <BoltIcon className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Mood Insights</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          Your current fatigue index is <span className={`font-semibold ${burnoutIndex > 70 ? 'text-rose-500' : 'text-emerald-500'}`}>{burnoutIndex}%</span>. 
          {burnoutIndex > 70 ? " Consider taking a break soon." : " Great energy levels for deep work."}
        </p>
      </div>

      {/* Trending Section */}
      {trending.length > 0 && (
        <div className="card-base p-5">
          <div className="flex items-center gap-2 mb-4">
            <ArrowTrendingUpIcon className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">
              Trending in {activeMood}
            </h3>
          </div>

          <div className="space-y-3">
            {trending.map((item) => (
              <motion.div 
                key={item.tag}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between group cursor-pointer"
                onClick={() => navigate(`/search?q=${item.tag.replace('#', '')}`)}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                    {item.tag}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.count} posts
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Active Rooms */}
      <div className="card-base p-5">
        <div className="flex items-center gap-2 mb-4">
          <VideoCameraIcon className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">Live Rooms</h3>
        </div>
        <div className="space-y-3">
          {activeRooms.map(room => (
            <div key={room.id} className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{room.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{room.viewers}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Creators */}
      {suggested.length > 0 && (
        <div className="card-base p-5">
          <div className="flex items-center gap-2 mb-4">
            <SparklesIcon className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-semibold text-foreground">
              Suggested Creators
            </h3>
          </div>

          <div className="space-y-4">
            {suggested.map((creator) => (
              <div key={creator._id} className="flex items-center gap-3">
                <img 
                  src={creator.avatar || `https://ui-avatars.com/api/?name=${creator.username}&background=27272a&color=f4f4f5`} 
                  className="w-10 h-10 rounded-lg object-cover border border-border"
                  alt=""
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground truncate cursor-pointer hover:underline" onClick={() => navigate(`/profile/${creator._id}`)}>
                    {creator.fullName || creator.username}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">@{creator.username}</p>
                </div>
                <button className="p-1.5 rounded-md bg-surface-hover border border-border hover:border-accent hover:text-accent transition-colors shrink-0">
                  <UserPlusIcon className="w-4 h-4 text-muted-foreground hover:text-accent" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverySidebar;
