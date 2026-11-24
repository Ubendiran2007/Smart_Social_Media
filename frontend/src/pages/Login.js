import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { GlassCard, NeonButton, AIBadge } from '../components/ui/SiliconValley';
import { SparklesIcon, KeyIcon, EnvelopeIcon, ShieldCheckIcon, UserIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const demoAccounts = [
  {
    role: 'admin',
    label: 'Admin',
    email: 'admin@sentient.io',
    username: 'admin',
    password: 'password123',
    badge: 'SUPERADMIN',
    color: 'amber'
  },
  {
    role: 'user',
    label: 'User',
    email: 'alex@sentient.io',
    username: 'alex_neuro',
    password: 'password123',
    badge: 'MEMBER',
    color: 'cyan'
  }
];

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [formData, setFormData] = useState({
    email: 'admin@sentient.io',
    password: 'password123'
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSelectRole = (account) => {
    setSelectedRole(account.role);
    setFormData({
      email: account.email,
      password: account.password
    });
    toast.success(`Loaded ${account.label} credentials (${account.username})`);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Neural Link Established');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-cyan-600/20 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-8 space-y-3">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 rounded-[2rem] bg-gradient-to-tr from-purple-500 to-cyan-400 mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(139,92,246,0.3)]"
          >
            <SparklesIcon className="w-8 h-8 text-white" />
          </motion.div>
          <AIBadge className="mx-auto">SENTIENT PLATFORM</AIBadge>
          <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Welcome Back
          </h1>
        </div>

        <GlassCard className="p-8 sm:p-10 border-white/10">
          {/* Quick Role Autofill Selectors */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">
                Quick Auto-Fill Role
              </span>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                1-Click Preset
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {demoAccounts.map((acc) => {
                const isSelected = selectedRole === acc.role;
                const isAdmin = acc.role === 'admin';

                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectRole(acc)}
                    className={`relative p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? isAdmin
                          ? 'bg-amber-500/15 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                          : 'bg-cyan-500/15 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/30 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        {isAdmin ? (
                          <ShieldCheckIcon className="w-4 h-4 text-amber-400" />
                        ) : (
                          <UserIcon className="w-4 h-4 text-cyan-400" />
                        )}
                        <span className={`text-xs font-black uppercase tracking-wider ${
                          isAdmin ? 'text-amber-400' : 'text-cyan-400'
                        }`}>
                          {acc.label}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[11px] font-mono font-medium text-white/80 truncate">
                        {acc.email}
                      </p>
                      <p className="text-[10px] font-mono text-white/40">
                        pass: <span className="text-white/60">{acc.password}</span>
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <EnvelopeIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                <input 
                  type="text"
                  name="email"
                  placeholder="Email or Username"
                  className="w-full bg-black/40 border-2 border-white/5 rounded-2xl py-4 pl-16 pr-6 text-white font-bold placeholder:text-white/20 focus:border-purple-500/50 transition-all outline-none"
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
                  className="w-full bg-black/40 border-2 border-white/5 rounded-2xl py-4 pl-16 pr-6 text-white font-bold placeholder:text-white/20 focus:border-cyan-500/50 transition-all outline-none"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <NeonButton variant="purple" className="w-full py-4 text-sm" type="submit" disabled={loading}>
              {loading ? 'Authenticating...' : `LOG IN AS ${selectedRole.toUpperCase()}`}
            </NeonButton>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-3">New here?</p>
            <Link to="/register" className="text-sm font-black text-white hover:text-cyan-400 uppercase tracking-widest italic transition-colors">
              Sign Up for an Account
            </Link>
          </div>
        </GlassCard>

        <p className="text-center mt-8 text-[8px] font-black uppercase tracking-[0.5em] text-white/10 italic">
          Sentient OS v2.0 • Encryption Layer Active
        </p>
      </motion.div>
    </div>
  );
};

export default Login;