import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostCard from '../components/posts/PostCard';
import StoryRing from '../components/stories/StoryRing';
import StoryViewer from '../components/stories/StoryViewer';
import NeuralDiscoverySidebar from '../components/discovery/NeuralDiscoverySidebar';
import { postsAPI } from '../services/postsAPI';
import { storiesAPI } from '../services/storiesAPI';
import { useAuth } from '../context/AuthContext';
import { AIBadge } from '../components/ui/SiliconValley';
import { useMood } from '../context/MoodContext';
import { BoltIcon, SparklesIcon } from '@heroicons/react/24/outline';

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
      
      const [postsResponse, storiesResponse] = await Promise.all([
        postsAPI.getFeedPosts(1, 10, activeMood, isProductivityMode),
        storiesAPI.getStories(activeMood)
      ]);
      
      setPosts(Array.isArray(postsResponse.data?.posts) ? postsResponse.data.posts : []);
      setStories(Array.isArray(storiesResponse.data?.stories) ? storiesResponse.data.stories : []);
      setHasMore(postsResponse.data?.hasMore || false);
      setPage(1);
    } catch (error) {
      console.error('Home load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (!hasMore || loading) return;
    try {
      const nextPage = page + 1;
      const response = await postsAPI.getFeedPosts(nextPage, 10, activeMood, isProductivityMode);
      
      const newPosts = Array.isArray(response.data?.posts) ? response.data.posts : [];
      setPosts(prev => [...prev, ...newPosts]);
      setHasMore(response.data?.hasMore || false);
      setPage(nextPage);
    } catch (error) {
      console.error('Home load more error:', error);
    }
  };

  const handleUpdatePost = (updatedPost) => {
    setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getMoodInsight = () => {
    const insights = {
      Productive: "78% of today's content matches your goals.",
      Calm: "The feed is filtered for peaceful content.",
      Funny: "We've surfaced the best memes for you.",
      Learning: "Top tutorials and guides ready for you.",
      Motivational: "Success stories to fuel your day."
    };
    return insights[activeMood] || "Your feed is tailored to your current mood.";
  };

  return (
    <div className="max-w-5xl mx-auto py-6">
      {/* Top Greeting Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {getGreeting()}, {user?.username || 'Creator'}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <p className="text-sm text-muted-foreground">
            You are currently in <span className="font-semibold text-foreground">{activeMood}</span> Mode. {getMoodInsight()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Stories Horizontal Strip */}
          <section className="bg-surface border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BoltIcon className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-semibold text-foreground">Active Stories</h2>
              </div>
              <AIBadge>Live</AIBadge>
            </div>
            
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x">
              <AnimatePresence>
                {stories.map((userStory, idx) => (
                  <motion.div
                    key={userStory.user._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="snap-start shrink-0"
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
                <div className="flex items-center justify-center w-full py-4 text-muted-foreground">
                  <p className="text-xs font-medium">No active stories in your network.</p>
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
            className="space-y-6 overflow-hidden"
          >
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
          </InfiniteScroll>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 hidden lg:block">
          <div className="sticky top-20">
            <NeuralDiscoverySidebar />
          </div>
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
  <div className="space-y-6 py-4">
    {[1, 2].map(i => (
      <div key={i} className="card-base p-0 overflow-hidden flex flex-col">
        <div className="p-4 flex items-center gap-3 border-b border-border">
          <div className="w-10 h-10 rounded-lg skeleton shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-3 w-24 skeleton" />
            <div className="h-2 w-16 skeleton" />
          </div>
        </div>
        <div className="aspect-video w-full skeleton rounded-none" />
        <div className="p-6 space-y-3">
          <div className="h-3 w-3/4 skeleton" />
          <div className="h-3 w-1/2 skeleton" />
        </div>
      </div>
    ))}
  </div>
);

const FeedEnd = () => (
  <div className="py-12 text-center">
    <div className="h-px bg-border w-12 mx-auto mb-4" />
    <p className="text-xs font-medium text-muted-foreground">You've reached the end of your feed.</p>
  </div>
);

const EmptyFeed = () => (
  <div className="py-20 text-center flex flex-col items-center">
    <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mb-4 text-muted-foreground">
      <SparklesIcon className="w-8 h-8" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-1">No posts found</h3>
    <p className="text-sm text-muted-foreground max-w-sm">
      We couldn't find any posts matching your current network and theme settings. Try following more users.
    </p>
  </div>
);

export default Home;