/**
 * ImageCaptionEngine
 * 
 * Client-side image analysis for caption generation.
 * Uses canvas API to extract:
 *   - Dominant colors → scene type detection
 *   - Brightness/contrast → lighting/mood
 *   - Color temperature → warm/cool tone
 *
 * Outputs contextual, human-sounding captions with no system jargon.
 * Mood-aware: adapts tone based on user's selected mood.
 */

// ─── Scene detection from color palette ────────────────────────────────────

const SCENES = {
  nature: {
    label: 'nature',
    detect: ({ hue, saturation, brightness }) =>
      (hue >= 80 && hue <= 160 && saturation > 0.25) || // greens
      (hue >= 160 && hue <= 220 && saturation > 0.3 && brightness > 0.4), // teals/blues (sky/water)
  },
  sunset: {
    label: 'sunset / golden hour',
    detect: ({ hue, saturation, brightness }) =>
      (hue >= 10 && hue <= 50 && saturation > 0.4 && brightness > 0.4),
  },
  night: {
    label: 'night',
    detect: ({ brightness }) => brightness < 0.2,
  },
  indoor: {
    label: 'indoor / cozy',
    detect: ({ hue, saturation, brightness, warmth }) =>
      brightness > 0.3 && brightness < 0.75 && warmth > 0.55 && saturation < 0.45,
  },
  tech: {
    label: 'tech / workspace',
    detect: ({ hue, saturation, brightness }) =>
      (hue >= 190 && hue <= 260 && saturation < 0.4) || // desaturated blues/purples
      brightness > 0.1 && brightness < 0.35 && saturation < 0.3,
  },
  portrait: {
    label: 'portrait / people',
    detect: ({ skinToneRatio }) => skinToneRatio > 0.12,
  },
  food: {
    label: 'food',
    detect: ({ hue, saturation, warmth }) =>
      (hue >= 0 && hue <= 35 && saturation > 0.35) && warmth > 0.6,
  },
  travel: {
    label: 'travel / outdoors',
    detect: ({ hue, saturation, brightness }) =>
      brightness > 0.55 && saturation > 0.35 &&
      ((hue >= 185 && hue <= 235) || (hue >= 80 && hue <= 160)),
  },
  minimal: {
    label: 'minimal / aesthetic',
    detect: ({ saturation, brightness }) =>
      saturation < 0.2 && brightness > 0.55,
  },
};

// ─── Caption templates per scene × mood ────────────────────────────────────

const CAPTION_TEMPLATES = {
  'nature': {
    None:         ["Still finding the best views 🌿", "Some places just make you pause ✨", "This is my kind of therapy 🌱", "Slow down and look around 🍃", "Nature really said 'come find me' 🌲"],
    Calm:         ["Peace found me here 🌿", "Everything slows down in places like this 🍃", "This is what quiet looks like ✨", "Taking it all in, one breath at a time 🌊", "Nature is the reset button I needed 🌱"],
    Motivational: ["Every mountain was once a hill. Keep climbing 🏔️", "Rooted and still growing 🌱", "Nature doesn't rush, yet everything gets done 🍃", "Wild and free — that's the goal ✨", "Let this remind you — you've got this 💪"],
    Productive:   ["Best brainstorming session ever — no laptop needed 🌿", "Stepping outside is step one of every great idea 💡", "Fresh air, fresh perspective 🍃", "Nature mode: ON. Hustle mode: ready ✨", "Sometimes the best desk has no desk 🌱"],
    Funny:        ["My therapist is a forest 🌳😂", "Plants understood the assignment 🌿😭", "I came for a walk. The trees said 'stay' 🍃😅", "Officially a forest person now. No notes 🌲✌️", "The WiFi's terrible out here but the vibe is unmatched 📵😂"],
    Learning:     ["Every forest is a classroom 🌿📚", "Nature's been doing this way longer than us — take notes 🍃", "Studying under the best teacher around ✨", "Observation is the oldest science 🌱", "There's a lesson in every leaf, if you look close enough 🌿"],
  },
  'sunset / golden hour': {
    None:         ["Can't stop taking photos of this 🌅", "Golden hour never misses 🔥", "This one's for the 'gram 🌇", "The sky said okay, fine, I'll put on a show 🌆", "Best 20 minutes of the day ✨"],
    Calm:         ["The world is so loud. This is the quiet I needed 🌅", "Watching the day melt into evening ✨", "There's magic in the hour before dark 🌇", "A reminder that every day ends beautifully 🌆", "Let it all go with the sunset 🌅"],
    Motivational: ["Even the sun shows up and does its best every day 🌅🔥", "Every sunset is a reminder to finish what you started 🌇", "End every day like this — with intention and beauty 🌆", "Rise. Shine. Repeat 🌅", "Golden hour mindset. All day, every day ✨"],
    Productive:   ["Best 'end of day' notification 🌅", "The work continues, but the view makes it worth it 🌇", "Office hours ending on a high note ✨", "Productive day? The sky says yes 🌆", "Logging off for the best reason possible 🌅"],
    Funny:        ["The sky is showing off again 🌅😂", "I did nothing to deserve this view 🌇😭", "Plot twist: the sky is the content creator 🌆😅", "Unpaid model for golden hour again 🌅✌️", "The clouds really said 'watch this' 😭🔥"],
    Learning:     ["Watching the sky teaches you patience 🌅", "There's a geometry lesson in every horizon 🌇", "The colours of the sky — no designer could plan this ✨", "Every sunset is different. Every day should be too 🌆", "Chasing light. Chasing growth 🌅📚"],
  },
  'night': {
    None:         ["Nighttime hits different 🌙", "The city never really sleeps 🌃", "Best hours are the late ones 🌙✨", "After dark energy is unmatched 🖤", "Some of my best ideas happen after midnight 🌙"],
    Calm:         ["There's a whole world alive after dark 🌙", "Night is just a different kind of beautiful 🖤✨", "Quiet hours. Clear mind 🌙", "This is my favourite part of the day 🌃", "Stars out, thoughts clear 🌙"],
    Motivational: ["While others sleep, the dreamers build 🌙🔥", "Late nights are just early mornings for the committed ✨", "The hustle doesn't care what time it is 💪🌃", "Night shift for the big vision 🌙", "Stars don't shine in daylight 🌟 — neither do most great things"],
    Productive:   ["Night mode: activated 🌙💻", "Best version of deep work is at midnight 🌃", "Fewer notifications. More output 🖤✨", "The late-night grind is real, and I'm here for it 🌙", "This is where focus lives 🌙💡"],
    Funny:        ["My brain wakes up at the exact wrong time 🌙😭", "Why do I only get productive at 11pm 🌃😂", "The city is quiet. My thoughts are not 🌙😅", "Normal people sleep. I take photos 🌙✌️", "Can't sleep. Made content instead 😭🌃"],
    Learning:     ["Night is when the real thinking happens 🌙📚", "The universe is most visible at night — perfect metaphor 🌌", "Reading under stars hits differently ✨", "Late night study session: the stars are co-studying 🌙", "Quiet enough to finally hear myself think 🖤📚"],
  },
  'indoor / cozy': {
    None:         ["Home is the vibe today 🏠", "Cozy mode fully activated ☕", "This is my kind of atmosphere ✨", "Staying in was the right call 🧣", "Interior goals, honestly 🏡"],
    Calm:         ["Slow mornings hit differently ☕", "Made the most of staying in today 🏠", "The perfect kind of nothing 🧣✨", "Soft light and no plans — that's the dream 🏡", "Cozy is a whole lifestyle 🌿"],
    Motivational: ["Built from the inside, literally 🏠🔥", "Success starts at home 💪✨", "Where you are is where you start 🏡", "Every big thing started in a room like this 🌟", "Comfort zone: the launchpad, not the destination 🚀"],
    Productive:   ["WFH setup unlocked ☕💻", "Home office vibes are valid 🏠✨", "Productive in my favourite place to be 🏡", "Comfort and output — not mutually exclusive 💡", "The best office is the one you never have to commute to ☕"],
    Funny:        ["Didn't go outside. 10/10 recommend 🏠😂", "This couch is my coworker and my boss 😅", "Introvert achievement unlocked: stayed in all day ☕😭", "Netflix called. I answered. No regrets 📺😂", "My home is judging me for taking so many photos 🏡😅"],
    Learning:     ["Best library I know 🏠📚", "Learning from the comfort of home hits different ☕", "Home is where the reading happens 📖✨", "Studying in peace — underrated life hack 🏡", "The classroom came to me today 📚💡"],
  },
  'tech / workspace': {
    None:         ["In the zone 💻", "The build never stops ⚙️", "This is where things get made ✨", "Deep in it today 💡", "Workspace looking clean, mind focused 🖥️"],
    Productive:   ["Building something I'm proud of 💻🔥", "Every line of code is a step forward ⚙️", "The grind is real, and so are the results 💡", "Shipping features, not excuses 🚀", "Progress looks like this 💻✨"],
    Motivational: ["Build the thing. Launch it. Repeat 🚀", "The best projects start with a single commit 💻", "Every great product started in a workspace like this ✨", "Execution is everything 💡🔥", "Dream big. Code bigger 💻"],
    Calm:         ["Finding my flow state 💻✨", "Sometimes the best work feels like play 🖥️", "In the zone, do not disturb 💡", "Calm mind, productive hands ⚙️", "This is what focus looks like for me ✨"],
    Learning:     ["Learning by building — the best way 💻📚", "Every bug is a free tutorial 🐛", "Leveling up one project at a time ⚙️", "Today's lesson: just ship it 🚀", "Stack overflow + persistence = growth 💡📚"],
    Funny:        ["It works. I don't know why. Moving on 💻😂", "Fixing a bug by introducing two more 🐛😅", "The error messages are getting personal at this point 😭💻", "Me: I'll just do this quickly. Also me: *3 hours later* 😭", "My code compiles. I panic 😅🔥"],
  },
  'portrait / people': {
    None:         ["Good company makes everything better 💫", "This one's a keeper 📸", "The people in your life — everything ✨", "Captured this moment before it disappeared 🌟", "Some photos just feel right 📷"],
    Calm:         ["Grateful for the good ones ✨", "The best conversations happen without phones out 💫", "In good company, time doesn't exist 🌿", "Some people just make the room better 📸", "Presence over everything ✨"],
    Motivational: ["Surround yourself with people who push you 💫🔥", "Find your people. They exist 🌟", "Energy is contagious — choose wisely 💪✨", "The right company changes everything 📸", "Built different, together 🔥"],
    Funny:        ["Caught in 4K 📸😂", "Candid? I didn't consent to this 😅", "Someone has to be the photographer — today it was me 😭📷", "We clean up good 😂✨", "The camera adds zero pounds but removes all dignity 😅📸"],
    Learning:     ["Learning from the people around you is the real curriculum 💫📚", "Every conversation is a lesson 🌟", "The best mentors aren't always in classrooms ✨", "Wisdom is contagious when you're around the right people 💫", "People watching: the oldest study 📸"],
    Productive:   ["Team work in session 💫💻", "Better together — and more productive 🌟", "Collaboration beats isolation, every time ✨", "Meetings that actually move things forward 📸🔥", "The crew's working. Watch this space 💪"],
  },
  'food': {
    None:         ["Okay but the food 🍽️✨", "This one deserved a photo 📸", "Didn't wait, ate first, then posted 🍴", "The real highlight of the day 🌟", "Worth every calorie 🍽️"],
    Calm:         ["Slow food, slow morning ☕🍳", "This meal asked for my full attention 🍽️✨", "Simple food, big mood 🌿", "Eating with intention today 🍴", "This is what self-care looks like for me ✨"],
    Funny:        ["I cooked this... I'm surprised too 🍳😂", "Eating before it gets cold. No time for angles 🍴😅", "My stomach said post it, so I did 😭🍽️", "Technically a recipe, technically chaos 🍳😂", "Chef mode: on. Recipe: ignored 😅🔥"],
    Motivational: ["Fuel up to build up 🍽️🔥", "What you eat is what you become — make it count 💪✨", "Every meal is a choice for your future self 🌟", "Nourish to flourish 🍴", "Eat well, think well, do well 🍽️💡"],
    Learning:     ["Tried something new today 🍽️📚", "Cooking is just edible chemistry ✨", "Recipe mastered — eventually 🍴😅", "New cuisine unlocked 🌟", "Cooking counts as learning. I'm taking that 😂📚"],
    Productive:   ["Meal prep was the best decision I made this week 🍽️💡", "Fuel for the grind ☕🔥", "Eating smart so I can work smart 🍴✨", "Food: the original productivity hack 🌟", "Prep, fuel, execute 💪🍽️"],
  },
  'travel / outdoors': {
    None:         ["New place, same good energy ✈️", "Wandered and didn't get lost — growth 🗺️", "Add this to the list 📍✨", "The best views go to those who show up 🌍", "Still chasing horizons 🌅"],
    Calm:         ["Somewhere new, finally breathing 🌍✨", "The world feels bigger out here 🗺️", "Slow travel is the best travel 🌿", "New places, quieter thoughts ✈️", "This is why I leave home 🌅"],
    Motivational: ["Go more places. Come back changed 🌍🔥", "Every trip is a new version of you 🗺️", "Discomfort is just growth in disguise ✈️💪", "The world won't come to you — go to it 🌅", "Travel. It's the best investment 🌍✨"],
    Funny:        ["I'm lost but confidently lost ✈️😂", "Budget travel hits different 🗺️😅", "Google Maps lied to me again 😭📍", "Can't afford therapy. Bought plane tickets instead ✈️😂", "I came for the views, stayed for the food 🌍😅"],
    Learning:     ["Every new place is a new education 🌍📚", "You learn more from a map than a classroom 🗺️✨", "Travel is reading the world in person 🌅", "Culture shock: required curriculum 🌍💡", "Every border crossed is a new perspective ✈️"],
    Productive:   ["Working from a new location — highly recommend 💻🌍", "Remote work found its purpose here 🗺️✨", "Changed the scenery to change the output 🌅💡", "New country. Same goals ✈️🔥", "Travelling and building. Multitasking at its finest 🌍💻"],
  },
  'minimal / aesthetic': {
    None:         ["Less is more 🖤", "Clean and intentional ✨", "The art is in the negative space 🤍", "Aesthetic is a mindset 🌿", "Simple. Deliberate. Beautiful ✨"],
    Calm:         ["Minimalism is a form of peace 🤍", "Less clutter, more clarity ✨", "Beauty in the ordinary 🌿", "The simpler, the better 🖤", "Calm spaces, calm minds ✨"],
    Motivational: ["Do less. Mean more 🖤🔥", "Clarity over clutter, always 🤍", "Intentional living starts with intentional spaces ✨", "Edit your life until it feels right 🌿", "Less noise, more impact 💪🖤"],
    Funny:        ["Me: minimalism. Also me: has 400 apps 😅🖤", "Decluttered my space. My brain said 'interesting concept' 😂🤍", "This photo took 45 minutes to set up 😭✨", "Aesthetic accounts: 90% planning, 10% vibes 😅🌿", "Clean desk energy. Zero clean desk 😂🖤"],
    Learning:     ["Simple design teaches the most 🤍📚", "White space is not empty — it's intentional ✨", "Studying the art of less 🌿", "The most elegant solutions are usually the simplest 🖤💡", "Less to process. More to absorb ✨"],
    Productive:   ["Cleared the space to clear the mind 💡🤍", "Productive spaces look like this ✨", "Minimal setup. Maximum focus 🖤", "Clean environment, clean execution 🌿", "Less on the desk. More in the output 💡✨"],
  },
};

// Default captions when scene can't be detected
const DEFAULT_CAPTIONS = {
  None:         ["Made this moment count 📸", "Some things deserve to be remembered ✨", "Good day, honestly 🌟", "This one's for the archive 📷", "Grateful for this one ✨"],
  Calm:         ["Just being present today 🌿", "Slowing down and soaking it in ✨", "Peaceful moment, captured ✨", "Today's energy: gentle 🌱", "This is enough ✨"],
  Motivational: ["Every day is a fresh start 🔥", "Put in the work. Trust the process 💪", "Progress, not perfection ✨", "Small wins are still wins 🌟", "Showing up is half the battle 💪"],
  Productive:   ["Getting things done ✨💡", "Checked something off the list today 📋", "Focused and building 💻🔥", "Output mode: on ✨", "Making moves, one step at a time 💪"],
  Funny:        ["No context needed 😂", "I made a choice. I stand by it 😅", "This is fine 🙃", "Doing my best and it shows 😂✨", "Chaotic energy, but make it cute 😅"],
  Learning:     ["Something new every day 📚✨", "Growth looks like this 🌱", "Added to the mental notes 💡", "Every experience is data 📚", "Curiosity is the only prerequisite ✨"],
};

// ─── Image analysis via canvas ──────────────────────────────────────────────

function extractImageData(imgElement) {
  const canvas = document.createElement('canvas');
  const MAX_SIZE = 100; // Small for performance
  const ratio = Math.min(MAX_SIZE / imgElement.width, MAX_SIZE / imgElement.height);
  canvas.width = Math.floor(imgElement.width * ratio);
  canvas.height = Math.floor(imgElement.height * ratio);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6;
    }
  }
  return { h: h * 360, s, l };
}

function isSkinTone(r, g, b) {
  // Skin tone range detection (works for a broad range of skin tones)
  return r > 95 && g > 40 && b > 20 &&
    r > g && r > b &&
    Math.abs(r - g) > 15 &&
    r - Math.min(g, b) > 15;
}

export function analyzeImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const imageData = extractImageData(img);
        const { data, width, height } = imageData;
        const totalPixels = width * height;

        let totalH = 0, totalS = 0, totalL = 0;
        let skinPixels = 0;
        let warmPixels = 0;
        let darkPixels = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const { h, s, l } = rgbToHsl(r, g, b);
          totalH += h;
          totalS += s;
          totalL += l;
          if (isSkinTone(r, g, b)) skinPixels++;
          if (r > g + 20 && r > b + 20) warmPixels++; // warm pixels
          if (l < 0.15) darkPixels++;
        }

        const avgH = totalH / totalPixels;
        const avgS = totalS / totalPixels;
        const avgL = totalL / totalPixels;
        const skinToneRatio = skinPixels / totalPixels;
        const warmth = warmPixels / totalPixels;

        const colorProfile = {
          hue: avgH,
          saturation: avgS,
          brightness: avgL,
          skinToneRatio,
          warmth,
        };

        // Detect scene
        let detectedScene = 'default';
        for (const [name, scene] of Object.entries(SCENES)) {
          if (scene.detect(colorProfile)) {
            detectedScene = name;
            break;
          }
        }

        URL.revokeObjectURL(url);
        resolve({ scene: detectedScene, colorProfile });
      } catch {
        URL.revokeObjectURL(url);
        resolve({ scene: 'default', colorProfile: {} });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ scene: 'default', colorProfile: {} });
    };

    img.src = url;
    img.crossOrigin = 'anonymous';
  });
}

// ─── Caption generation ─────────────────────────────────────────────────────

/**
 * Generates 3–5 human, social-media-friendly captions based on:
 * - Detected scene from image color analysis
 * - User's active mood
 * Returns captions + relevant hashtags (no hardcoded lists — hashtags are
 * derived from scene + mood via the HashtagIntelligencePanel endpoint).
 */
export function generateCaptions(scene, mood = 'None', count = 4) {
  const moodKey = ['Productive', 'Motivational', 'Calm', 'Learning', 'Funny'].includes(mood)
    ? mood : 'None';

  const templates =
    (CAPTION_TEMPLATES[scene] && CAPTION_TEMPLATES[scene][moodKey])
    || (CAPTION_TEMPLATES[scene] && CAPTION_TEMPLATES[scene]['None'])
    || DEFAULT_CAPTIONS[moodKey]
    || DEFAULT_CAPTIONS['None'];

  // Shuffle and pick `count` unique captions
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Full pipeline: analyze image file → return captions + scene info.
 * Call this after user uploads a file.
 */
export async function generateImageCaptions(file, mood = 'None') {
  // For video files, skip image analysis and use mood-only captions
  if (!file.type.startsWith('image/')) {
    const videoCaptions = generateCaptions('default', mood, 4);
    return { captions: videoCaptions, scene: 'video', sceneLabel: 'video' };
  }

  const { scene, colorProfile } = await analyzeImage(file);
  const captions = generateCaptions(scene, mood, 4);
  const sceneLabel = SCENES[scene]?.label || scene;

  return { captions, scene, sceneLabel, colorProfile };
}
