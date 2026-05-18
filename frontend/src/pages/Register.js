import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { GlassCard, NeonButton, AIBadge } from '../components/ui/SiliconValley';
import { SparklesIcon, KeyIcon, EnvelopeIcon, UserIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success('Synthetic Identity Synthesized');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-600/20 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="text-center mb-10 space-y-4">
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 rounded-[2.5rem] bg-gradient-to-tr from-cyan-400 to-purple-500 mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.3)]"
          >
            <SparklesIcon className="w-10 h-10 text-white" />
          </motion.div>
          <AIBadge className="mx-auto">SENTIENT NETWORK</AIBadge>
          <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Join Now
          </h1>
        </div>

        <GlassCard className="p-10 border-white/10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative group">
                <IdentificationIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                <input 
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  className="w-full bg-black/40 border-2 border-white/5 rounded-2xl py-5 pl-16 pr-6 text-white font-bold placeholder:text-white/10 focus:border-purple-500/50 transition-all outline-none"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative group">
                <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="w-full bg-black/40 border-2 border-white/5 rounded-2xl py-5 pl-16 pr-6 text-white font-bold placeholder:text-white/10 focus:border-cyan-500/50 transition-all outline-none"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="relative group">
              <EnvelopeIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-purple-400 transition-colors" />
              <input 
                type="email"
                name="email"
                placeholder="Email Address"
                className="w-full bg-black/40 border-2 border-white/5 rounded-2xl py-5 pl-16 pr-6 text-white font-bold placeholder:text-white/10 focus:border-purple-500/50 transition-all outline-none"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="relative group">
              <KeyIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
              <input 
                type="password"
                name="password"
                placeholder="Password"
                className="w-full bg-black/40 border-2 border-white/5 rounded-2xl py-5 pl-16 pr-6 text-white font-bold placeholder:text-white/10 focus:border-cyan-500/50 transition-all outline-none"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="pt-4">
              <NeonButton variant="cyan" className="w-full py-5 text-sm" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'CREATE ACCOUNT'}
              </NeonButton>
            </div>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4">Already have an account?</p>
            <Link to="/login" className="text-sm font-black text-white hover:text-purple-400 uppercase tracking-widest italic transition-colors">
              Log In Instead
            </Link>
          </div>
        </GlassCard>

        <p className="text-center mt-12 text-[8px] font-black uppercase tracking-[0.5em] text-white/10 italic">
          By synthesizing, you agree to the Collective Protocols and Neural Privacy Layers.
        </p>
      </motion.div>
    </div>
  );
};

export default Register;