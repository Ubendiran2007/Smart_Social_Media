import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircleIcon, SparklesIcon, SignalIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { GlassCard, AIBadge, NeonButton } from '../components/ui/SiliconValley';
import PostCard from '../components/posts/PostCard';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (userId && currentUser) {
      loadUserProfile();
      loadUserPosts();
    }
  }, [userId, currentUser]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${userId}`);
      setUser(response.data.user);
      setIsFollowing(response.data.user.followers.some(f => f._id === currentUser._id));
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadUserPosts = async () => {
    try {
      const response = await api.get(`/posts/user/${userId}`);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await api.put(`/users/${userId}/follow`);
      setIsFollowing(response.data.isFollowing);
      setUser(prev => ({
        ...prev,
        followers: response.data.isFollowing 
          ? [...prev.followers, currentUser]
          : prev.followers.filter(f => f._id !== currentUser._id)
      }));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <GlassCard className="p-20">
          <UserCircleIcon className="w-20 h-20 text-white/10 mx-auto mb-6" />
          <p className="text-sm font-black uppercase tracking-widest text-white/40">Entity not found in neural database</p>
        </GlassCard>
      </div>
    );
  }

  const isOwnProfile = currentUser._id === userId;

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12">
      {/* Profile Identity Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <GlassCard className="p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8">
            <AIBadge>ID: {user.username.toUpperCase()}</AIBadge>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="relative">
              <div className="absolute inset-0 rounded-[4rem] bg-gradient-to-tr from-purple-500 to-cyan-400 animate-pulse opacity-20 blur-2xl group-hover:opacity-40 transition-opacity" />
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=9333ea&color=fff`}
                alt=""
                className="w-48 h-48 rounded-[3.5rem] object-cover border-4 border-white/10 relative z-10 shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 p-3 rounded-2xl bg-emerald-500 border-4 border-black z-20 shadow-lg">
                <SignalIcon className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-6">
              <div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic mb-2">
                  {user.fullName}
                </h1>
                <p className="text-xs font-black text-purple-400 uppercase tracking-[0.4em]">@{user.username} • USER PROFILE</p>
              </div>

              <div className="flex flex-wrap justify-center md:justify-start gap-8 border-y border-white/5 py-8">
                <div className="text-center group/stat">
                  <p className="text-3xl font-black text-white tracking-tighter group-hover:text-purple-400 transition-colors">{posts.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Posts</p>
                </div>
                <div className="text-center group/stat">
                  <p className="text-3xl font-black text-white tracking-tighter group-hover:text-cyan-400 transition-colors">{user.followers.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Followers</p>
                </div>
                <div className="text-center group/stat">
                  <p className="text-3xl font-black text-white tracking-tighter group-hover:text-pink-400 transition-colors">{user.following.length}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Following</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6">
                {!isOwnProfile ? (
                  <button
                    onClick={handleFollow}
                    className={`w-full md:w-auto px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${
                      isFollowing
                        ? 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
                        : 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_50px_rgba(139,92,246,0.5)]'
                    }`}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                ) : (
                  <button 
                    onClick={() => navigate('/edit-profile')}
                    className="w-full md:w-auto px-12 py-4 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 border border-white/10 hover:text-white transition-all"
                  >
                    Edit Profile
                  </button>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/60 italic">"{user.bio || 'No bio provided.'}"</p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Neural Post Stream */}
      <div className="space-y-12">
        <div className="flex items-center gap-4 px-4">
          <SparklesIcon className="w-6 h-6 text-purple-500" />
          <h2 className="text-xs font-black uppercase tracking-[0.5em] text-white/40">Recent Posts</h2>
        </div>
        
        <div className="space-y-12">
          {posts.length > 0 ? (
            posts.map((post, idx) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <PostCard
                  post={post}
                  onUpdate={(updated) => setPosts(p => p.map(x => x._id === updated._id ? updated : x))}
                  onDelete={(id) => setPosts(p => p.filter(x => x._id !== id))}
                />
              </motion.div>
            ))
          ) : (
            <GlassCard className="p-32 text-center border-dashed border-white/5">
              <SignalIcon className="w-16 h-16 text-white/5 mx-auto mb-6" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">No posts yet</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;