import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostCard from '../components/posts/PostCard';
import StoryRing from '../components/stories/StoryRing';
import StoryViewer from '../components/stories/StoryViewer';
import MoodSelector from '../components/mood/MoodSelector';
import NeuralDiscoverySidebar from '../components/discovery/NeuralDiscoverySidebar';
import { postsAPI } from '../services/postsAPI';
import { storiesAPI } from '../services/storiesAPI';
import { useAuth } from '../context/AuthContext';
import { GlassCard, AIBadge } from '../components/ui/SiliconValley';
import { useMood } from '../context/MoodContext';
import { SparklesIcon, FireIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const { user } = useAuth();
  const { activeMood } = useMood();
  const isProductivityMode = user?.moodAnalytics?.burnoutIndex > 50; 
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedUserStories, setSelectedUserStories] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, [activeMood, isProductivityMode]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log("Home: Initiating sync for mood:", activeMood, "Productivity:", isProductivityMode);
      
      const [postsResponse, storiesResponse] = await Promise.all([
        postsAPI.getFeedPosts(1, 10, activeMood, isProductivityMode),
        storiesAPI.getStories(activeMood)
      ]);
      
      console.log("Home: Posts Data Received:", postsResponse.data?.posts?.length || 0, "items");
      console.log("Home: Stories Data Received:", storiesResponse.data?.stories?.length || 0, "items");

      setPosts(Array.isArray(postsResponse.data?.posts) ? postsResponse.data.posts : []);
      setStories(Array.isArray(storiesResponse.data?.stories) ? storiesResponse.data.stories : []);
      setHasMore(postsResponse.data?.hasMore || false);
      setPage(1);
    } catch (error) {
      console.error('Home: Sync failure:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMore || loading) return;
    try {
      const nextPage = page + 1;
      console.log("Home: Fetching more posts, page:", nextPage, "Mood:", activeMood);
      const response = await postsAPI.getFeedPosts(nextPage, 10, activeMood, isProductivityMode);
      
      const newPosts = Array.isArray(response.data?.posts) ? response.data.posts : [];
      console.log("Home: Appending", newPosts.length, "new posts");
      
      setPosts(prev => [...prev, ...newPosts]);
      setHasMore(response.data?.hasMore || false);
      setPage(nextPage);
    } catch (error) {
      console.error('Home: Load more failure:', error);
    }
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Stories Horizontal Strip */}
          <section className="relative">
            <div className="flex items-center justify-between mb-6 px-2">
              <div className="flex items-center gap-3">
                <FireIcon className="w-5 h-5 text-purple-400" />
                <h2 className="text-xs font-black text-white uppercase tracking-widest italic">Live Neural Stream</h2>
              </div>
              <AIBadge>ACTIVE</AIBadge>
            </div>
            
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
              <AnimatePresence>
                {stories.map((userStory, idx) => (
                  <motion.div
                    key={userStory.user._id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="snap-start"
                  >
                    <StoryRing 
                      user={userStory.user} 
                      stories={userStory.stories} 
                      onClick={() => setSelectedUserStories(userStory)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {stories.length === 0 && !loading && (
                <div className="flex items-center justify-center w-full py-8 bg-white/5 rounded-3xl border border-dashed border-white/10 opacity-40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white">No active streams</p>
                </div>
              )}
            </div>
          </section>

          {/* Feed Content */}
          <InfiniteScroll
            dataLength={posts.length}
            next={loadMorePosts}
            hasMore={hasMore}
            loader={<FeedLoader />}
            endMessage={<FeedEnd />}
            scrollThreshold={0.8}
          >
            <div className="space-y-12">
              {posts.map((post) => (
                <PostCard 
                  key={post._id} 
                  post={post} 
                  onUpdate={handleUpdatePost}
                  onDelete={handleDeletePost}
                />
              ))}
              
              {posts.length === 0 && !loading && (
                <EmptyFeed />
              )}
            </div>
          </InfiniteScroll>
        </div>

        <div className="lg:col-span-4 space-y-10 sticky top-8 h-fit hidden lg:block">
          <NeuralDiscoverySidebar />
        </div>
      </div>

      {/* Story Viewer Overlay */}
      {selectedUserStories && (
        <StoryViewer 
          user={selectedUserStories.user}
          stories={selectedUserStories.stories}
          onClose={() => setSelectedUserStories(null)}
        />
      )}
    </div>
  );
};

const FeedLoader = () => (
  <div className="space-y-12 py-10">
    {[1, 2].map(i => (
      <div key={i} className="animate-pulse space-y-4">
        <div className="h-[400px] bg-white/5 rounded-[3rem]" />
        <div className="h-4 bg-white/5 rounded w-3/4 mx-auto" />
      </div>
    ))}
  </div>
);

const FeedEnd = () => (
  <div className="py-20 text-center opacity-20">
    <div className="h-px bg-white/10 w-24 mx-auto mb-8" />
    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Edge of collective reached</p>
  </div>
);

const EmptyFeed = () => (
  <div className="py-40 text-center space-y-6">
    <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[3rem] flex items-center justify-center mx-auto opacity-20">
      <SparklesIcon className="w-12 h-12 text-white" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Neural Stream Unavailable</h3>
      <p className="text-[10px] font-black text-white/20 uppercase tracking-widest max-w-xs mx-auto leading-relaxed">
        We couldn't find any cognitive fragments matching your current mood synchronization.
      </p>
    </div>
  </div>
);

export default Home;