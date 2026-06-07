/**
 * Advanced Image Analysis & Caption Generation Engine
 * 
 * Uses client-side heuristics (filename tokenization + canvas color metrics)
 * to simulate an advanced vision model, generating highly contextual,
 * social-media ready captions across different platforms and moods.
 */

// ─── Lexicon & Knowledge Base ──────────────────────────────────────────────

const CONCEPT_MAP = {
  // Objects
  mask: { themes: ['Mystery', 'Hidden', 'Intrigue'], emotions: ['Curious', 'Moody'] },
  coffee: { themes: ['Morning', 'Focus', 'Cafe Culture'], emotions: ['Energized', 'Cozy'] },
  laptop: { themes: ['Work', 'Tech', 'Digital Nomad'], emotions: ['Productive', 'Focused'] },
  cat: { themes: ['Pets', 'Feline', 'Home'], emotions: ['Relaxed', 'Amused'] },
  dog: { themes: ['Pets', 'Outdoors', 'Loyalty'], emotions: ['Joyful', 'Playful'] },
  car: { themes: ['Travel', 'Automotive', 'Journey'], emotions: ['Adventurous', 'Free'] },
  mountain: { themes: ['Nature', 'Adventure', 'Scale'], emotions: ['Awe', 'Peaceful'] },
  city: { themes: ['Urban', 'Nightlife', 'Architecture'], emotions: ['Vibrant', 'Busy'] },
  code: { themes: ['Development', 'Tech', 'Engineering'], emotions: ['Productive', 'Focused'] },
  book: { themes: ['Learning', 'Literature', 'Quiet'], emotions: ['Thoughtful', 'Calm'] },
  gym: { themes: ['Fitness', 'Health', 'Grind'], emotions: ['Motivated', 'Strong'] },
  food: { themes: ['Culinary', 'Dining', 'Taste'], emotions: ['Satisfied', 'Joyful'] },
  sea: { themes: ['Nature', 'Ocean', 'Travel'], emotions: ['Calm', 'Free'] },
  beach: { themes: ['Travel', 'Summer', 'Relaxation'], emotions: ['Chill', 'Happy'] },
  sky: { themes: ['Nature', 'Atmosphere', 'Dreams'], emotions: ['Peaceful', 'Hopeful'] },
  sunset: { themes: ['Evening', 'Aesthetic', 'Endings'], emotions: ['Reflective', 'Calm'] },
  street: { themes: ['Urban', 'Life', 'Photography'], emotions: ['Observant', 'Vibrant'] },
  neon: { themes: ['Cyberpunk', 'Night', 'Vibrant'], emotions: ['Energetic', 'Moody'] },
  party: { themes: ['Celebration', 'Friends', 'Nightlife'], emotions: ['Joyful', 'Excited'] },
  art: { themes: ['Creativity', 'Expression', 'Design'], emotions: ['Inspired', 'Curious'] },
  music: { themes: ['Audio', 'Performance', 'Vibe'], emotions: ['Passionate', 'Immersed'] },
  plant: { themes: ['Nature', 'Growth', 'Home'], emotions: ['Calm', 'Nurturing'] },
  flower: { themes: ['Nature', 'Beauty', 'Spring'], emotions: ['Joyful', 'Peaceful'] },
  friend: { themes: ['Connection', 'Social', 'Memories'], emotions: ['Happy', 'Loved'] },
  family: { themes: ['Connection', 'Home', 'Love'], emotions: ['Grounded', 'Happy'] },
  wedding: { themes: ['Celebration', 'Romance', 'Milestone'], emotions: ['Joyful', 'Emotional'] },
  snow: { themes: ['Winter', 'Cold', 'Nature'], emotions: ['Peaceful', 'Crisp'] },
  rain: { themes: ['Weather', 'Moody', 'Cozy'], emotions: ['Reflective', 'Calm'] },
};

// Common platform styles
const PLATFORM_STYLES = {
  Instagram: 'Aesthetic, concise, emoji-heavy, focus on vibes.',
  Threads: 'Conversational, witty, short, community-focused.',
  LinkedIn: 'Professional, insightful, story-driven, value-add.',
  TikTok: 'Trendy, Gen-Z slang, hook-oriented, chaotic good.'
};

// ─── Image Analysis via Canvas + Filename Heuristics ───────────────────────

function extractImageData(imgElement) {
  const canvas = document.createElement('canvas');
  const MAX = 100;
  const ratio = Math.min(MAX / imgElement.width, MAX / imgElement.height);
  canvas.width = Math.floor(imgElement.width * ratio);
  canvas.height = Math.floor(imgElement.height * ratio);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function analyzePixels(imageData) {
  let dark = 0, bright = 0, warm = 0, cool = 0;
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    const brightness = (r + g + b) / 3;
    if (brightness < 60) dark++;
    if (brightness > 200) bright++;
    if (r > b + 20) warm++;
    if (b > r + 20) cool++;
  }
  const total = data.length / 4;
  return {
    isDark: dark / total > 0.4,
    isBright: bright / total > 0.4,
    isWarm: warm / total > 0.5,
    isCool: cool / total > 0.5,
  };
}

export async function advancedAnalyzeImage(file) {
  return new Promise((resolve) => {
    // 1. Filename extraction (simulating object detection)
    const nameStr = file.name.toLowerCase().replace(/[-_.]/g, ' ');
    const words = nameStr.split(' ');
    
    let detectedObjects = [];
    let detectedThemes = new Set();
    let detectedEmotions = new Set();

    words.forEach(w => {
      if (CONCEPT_MAP[w]) {
        detectedObjects.push(w.charAt(0).toUpperCase() + w.slice(1));
        CONCEPT_MAP[w].themes.forEach(t => detectedThemes.add(t));
        CONCEPT_MAP[w].emotions.forEach(e => detectedEmotions.add(e));
      }
    });

    // Fallback if filename gives nothing
    if (detectedObjects.length === 0) {
      if (file.type.includes('video')) {
        detectedObjects.push('Video');
        detectedThemes.add('Motion');
      } else {
        detectedObjects.push('Portrait');
        detectedObjects.push('Person');
        detectedThemes.add('Lifestyle');
      }
    }

    // 2. Canvas analysis (Lighting, Vibe, Environment)
    if (!file.type.startsWith('image/')) {
      resolve({
        objects: detectedObjects,
        themes: Array.from(detectedThemes),
        emotions: Array.from(detectedEmotions),
        styles: ['Cinematic', 'Dynamic'],
        environments: ['Ambient'],
        rawContext: detectedObjects.join(', ')
      });
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      try {
        const metrics = analyzePixels(extractImageData(img));
        
        let styles = ['Photography'];
        let environments = [];

        if (metrics.isDark) {
          detectedThemes.add('Mystery');
          styles.push('Moody', 'Creative');
          environments.push('Low Light', 'Night');
          detectedEmotions.add('Introspective');
        } else if (metrics.isBright) {
          styles.push('Airy', 'Minimalist');
          environments.push('Daylight', 'Bright');
          detectedEmotions.add('Joyful');
        }

        if (metrics.isWarm) {
          styles.push('Warm Tone');
          environments.push('Golden Hour / Indoor');
        } else if (metrics.isCool) {
          styles.push('Cool Tone');
          environments.push('Outdoor / Studio');
        }

        URL.revokeObjectURL(url);
        resolve({
          objects: detectedObjects,
          themes: Array.from(detectedThemes).slice(0, 3),
          emotions: Array.from(detectedEmotions).slice(0, 3),
          styles: styles.slice(0, 3),
          environments: environments,
          rawContext: detectedObjects.join(', ')
        });
      } catch (e) {
        URL.revokeObjectURL(url);
        resolve({ objects: detectedObjects, themes: Array.from(detectedThemes), emotions: [], styles: [], environments: [], rawContext: detectedObjects.join(', ') });
      }
    };
    img.onerror = () => resolve({ objects: detectedObjects, themes: Array.from(detectedThemes), emotions: [], styles: [], environments: [], rawContext: detectedObjects.join(', ') });
    img.src = url;
  });
}

// ─── Dynamic Caption Generation ─────────────────────────────────────────────

/**
 * Generates captions using a combination of the detected context and the requested style.
 */
export function generateAdvancedCaptions(analysis, mood, styleVariation) {
  const { objects, themes, emotions, styles } = analysis;
  
  // We'll use the primary object and theme to drive the template selection
  const primaryObject = objects[0]?.toLowerCase() || 'moment';
  const primaryTheme = themes[0]?.toLowerCase() || 'lifestyle';
  const isMystery = themes.includes('Mystery') || objects.includes('Mask');
  
  const captions = [];

  // ── Helper to build contextual sentences
  const getContextualIntro = () => {
    if (isMystery) return ["Behind every mask lies a different story.", "Some things are better left unsaid.", "Not everything needs to be explained."];
    if (primaryObject === 'coffee') return ["Fueling up.", "Morning rituals.", "Liquid motivation."];
    if (primaryObject === 'laptop' || primaryObject === 'code') return ["Building the future.", "Deep work mode.", "Another day, another deploy."];
    if (primaryObject === 'mountain' || primaryObject === 'nature') return ["Views like this.", "Out of office.", "Where I belong."];
    return [`Just a ${primaryObject} kind of day.`, `The ultimate ${primaryTheme} vibe.`, `Appreciating the little things.`];
  };

  const intros = getContextualIntro();

  // 1. Creative (Instagram vibe)
  if (styleVariation === 'Creative') {
    captions.push(`${intros[0]} 🎭 Creating my own reality today.`);
    captions.push(`Details make the design. ⚡ The ${primaryTheme} aesthetic is unmatched.`);
    captions.push(`Visuals speaking louder than words right now. 📸✨`);
    captions.push(`Channeling full ${emotions[0] || 'creative'} energy today. 🎨`);
    captions.push(`POV: you romanticize the ${primaryObject} in your life. 💫`);
  }
  
  // 2. Professional (LinkedIn vibe)
  else if (styleVariation === 'Professional' || mood === 'Productive') {
    captions.push(`Navigating the complexities of ${primaryTheme} requires focus and vision. Here's a glimpse into today's process. 📈`);
    captions.push(`Every detail matters when you're committed to excellence. A moment from my latest project involving ${primaryObject}. 💡`);
    captions.push(`Sometimes stepping back gives the best perspective. Reflecting on the impact of ${primaryTheme} today. 🤝`);
    captions.push(`Continuous growth means exploring new avenues. Excited to dive deeper into this space. 🚀 #Leadership`);
    captions.push(`The intersection of ${primaryTheme} and innovation. Always building. 💻📊`);
  }
  
  // 3. Funny (TikTok/Threads vibe)
  else if (styleVariation === 'Funny' || mood === 'Funny') {
    captions.push(`Me trying to understand this ${primaryObject} like it's advanced calculus. 😭💀`);
    captions.push(`I don't know who needs to hear this, but ${primaryTheme} is my entire personality now. ✌️😂`);
    captions.push(`My therapist: "And how does the ${primaryObject} make you feel?" Me: 👁️👄👁️`);
    captions.push(`Not me pretending I have my life together while taking this pic. 🤡✨`);
    captions.push(`Unpaid brand ambassador for ${primaryTheme} vibes at this point. 💅😂`);
  }
  
  // 4. Deep (Thoughtful/Calm)
  else if (styleVariation === 'Deep' || mood === 'Calm') {
    captions.push(`${intros[1]} There is a quiet beauty in observing the world as it is. 🌿`);
    captions.push(`We spend so much time rushing, we forget to appreciate the ${primaryTheme} around us. ✨`);
    captions.push(`Stillness is a luxury. Finding my center today. 🤍`);
    captions.push(`The outer world reflects the inner state. Feeling deeply ${emotions[0] || 'connected'} right now. 🌊`);
    captions.push(`Shadows and light. Both are necessary. 🌘`);
  }
  
  // 5. Motivational
  else {
    captions.push(`${intros[0]} Keep pushing your limits, even when no one is watching. 💪🔥`);
    captions.push(`The only bad workout/day is the one that didn't happen. Stay focused on the ${primaryTheme}. 🚀`);
    captions.push(`Success is rented, and rent is due every day. Let's get it. 💯✨`);
    captions.push(`Embrace the challenge. The ${primaryObject} is just part of the journey. 🏔️`);
    captions.push(`Your potential is endless. Go do what you were created to do. 🌟💪`);
  }

  // Generate 5 distinct hashtag groups based on the analysis
  const baseTags = [primaryObject, primaryTheme.replace(/\s+/g, ''), ...(styles.map(s => s.replace(/\s+/g, '')))];
  
  const hashtagGroups = [
    [...baseTags, 'Vibes', 'Daily', 'Moments'].map(t => `#${t.toLowerCase()}`),
    [...baseTags, 'Aesthetic', 'Visuals', 'Mood'].map(t => `#${t.toLowerCase()}`),
    [...baseTags, 'Mindset', 'Growth', 'Focus'].map(t => `#${t.toLowerCase()}`),
    [...baseTags, 'Creator', 'Life', 'Story'].map(t => `#${t.toLowerCase()}`),
    [...baseTags, 'Explore', 'Community', 'Trend'].map(t => `#${t.toLowerCase()}`),
  ];

  return {
    captions: captions.slice(0, 5),
    hashtagGroups: hashtagGroups.slice(0, 5)
  };
}
