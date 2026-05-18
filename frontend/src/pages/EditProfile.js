import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ArrowLeftIcon,
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  GlobeAltIcon,
  BeakerIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { GlassCard, AIBadge, NeonButton } from '../components/ui/SiliconValley';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    bio: '',
    skills: '',
    interests: '',
    experience: '',
    githubUrl: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        skills: user.professionalProfile?.skills?.join(', ') || '',
        interests: user.interests?.join(', ') || '',
        experience: user.professionalProfile?.experience || '',
        githubUrl: user.professionalProfile?.githubUrl || ''
      });
      setImagePreview(user.avatar);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updateData = new FormData();
      Object.keys(formData).forEach(key => {
        updateData.append(key, formData[key]);
      });
      
      if (selectedFile) {
        updateData.append('avatar', selectedFile);
      }

      const response = await api.put('/users/profile', updateData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      updateUser(response.data.user);
      toast.success('Neural profile synchronized!');
      navigate('/profile/' + user._id);
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Synchronization failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    
    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Security protocols updated!');
      setShowPasswordModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 pb-24">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            <ArrowLeftIcon className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Refine Identity</h1>
            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">Modify Neural Persona & Professional Stack</p>
          </div>
        </div>
        <AIBadge>ID: {user?.username?.toUpperCase()}</AIBadge>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Social */}
        <div className="space-y-8">
          <GlassCard className="p-8 flex flex-col items-center text-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-2 border-purple-500/50 p-1 bg-black/20 group-hover:border-purple-500 transition-all">
                <img src={imagePreview || `https://ui-avatars.com/api/?name=${user?.username}`} className="w-full h-full object-cover rounded-[2rem]" alt="" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-all">
                <CameraIcon className="w-8 h-8 text-white" />
              </div>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageSelect} accept="image/*" />
            </div>
            <h3 className="mt-6 text-sm font-black text-white uppercase tracking-widest">{user?.fullName}</h3>
            <p className="text-[10px] text-purple-400 font-bold uppercase mt-1 italic">@{user?.username}</p>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-4">Security Access</h4>
            <NeonButton variant="purple" className="w-full py-4 text-[10px]" type="button" onClick={() => setShowPasswordModal(true)}>
              Change Neural Key (Password)
            </NeonButton>
          </GlassCard>
        </div>

        {/* Right Column: Form Fields */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Full Name</label>
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full glass-input" placeholder="Neural Entity Name" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Username</label>
                <input name="username" value={formData.username} onChange={handleInputChange} className="w-full glass-input" placeholder="handle" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Email Synced</label>
              <input name="email" value={formData.email} onChange={handleInputChange} className="w-full glass-input" placeholder="email@nexus.com" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Neural Bio</label>
              <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={3} className="w-full glass-input py-4 resize-none" placeholder="Describe your essence..." />
            </div>
          </GlassCard>

          <GlassCard className="p-8 space-y-6">
            <h3 className="text-sm font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
              <BeakerIcon className="w-5 h-5 text-purple-400" />
              Professional Matrix
            </h3>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Core Skills (Comma separated)</label>
              <input name="skills" value={formData.skills} onChange={handleInputChange} className="w-full glass-input border-cyan-500/20" placeholder="React, Node.js, Neural Networks..." />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Experience Context</label>
              <input name="experience" value={formData.experience} onChange={handleInputChange} className="w-full glass-input border-cyan-500/20" placeholder="Senior Engineer @ AI Core..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">GitHub Neural Link</label>
                <input name="githubUrl" value={formData.githubUrl} onChange={handleInputChange} className="w-full glass-input border-white/5" placeholder="github.com/identity" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-2">Interests Matrix</label>
                <input name="interests" value={formData.interests} onChange={handleInputChange} className="w-full glass-input border-white/5" placeholder="AI, Bio-hacking, Mars..." />
              </div>
            </div>
          </GlassCard>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => navigate(-1)} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Cancel Sync</button>
            <NeonButton variant="purple" className="px-12 py-4" type="submit" disabled={loading}>
              {loading ? 'Transmitting...' : 'Synchronize Identity'}
            </NeonButton>
          </div>
        </div>
      </form>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md">
              <GlassCard className="p-8 border-purple-500/30">
                <h3 className="text-xl font-black text-white uppercase italic mb-8">Update Security Key</h3>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <input type="password" placeholder="Current Password" value={passwordData.currentPassword} onChange={e => setPasswordData(p => ({...p, currentPassword: e.target.value}))} className="w-full glass-input" />
                  <input type="password" placeholder="New Neural Key" value={passwordData.newPassword} onChange={e => setPasswordData(p => ({...p, newPassword: e.target.value}))} className="w-full glass-input" />
                  <input type="password" placeholder="Confirm Key" value={passwordData.confirmPassword} onChange={e => setPasswordData(p => ({...p, confirmPassword: e.target.value}))} className="w-full glass-input" />
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">Abort</button>
                    <NeonButton variant="purple" className="flex-1 py-3" type="submit">Update Key</NeonButton>
                  </div>
                </form>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditProfile;