# SENTIENT: THE EMOTIONALLY INTELLIGENT SOCIAL ECOSYSTEM

## 🚀 PROJECT IDENTITY
- **Name**: Sentient
- **Tagline**: "Connect with Purpose. Build with Intelligence. Live with Intent."
- **Core Concept**: An AI-enhanced platform that bridges the gap between social interaction, mental wellness, and professional productivity.

---

## 🏗️ 1. PROJECT ARCHITECTURE

### 1.1 Tech Stack
- **Frontend**: React 18, Tailwind CSS (Glassmorphism), Framer Motion (Animations), Context API.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO (Real-time).
- **AI Integration**: Custom AI Middleware (Mocked or OpenAI/HuggingFace integration) for sentiment analysis, toxicity detection, and caption generation.
- **Media**: Cloudinary for high-speed CDN delivery of images and vertical videos (Reels).
- **Auth**: JWT with HTTP-only cookies or secure local storage.

### 1.2 Folder Structure (Optimized)
```
social_media_project/
├── backend/
│   ├── config/             # DB, Cloudinary, Socket
│   ├── controllers/        # AI, Auth, Posts, Rooms, Analytics
│   ├── middleware/         # Auth, AI Moderation, Upload
│   ├── models/             # User (Smart), Post (Emotion), Room (Collab)
│   ├── routes/             # REST Endpoints
│   ├── services/           # AI Services, Notification Queue
│   └── utils/              # Helper functions
├── frontend/
│   ├── src/
│   │   ├── components/     # UI Design System (Glassmorphic)
│   │   ├── context/        # Auth, AI, Socket
│   │   ├── hooks/          # Custom AI/Real-time hooks
│   │   ├── pages/          # Futuristic Views
│   │   ├── services/       # API Integration
│   │   └── animations/     # Framer Motion presets
```

---

## 🗄️ 2. ADVANCED DATABASE DESIGN (MONGODB)

### 2.1 User Schema Enhancements
```javascript
{
  // ... existing fields ...
  moodAnalytics: {
    currentMood: { type: String, enum: ['Motivational', 'Calm', 'Productive', 'Learning', 'Funny'] },
    moodHistory: [{ mood: String, date: Date }],
    burnoutIndex: { type: Number, default: 0 }
  },
  professionalProfile: {
    skills: [String],
    portfolioUrl: String,
    githubUrl: String,
    resumeUrl: String,
    achievements: [{ title: String, date: Date }],
    techBadges: [String]
  },
  productivity: {
    focusMode: Boolean,
    pomodoroSessions: { type: Number, default: 0 },
    studyTime: { type: Number, default: 0 }
  },
  toxicityScore: { type: Number, default: 100 }, // Starting at 100, decreases with toxicity
  interests: [String]
}
```

### 2.2 Post & Emotion Schema
```javascript
{
  // ... existing fields ...
  emotionReactions: {
    inspired: [{ type: ObjectId, ref: 'User' }],
    helpful: [{ type: ObjectId, ref: 'User' }],
    funny: [{ type: ObjectId, ref: 'User' }],
    deep: [{ type: ObjectId, ref: 'User' }],
    motivating: [{ type: ObjectId, ref: 'User' }],
    creative: [{ type: ObjectId, ref: 'User' }]
  },
  aiMetadata: {
    sentiment: String,
    toxicityScore: Number,
    suggestedHashtags: [String]
  }
}
```

---

## 🎨 3. UI/UX DESIGN SYSTEM

- **Theme**: Deep Space Black (#050505) with Electric Purple (#9333ea) and Cyan (#06b6d4) accents.
- **Glassmorphism**: 
  - `backdrop-filter: blur(16px) saturate(180%)`
  - `background-color: rgba(17, 25, 40, 0.75)`
  - `border: 1px solid rgba(255, 255, 255, 0.125)`
- **Animations**:
  - Page Transitions: Smooth slide and fade using Framer Motion.
  - Hover Effects: 3D tilt and glowing borders for post cards.
  - Floating Navigation: Bottom dock inspired by macOS.

---

## 🛠️ 4. CORE FEATURE WORKFLOWS

### 4.1 AI Mood Feed
1. **Detection**: AI analyzes user's recent engagement (likes, comments, scroll time).
2. **Personalization**: User can toggle "Productivity Mode" which filters out memes/distractions and shows only "Learning" and "Career" content.
3. **Switching**: A "Mood Dial" in the sidebar allows users to manually shift the platform's vibe.

### 4.2 Smart Anti-Toxicity
1. **Intercept**: Middleware analyzes comment content before DB save.
2. **Feedback**: If toxicity > 0.7, a modal appears: *"Your words have power. This might be perceived as hurtful. Want to rephrase?"*
3. **Analytics**: Admin dashboard tracks toxicity trends across the community.

### 4.3 Collaborative Study Rooms
1. **Real-time**: Socket.IO rooms for group study or coding.
2. **Shared Tools**: Integrated Pomodoro timer and "Shared Post Editor" for live collaboration.

---

## 🚀 5. UNIQUE SELLING POINTS (USP)
- **Mental Awareness**: First social platform to actively detect and mitigate social media burnout.
- **Career-First Social**: Blends professional growth (GitHub/Skills) with casual social media (Reels/Posts).
- **Toxicity Neutralization**: Moves beyond reporting to proactive prevention using AI prompts.

---

## 🎤 6. STARTUP PITCH & RESUME DESCRIPTION

**Pitch**: "Sentient isn't just another social network; it's a cognitive companion. We've built an AI-driven ecosystem that prioritizes the user's mental health and professional growth, using emotional intelligence to curate feeds that inspire rather than distract."

**Resume Description**: "Developed 'Sentient', a full-stack AI-powered social ecosystem using the MERN stack. Implemented real-time sentiment analysis, toxicity mitigation algorithms, and collaborative study rooms. Optimized for high performance with Socket.IO and Cloudinary, featuring a premium glassmorphic UI."

---

**Next Steps**: Implementation of updated schemas and the core futuristic UI components.
