import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import MyAccount from './pages/MyAccount';
import Wellness from './pages/Wellness';
import EditProfile from './pages/EditProfile';
import ResetPassword from './pages/ResetPassword';
import NotificationSettings from './pages/NotificationSettings';
import PrivacySettings from './pages/PrivacySettings';
import LinkedAccounts from './pages/LinkedAccounts';
import Stories from './pages/Stories';
import Docs from './pages/Docs';
import Reels from './pages/Reels';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import Search from './pages/Search';
import Create from './pages/Create';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Layout from './components/common/Layout';

import Loading from './components/common/Loading';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <Loading />;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <Loading />;
  
  return !isAuthenticated ? children : <Navigate to="/" />;
};

function AppContent() {
  const location = useLocation();
  return (
    <div className="App">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/search" element={
          <ProtectedRoute>
            <Layout>
              <Search />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute>
            <Layout>
              <Create />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile/:userId" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/my-account" element={
          <ProtectedRoute>
            <MyAccount />
          </ProtectedRoute>
        } />
        <Route path="/edit-profile" element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        } />
        <Route path="/reset-password" element={
          <ProtectedRoute>
            <ResetPassword />
          </ProtectedRoute>
        } />
        <Route path="/notification-settings/*" element={
          <ProtectedRoute>
            <NotificationSettings />
          </ProtectedRoute>
        } />
        <Route path="/privacy-settings/*" element={
          <ProtectedRoute>
            <PrivacySettings />
          </ProtectedRoute>
        } />
        <Route path="/linked-accounts" element={
          <ProtectedRoute>
            <LinkedAccounts />
          </ProtectedRoute>
        } />
        <Route path="/stories" element={
          <ProtectedRoute>
            <Layout>
              <Stories />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/docs" element={
          <ProtectedRoute>
            <Layout>
              <Docs />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reels" element={
          <ProtectedRoute>
            <Layout>
              <Reels />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute>
            <Layout>
              <Chat />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Layout>
              <Notifications />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Layout>
              <AnalyticsDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/wellness" element={
          <ProtectedRoute>
            <Layout>
              <Wellness />
            </Layout>
          </ProtectedRoute>
        } />


        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

import { MoodProvider } from './context/MoodContext';
import { WellnessProvider } from './context/WellnessContext';

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <MoodProvider>
          <WellnessProvider>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </WellnessProvider>
        </MoodProvider>
      </AuthProvider>
    </Router>
  );
}



export default App;