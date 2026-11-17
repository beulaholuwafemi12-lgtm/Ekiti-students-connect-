import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Compass,
  MessageCircle,
  Phone,
  Video,
  Plus,
  Heart,
  MessageSquare,
  Repeat2,
  Gift,
  ShieldCheck,
  Crown,
  MapPin,
  Search,
  Send,
  Mic,
  MicOff,
  VideoOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Sparkles,
  CheckCircle2,
  Users,
  Smartphone,
  CreditCard,
  X,
  Upload,
  LogOut,
  Copy,
  Check,
  Wifi,
  Award,
  Wallet,
  Radio,
  Rocket,
  QrCode,
  SlidersHorizontal
} from 'lucide-react';

// Firebase Modular SDK Imports
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  serverTimestamp
} from 'firebase/firestore';

// ============================================================================
// FIREBASE INITIALIZATION (Safe Fallback for Instant Browser Preview)
// ============================================================================
let db = null;
let auth = null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'ekiti-connect-live';

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = JSON.parse(__firebase_config);
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (err) {
  console.warn('Firebase config not detected; running in local browser mode:', err);
}

// ============================================================================
// EKITI STATE ECOSYSTEM CONSTANTS & SEED DATA
// ============================================================================
const EKITI_INSTITUTIONS = [
  { code: 'EKSU', name: 'Ekiti State University, Ado-Ekiti', badgeColor: 'bg-blue-600 text-white' },
  { code: 'ABUAD', name: 'Afe Babalola University, Ado-Ekiti', badgeColor: 'bg-indigo-600 text-white' },
  { code: 'FUOYE', name: 'Federal University Oye-Ekiti', badgeColor: 'bg-sky-600 text-white' },
  { code: 'BOUESTI', name: 'Bamidele Olumilua University, Ikere-Ekiti', badgeColor: 'bg-blue-800 text-white' },
  { code: 'Ekiti Resident', name: 'Ekiti State Resident / Entrepreneur', badgeColor: 'bg-slate-700 text-white' }
];

const EKITI_TOWNS = [
  { id: 'all', name: 'All Ekiti Towns', landmark: 'Statewide', distanceKm: 0 },
  { id: 'Ado-Ekiti', name: 'Ado-Ekiti', landmark: 'Fayose Market / Fajuyi', distanceKm: 0.8 },
  { id: 'Oye-Ekiti', name: 'Oye-Ekiti', landmark: 'FUOYE Main Gate', distanceKm: 28.4 },
  { id: 'Ikere-Ekiti', name: 'Ikere-Ekiti', landmark: 'BOUESTI Axis', distanceKm: 16.2 },
  { id: 'Ikogosi', name: 'Ikogosi', landmark: 'Warm Springs Resort', distanceKm: 34.0 },
  { id: 'Ijero', name: 'Ijero-Ekiti', landmark: 'Central Town Square', distanceKm: 39.5 },
  { id: 'Ido-Ekiti', name: 'Ido-Ekiti', landmark: 'Federal Teaching Hospital', distanceKm: 31.0 }
];

const VIRTUAL_GIFTS = [
  { id: 'palmwine', name: 'Fresh Palm Wine', price: 200, emoji: '🥥', desc: 'Tapped fresh in Ekiti hills' },
  { id: 'poundedyam', name: 'Iyan & Efo Riro', price: 500, emoji: '🍲', desc: 'Authentic Ekiti royal feast' },
  { id: 'adire', name: 'Adire Royal Fabric', price: 1000, emoji: '👘', desc: 'Hand-dyed heritage honor' },
  { id: 'ikogosi', name: 'Ikogosi Warm Spring Mist', price: 2500, emoji: '♨️', desc: 'Warm & cold confluence aura' },
  { id: 'crown', name: 'Ekiti Alade Crown', price: 5000, emoji: '👑', desc: 'Supreme Land of Honour prestige' }
];

const INITIAL_STORIES = [
  {
    id: 'st1',
    user: 'Tunde Adeyemi',
    handle: '@tunde_eksu',
    campus: 'EKSU',
    verified: true,
    avatar: 'TA',
    gradient: 'from-blue-700 via-blue-600 to-indigo-800',
    caption: 'Late-afternoon React & Firebase hackathon prep at EKSU Satellite Hub! 🚀💻 #EkitiTech',
    town: 'Ado-Ekiti',
    time: '14m ago'
  },
  {
    id: 'st2',
    user: 'Dr. Chioma Okafor',
    handle: '@chioma_abuad',
    campus: 'ABUAD',
    verified: true,
    avatar: 'CO',
    gradient: 'from-sky-600 via-blue-700 to-slate-900',
    caption: 'ABUAD Multi-System Hospital clinical rotations done for today! Who is grabbing shawarma? 🩺✨',
    town: 'Ado-Ekiti',
    time: '42m ago'
  },
  {
    id: 'st3',
    user: 'Segun Falana Jr.',
    handle: '@segun_fuoye',
    campus: 'FUOYE',
    verified: true,
    avatar: 'SF',
    gradient: 'from-blue-800 via-indigo-700 to-sky-600',
    caption: 'Golden hour over Oye-Ekiti hills after Mechatronics lab 🌄⚙️',
    town: 'Oye-Ekiti',
    time: '1h ago'
  },
  {
    id: 'st4',
    user: 'Bisi Olatunji',
    handle: '@bisi_ikogosi',
    campus: 'Ekiti Resident',
    verified: true,
    avatar: 'BO',
    gradient: 'from-indigo-600 via-blue-700 to-cyan-700',
    caption: 'Tourists arriving at Ikogosi Warm Springs Resort this weekend! Tap to join our group tour ♨️🌴',
    town: 'Ikogosi',
    time: '3h ago'
  }
];

const INITIAL_POSTS = [
  {
    id: 'seed_1',
    author: 'Adewale Ogunleye',
    handle: '@wale_codes',
    campus: 'EKSU',
    verified: true,
    isPremium: true,
    town: 'Ado-Ekiti',
    time: '9 mins ago',
    createdAtMs: Date.now() - 540000,
    content:
      'Just deployed our student carpool & study-buddy matcher right on EKITI CONNECT! Big shoutout to developers building from Iworoko to Oye-Ekiti. Drop your tech stack below! 💙🇳🇬',
    likes: 64,
    comments: [
      { id: 'cm1', user: 'Funmi_ABUAD', text: 'Need a frontend partner for the Ekiti Tech Summit!' },
      { id: 'cm2', user: 'Kola_FUOYE', text: 'Next.js + Firebase developer checking in from Oye!' }
    ],
    reposts: 14,
    giftsReceived: [{ emoji: '🍲', count: 3 }, { emoji: '👑', count: 1 }],
    likedByMe: false
  },
  {
    id: 'seed_2',
    author: 'Zainab Balogun',
    handle: '@zainab_med',
    campus: 'ABUAD',
    verified: true,
    isPremium: true,
    town: 'Ado-Ekiti',
    time: '55 mins ago',
    createdAtMs: Date.now() - 3300000,
    content:
      'Nothing hits better than hot Pounded Yam & Efo Riro after a 6-hour pharmacology practical. Who is meeting up around Fajuyi Park this evening? 🍲✨',
    likes: 112,
    comments: [{ id: 'cm3', user: 'Dami_BOUESTI', text: 'Save a wrap for the Ikere squad!' }],
    reposts: 9,
    giftsReceived: [{ emoji: '🥥', count: 6 }],
    likedByMe: false
  },
  {
    id: 'seed_3',
    author: 'Kayode Aluko',
    handle: '@kay_bouesti',
    campus: 'BOUESTI',
    verified: true,
    isPremium: false,
    town: 'Ikere-Ekiti',
    time: '2 hours ago',
    createdAtMs: Date.now() - 7200000,
    content:
      'BOUESTI Inter-Faculty Debate Championship starts tomorrow at 10:00 AM! Join our live audio room before kickoff to cheer Faculty of Science 🎙️🔥',
    likes: 78,
    comments: [],
    reposts: 21,
    giftsReceived: [{ emoji: '👘', count: 2 }],
    likedByMe: false
  }
];

const DISCOVER_PROFILES = [
  {
    id: 'dp1',
    name: 'Moyosore Ajayi',
    handle: '@moyo_uiux',
    campus: 'EKSU',
    role: 'Computer Science • 400L',
    town: 'Ado-Ekiti',
    landmark: 'Fayose Market, Ado-Ekiti',
    distanceKm: 0.8,
    verified: true,
    isPremium: true,
    online: true,
    interests: ['Product Design', 'Tech Meetups', 'Afrobeats']
  },
  {
    id: 'dp2',
    name: 'Emmanuel Nwachukwu',
    handle: '@emma_law',
    campus: 'ABUAD',
    role: 'College of Law • 500L',
    town: 'Ado-Ekiti',
    landmark: 'Afe Babalola Way, Ado-Ekiti',
    distanceKm: 2.3,
    verified: true,
    isPremium: true,
    online: true,
    interests: ['Moot Court', 'Chess', 'Startups']
  },
  {
    id: 'dp3',
    name: 'Pelumi Adepoju',
    handle: '@pelumi_fuoye',
    campus: 'FUOYE',
    role: 'Mechatronics Eng. • 300L',
    town: 'Oye-Ekiti',
    landmark: 'FUOYE Phase II Gate',
    distanceKm: 28.4,
    verified: true,
    isPremium: false,
    online: true,
    interests: ['Robotics', 'Photography', 'Hiking']
  },
  {
    id: 'dp4',
    name: 'Titilayo Fashola',
    handle: '@titi_ikere',
    campus: 'BOUESTI',
    role: 'Mass Communication • 200L',
    town: 'Ikere-Ekiti',
    landmark: 'Oke-Osun, Ikere-Ekiti',
    distanceKm: 16.2,
    verified: true,
    isPremium: false,
    online: false,
    interests: ['Campus Radio', 'Fashion', 'Vlogging']
  },
  {
    id: 'dp5',
    name: 'Seyi Oladimeji',
    handle: '@seyi_ikogosi',
    campus: 'Ekiti Resident',
    role: 'Eco-Tourism & Resort Host',
    town: 'Ikogosi',
    landmark: 'Ikogosi Warm Springs',
    distanceKm: 34.0,
    verified: true,
    isPremium: true,
    online: true,
    interests: ['Nature Trails', 'Hospitality', 'Culture']
  },
  {
    id: 'dp6',
    name: 'Gbenga Daramola',
    handle: '@gbenga_ijero',
    campus: 'Ekiti Resident',
    role: 'AgriTech & Cocoa Exporter',
    town: 'Ijero',
    landmark: 'Ijero Central Market',
    distanceKm: 39.5,
    verified: false,
    isPremium: false,
    online: true,
    interests: ['AgriTech', 'Logistics', 'Football']
  },
  {
    id: 'dp7',
    name: 'Nurse Bukola Adebayo',
    handle: '@bukky_ido',
    campus: 'Ekiti Resident',
    role: 'FETHI Nursing Officer',
    town: 'Ido-Ekiti',
    landmark: 'Federal Teaching Hospital, Ido',
    distanceKm: 31.0,
    verified: true,
    isPremium: false,
    online: true,
    interests: ['Public Health', 'Baking', 'Books']
  }
];

const INITIAL_CHATS = [
  {
    id: 'grp_eksu',
    name: 'EKSU Tech & Dev Hub',
    type: 'group',
    campus: 'EKSU',
    members: 412,
    online: 63,
    avatar: '💻',
    lastMessage: 'Demo Day pitch deck submission closes tonight at 11:59 PM!',
    time: '2m',
    autoReplies: [
      'Tunde (Admin): Awesome! Drop your GitHub repo link in the pinned thread.',
      'Moyosore: Anyone at Iworoko junction heading to the ICT center?'
    ],
    messages: [
      { id: 'm1', sender: 'Tunde (Admin)', text: 'Welcome everyone joining from EKSU main & satellite campuses!', time: '10:12 AM', isMe: false },
      { id: 'm2', sender: 'Moyosore Ajayi', text: 'Who needs a UI/UX designer for the Ekiti Smart Mobility hackathon?', time: '10:15 AM', isMe: false },
      { id: 'm3', sender: 'You', text: 'I am available! Let us hop on a quick group voice call.', time: '10:17 AM', isMe: true }
    ]
  },
  {
    id: 'grp_abuad',
    name: 'ABUAD Medics & Health',
    type: 'group',
    campus: 'ABUAD',
    members: 285,
    online: 41,
    avatar: '🩺',
    lastMessage: 'Dr. Chioma uploaded Cardiology OSCE revision slides',
    time: '11m',
    autoReplies: [
      'Dr. Chioma: Good point! Meet at the simulation lab by 4 PM.',
      'Zainab: Thanks for sharing!'
    ],
    messages: [
      { id: 'm4', sender: 'Dr. Chioma', text: 'Evening clinical case discussion starts at 8:00 PM prompt.', time: '09:30 AM', isMe: false }
    ]
  },
  {
    id: 'grp_fuoye',
    name: 'FUOYE Freshers & Hostel Connect',
    type: 'group',
    campus: 'FUOYE',
    members: 530,
    online: 88,
    avatar: '🎓',
    lastMessage: 'Shuttle bus fare from Oye town to Phase 2 is still ₦200',
    time: '24m',
    autoReplies: [
      'Pelumi (300L): Yes, make sure you have your FUOYE ID card handy at the gate!'
    ],
    messages: [
      { id: 'm5', sender: 'Segun Falana Jr.', text: 'Welcome all newly admitted 100L students to Oye-Ekiti!', time: '08:45 AM', isMe: false }
    ]
  },
  {
    id: 'grp_ado',
    name: 'Ado-Ekiti Entrepreneurs',
    type: 'group',
    campus: 'Ekiti Resident',
    members: 640,
    online: 92,
    avatar: '🚀',
    lastMessage: 'Weekend pop-up market at Fajuyi Park has 4 booths left',
    time: '40m',
    autoReplies: [
      'Bisi Olatunji: DM me your brand flyer so we can feature it on Ekiti Stories!'
    ],
    messages: [
      { id: 'm6', sender: 'Bisi Olatunji', text: 'Supporting local Ekiti fashion, food & tech founders every Saturday.', time: '09:05 AM', isMe: false }
    ]
  },
  {
    id: 'dm_moyo',
    name: 'Moyosore Ajayi',
    type: 'dm',
    campus: 'EKSU',
    verified: true,
    online: true,
    avatar: 'MA',
    lastMessage: 'Thanks for the Fresh Palm Wine gift! 🙌',
    time: '5m',
    autoReplies: [
      'Haha I love EKITI CONNECT! Are we jumping on a quick video call to review the Figma prototype?',
      'Bet! See you at Ado-Ekiti hub later today 💙'
    ],
    messages: [
      { id: 'm7', sender: 'Moyosore Ajayi', text: 'Hey! Saw your update on the Ado-Ekiti feed. Are you attending the campus tech meetup?', time: '11:04 AM', isMe: false }
    ]
  }
];

// ============================================================================
// MAIN EKITI CONNECT APPLICATION
// ============================================================================
export default function App() {
  // Auth & User Profile State (Starts ready in browser, with option to test Guest/Sign-In screen)
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isEntered, setIsEntered] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: 'Damilola Ojo',
    handle: '@dami_ekiti',
    campus: 'EKSU',
    matricNo: 'EKSU/22/CSC/0419',
    verified: true,
    isPremium: false, // Toggleable Free vs EKITI CONNECT+ (₦1,500/mo)
    town: 'Ado-Ekiti',
    walletNaira: 15000
  });

  // Navigation & Active Modals
  const [activeNav, setActiveNav] = useState('feed'); // 'feed' | 'discover' | 'chats'
  const [toast, setToast] = useState(null);

  // Stories State
  const [stories, setStories] = useState(INITIAL_STORIES);
  const [viewingStory, setViewingStory] = useState(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [storyDraftText, setStoryDraftText] = useState('');

  // Social Feed State
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [postDraft, setPostDraft] = useState('');
  const [postTownTag, setPostTownTag] = useState('Ado-Ekiti');
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');

  // Virtual Gifts & Wallet Modals
  const [giftDrawerTarget, setGiftDrawerTarget] = useState(null); // { recipientName, postId?, chatId? }
  const [chosenGift, setChosenGift] = useState(VIRTUAL_GIFTS[0]);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(2000);

  // Student Verification & Premium Modals
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyInstitution, setVerifyInstitution] = useState('EKSU');
  const [verifyMatric, setVerifyMatric] = useState('EKSU/22/CSC/0419');
  const [verifyIdFile, setVerifyIdFile] = useState('');
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Discover Filter State
  const [selectedTown, setSelectedTown] = useState('all');
  const [selectedInstitution, setSelectedInstitution] = useState('ALL');
  const [discoverSearch, setDiscoverSearch] = useState('');

  // Chats & Calls State
  const [chats, setChats] = useState(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState('grp_eksu');
  const [messageInput, setMessageInput] = useState('');

  // Voice & Video Call Studio State
  const [callSession, setCallSession] = useState(null); // { peerName, mode: 'voice'|'video', isGroup: boolean }
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);

  // Android & Go-Live Guide Modal
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // ==========================================================================
  // FIREBASE AUTH & FIRESTORE REAL-TIME SYNC
  // ==========================================================================
  useEffect(() => {
    if (!auth) return;
    const connectAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.warn('Using instant browser guest state:', e.message);
      }
    };
    connectAuth();
    const unsub = onAuthStateChanged(auth, (u) => setFirebaseUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!db || !firebaseUser) return;
    const postsRef = collection(db, 'artifacts', appId, 'public', 'data', 'ekiti_connect_posts');
    const unsub = onSnapshot(
      postsRef,
      (snap) => {
        if (!snap.empty) {
          const cloudPosts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          cloudPosts.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
          setPosts((prev) => {
            const cloudIds = new Set(cloudPosts.map((p) => p.id));
            const fallbackSeed = INITIAL_POSTS.filter((p) => !cloudIds.has(p.id));
            return [...cloudPosts, ...fallbackSeed];
          });
        }
      },
      (err) => console.warn('Firestore sync standby:', err.message)
    );
    return () => unsub();
  }, [firebaseUser]);

  // Story Auto-Progress Bar Timer
  useEffect(() => {
    if (!viewingStory) {
      setStoryProgress(0);
      return;
    }
    setStoryProgress(0);
    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          setViewingStory(null);
          return 0;
        }
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [viewingStory]);

  // Active Call Duration Timer
  useEffect(() => {
    if (!callSession) {
      setCallDuration(0);
      return;
    }
    const timer = setInterval(() => setCallDuration((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [callSession]);

  // Toast Helper
  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3400);
  };

  const formatDuration = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ==========================================================================
  // CORE INTERACTIVE ACTIONS
  // ==========================================================================
  const handlePublishPost = async (e) => {
    e.preventDefault();
    if (!postDraft.trim()) return;

    const newPost = {
      author: userProfile.name,
      handle: userProfile.handle,
      campus: userProfile.campus,
      verified: userProfile.verified,
      isPremium: userProfile.isPremium,
      town: postTownTag,
      time: 'Just now',
      createdAtMs: Date.now(),
      content: postDraft.trim(),
      likes: 1,
      comments: [],
      reposts: 0,
      giftsReceived: [],
      likedByMe: true
    };

    setPostDraft('');

    if (db && firebaseUser) {
      try {
        await addDoc(
          collection(db, 'artifacts', appId, 'public', 'data', 'ekiti_connect_posts'),
          { ...newPost, createdAt: serverTimestamp() }
        );
        notify('Published live to Ekiti Feed! 🚀');
        return;
      } catch (err) {
        console.warn('Local fallback post:', err.message);
      }
    }

    setPosts([{ id: `post_${Date.now()}`, ...newPost }, ...posts]);
    notify('Posted to EKITI CONNECT feed! 💙');
  };

  const handleLikePost = async (postId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nextLiked = !p.likedByMe;
        return {
          ...p,
          likedByMe: nextLiked,
          likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1)
        };
      })
    );

    if (db && firebaseUser && !postId.startsWith('seed_') && !postId.startsWith('post_')) {
      try {
        await updateDoc(
          doc(db, 'artifacts', appId, 'public', 'data', 'ekiti_connect_posts', postId),
          { likes: increment(1) }
        );
      } catch (e) {
        // Ignore if local item
      }
    }
  };

  const handleSubmitComment = (e) => {
    e.preventDefault();
    if (!commentText.trim() || !activeCommentPostId) return;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === activeCommentPostId
          ? {
              ...p,
              comments: [
                ...(p.comments || []),
                {
                  id: `c_${Date.now()}`,
                  user: userProfile.handle.replace('@', ''),
                  text: commentText.trim()
                }
              ]
            }
          : p
      )
    );
    setCommentText('');
    notify('Comment added!');
  };

  const handleSendGift = () => {
    if (!giftDrawerTarget || !chosenGift) return;
    if (userProfile.walletNaira < chosenGift.price) {
      setShowTopUpModal(true);
      notify('Insufficient Naira balance — Top up your wallet!');
      return;
    }

    setUserProfile((prev) => ({
      ...prev,
      walletNaira: prev.walletNaira - chosenGift.price
    }));

    // Update Post Gift Badge if sent on a post
    if (giftDrawerTarget.postId) {
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== giftDrawerTarget.postId) return p;
          const currentGifts = p.giftsReceived || [];
          const existingIdx = currentGifts.findIndex((g) => g.emoji === chosenGift.emoji);
          const updatedGifts =
            existingIdx >= 0
              ? currentGifts.map((g, idx) =>
                  idx === existingIdx ? { ...g, count: g.count + 1 } : g
                )
              : [...currentGifts, { emoji: chosenGift.emoji, count: 1 }];
          return { ...p, giftsReceived: updatedGifts };
        })
      );
    }

    // Add Gift Notification inside Chat if sent from chat
    if (giftDrawerTarget.chatId) {
      setChats((prev) =>
        prev.map((c) =>
          c.id === giftDrawerTarget.chatId
            ? {
                ...c,
                lastMessage: `Sent ${chosenGift.emoji} ${chosenGift.name} (₦${chosenGift.price.toLocaleString()})`,
                messages: [
                  ...c.messages,
                  {
                    id: `gift_msg_${Date.now()}`,
                    sender: 'You',
                    text: `🎁 Sent ${chosenGift.emoji} ${chosenGift.name} (₦${chosenGift.price.toLocaleString()})!`,
                    time: 'Now',
                    isMe: true
                  }
                ]
              }
            : c
        )
      );
    }

    notify(
      `Sent ${chosenGift.emoji} ${chosenGift.name} (₦${chosenGift.price.toLocaleString()}) to ${giftDrawerTarget.recipientName}!`
    );
    setGiftDrawerTarget(null);
  };

  const handlePublishStory = (e) => {
    e.preventDefault();
    if (!storyDraftText.trim()) return;
    const newStory = {
      id: `st_${Date.now()}`,
      user: userProfile.name,
      handle: userProfile.handle,
      campus: userProfile.campus,
      verified: userProfile.verified,
      avatar: userProfile.name.slice(0, 2).toUpperCase(),
      gradient: 'from-blue-600 via-sky-600 to-indigo-800',
      caption: storyDraftText.trim(),
      town: userProfile.town,
      time: 'Just now'
    };
    setStories([newStory, ...stories]);
    setStoryDraftText('');
    setShowStoryCreator(false);
    notify('Your 24h Campus Story is live! ✨');
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    const text = messageInput.trim();
    const targetChatId = activeChatId;
    const currentChat = chats.find((c) => c.id === targetChatId);

    setChats((prev) =>
      prev.map((c) =>
        c.id === targetChatId
          ? {
              ...c,
              lastMessage: text,
              time: 'Now',
              messages: [
                ...c.messages,
                {
                  id: `m_${Date.now()}`,
                  sender: 'You',
                  text,
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  isMe: true
                }
              ]
            }
          : c
      )
    );
    setMessageInput('');

    // Simulated instant peer reply in browser
    if (currentChat && currentChat.autoReplies?.length > 0) {
      setTimeout(() => {
        const replyPool = currentChat.autoReplies;
        const chosenReply = replyPool[Math.floor(Math.random() * replyPool.length)];
        const [senderLabel, ...rest] = chosenReply.includes(':')
          ? chosenReply.split(':')
          : [currentChat.name, chosenReply];
        const cleanBody = rest.length > 0 ? rest.join(':').trim() : senderLabel;
        const cleanSender = rest.length > 0 ? senderLabel : currentChat.name;

        setChats((prev) =>
          prev.map((c) =>
            c.id === targetChatId
              ? {
                  ...c,
                  lastMessage: cleanBody,
                  time: 'Just now',
                  messages: [
                    ...c.messages,
                    {
                      id: `reply_${Date.now()}`,
                      sender: cleanSender,
                      text: cleanBody,
                      time: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      }),
                      isMe: false
                    }
                  ]
                }
              : c
          )
        );
      }, 1100);
    }
  };

  const launchCallStudio = (peerName, mode, isGroup = false) => {
    setIsMicMuted(false);
    setIsCamOff(mode === 'voice');
    setIsSpeakerOn(true);
    setCallSession({ peerName, mode, isGroup });
  };

  const openChatWithUser = (personName, campusCode) => {
    const existing = chats.find((c) => c.name === personName);
    if (existing) {
      setActiveChatId(existing.id);
    } else {
      const newDmId = `dm_${Date.now()}`;
      const newDm = {
        id: newDmId,
        name: personName,
        type: 'dm',
        campus: campusCode,
        verified: true,
        online: true,
        avatar: personName.slice(0, 2).toUpperCase(),
        lastMessage: 'Connected via Ekiti Discovery!',
        time: 'Now',
        autoReplies: [
          `Hey ${userProfile.name.split(' ')[0]}! Great connecting with you on EKITI CONNECT 💙`,
          `Are you around ${userProfile.town} this week?`
        ],
        messages: [
          {
            id: `init_${Date.now()}`,
            sender: personName,
            text: `Hi ${userProfile.name.split(' ')[0]}! Saw your profile on EKITI CONNECT 👋`,
            time: 'Now',
            isMe: false
          }
        ]
      };
      setChats([newDm, ...chats]);
      setActiveChatId(newDmId);
    }
    setActiveNav('chats');
  };

  // Filtered Discover Profiles
  const visibleDiscoverProfiles = DISCOVER_PROFILES.filter((person) => {
    const townOk = selectedTown === 'all' || person.town === selectedTown;
    const instOk = selectedInstitution === 'ALL' || person.campus === selectedInstitution;
    const searchOk =
      person.name.toLowerCase().includes(discoverSearch.toLowerCase()) ||
      person.role.toLowerCase().includes(discoverSearch.toLowerCase()) ||
      person.landmark.toLowerCase().includes(discoverSearch.toLowerCase());
    // Free tier 35km radius limit vs Unlimited Ekiti-wide for CONNECT+
    const radiusOk = userProfile.isPremium || person.distanceKm <= 35;
    return townOk && instOk && searchOk && radiusOk;
  });

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const commentingPost = posts.find((p) => p.id === activeCommentPostId);

  // ==========================================================================
  // ONE-CLICK GUEST / SIGN-IN LANDING SCREEN (IF USER SIGNS OUT TO TEST)
  // ==========================================================================
  if (!isEntered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0052CC] via-[#1D4ED8] to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-[#0052CC] text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-blue-400/20 blur-2xl" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase mb-6">
                <MapPin className="w-3.5 h-3.5 text-amber-300" /> Ekiti State • Land of Honour
              </div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-3">
                EKITI CONNECT
              </h1>
              <p className="text-blue-100 text-sm leading-relaxed">
                Connect instantly with verified students at EKSU, ABUAD, FUOYE, BOUESTI, and entrepreneurs across Ado-Ekiti, Oye, Ikere, and Ikogosi.
              </p>
            </div>

            <div className="space-y-3 my-8 relative z-10">
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-sky-300 shrink-0" />
                <span className="text-xs font-semibold">
                  Verified Campus ID Badges & Study Groups
                </span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
                <Video className="w-5 h-5 text-sky-300 shrink-0" />
                <span className="text-xs font-semibold">
                  Crystal-Clear Voice & HD Video Calls
                </span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
                <Gift className="w-5 h-5 text-amber-300 shrink-0" />
                <span className="text-xs font-semibold">
                  Ekiti Cultural Virtual Gifts in Naira (₦)
                </span>
              </div>
            </div>

            <p className="text-[11px] text-blue-200">
              Browser Web App & Android APK/AAB Ready
            </p>
          </div>

          <div className="p-8 lg:p-10 flex flex-col justify-center space-y-5">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">Launch in Browser</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter immediately via One-Click Guest/Demo Mode or sign in with your Ekiti campus credentials.
              </p>
            </div>

            <button
              onClick={() => {
                setIsEntered(true);
                notify('Entered EKITI CONNECT via One-Click Demo Mode! 💙');
              }}
              className="w-full py-3.5 bg-[#0052CC] hover:bg-[#1D4ED8] text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              One-Click Instant Demo Entry
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase">
                Or customize profile
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsEntered(true);
                notify(`Welcome to EKITI CONNECT, ${userProfile.name}!`);
              }}
              className="space-y-3"
            >
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                placeholder="Your Full Name"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-[#0052CC]"
                required
              />
              <select
                value={userProfile.campus}
                onChange={(e) => setUserProfile({ ...userProfile, campus: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-white outline-none focus:border-[#0052CC]"
              >
                {EKITI_INSTITUTIONS.map((inst) => (
                  <option key={inst.code} value={inst.code}>
                    {inst.code} — {inst.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Sign In & Sync Firebase
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // MAIN BROWSER APPLICATION INTERFACE
  // ==========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Floating Toast Alert */}
      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-blue-500/40 flex items-center gap-2.5 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* ====================================================================
          DESKTOP LEFT SIDEBAR (ROYAL BLUE & PURE WHITE)
      ==================================================================== */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 z-30">
        {/* Logo & Ekiti Crest Pin */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0052CC] to-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-600/25 relative shrink-0">
            <MapPin className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white" />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight text-[#0052CC] leading-none">
              EKITI CONNECT
            </h1>
            <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">
              Land of Honour Hub
            </span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-1.5">
          {[
            { id: 'feed', label: 'Feed & Stories', icon: Home },
            { id: 'discover', label: 'Discover Ekiti', icon: Compass },
            { id: 'chats', label: 'Chats & Groups', icon: MessageCircle, badge: 5 }
          ].map((nav) => {
            const Icon = nav.icon;
            const isActive = activeNav === nav.id;
            return (
              <button
                key={nav.id}
                onClick={() => setActiveNav(nav.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-[#0052CC] text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-[#0052CC]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{nav.label}</span>
                </div>
                {nav.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-extrabold ${
                      isActive ? 'bg-white text-[#0052CC]' : 'bg-blue-100 text-[#0052CC]'
                    }`}
                  >
                    {nav.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-3 mt-3 border-t border-slate-100">
            <button
              onClick={() => setShowDeployModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-[#0052CC] transition cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-[#0052CC]" />
              <span>Get Android App / Deploy</span>
            </button>
          </div>
        </nav>

        {/* Live Tier Switcher Card (Free vs EKITI CONNECT+) */}
        <div className="p-4 mx-4 mb-3 rounded-2xl bg-gradient-to-br from-[#0052CC] via-[#1D4ED8] to-slate-900 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-300">
              <Crown className="w-3.5 h-3.5" />
              {userProfile.isPremium ? 'EKITI CONNECT+' : 'Free Tier Active'}
            </span>
            <button
              onClick={() =>
                setUserProfile((p) => ({ ...p, isPremium: !p.isPremium }))
              }
              className="text-[10px] font-bold bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-full cursor-pointer"
            >
              Switch
            </button>
          </div>
          <p className="text-xs text-blue-100 mb-3 leading-relaxed">
            {userProfile.isPremium
              ? '1080p HD Video Calls, Unlimited Ekiti Discovery & Gold Crown active.'
              : 'Upgrade to EKITI CONNECT+ (₦1,500/mo) for HD Calls & Unlimited Ekiti radius.'}
          </p>
          {!userProfile.isPremium && (
            <button
              onClick={() => setShowPremiumModal(true)}
              className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl transition cursor-pointer"
            >
              Upgrade (₦1,500/mo)
            </button>
          )}
        </div>

        {/* Bottom User Profile & Sign Out */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-[#0052CC] font-extrabold flex items-center justify-center text-xs shrink-0">
              {userProfile.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1">
                <p className="text-xs font-extrabold text-slate-900 truncate">
                  {userProfile.name}
                </p>
                {userProfile.verified && (
                  <ShieldCheck className="w-3.5 h-3.5 text-[#0052CC] shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">
                {userProfile.campus} • {userProfile.town}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEntered(false)}
            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition cursor-pointer"
            title="View Guest/Login Screen"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ====================================================================
          TOP NAVIGATION & CAMPUS HEADER (STICKY ACROSS DESKTOP & MOBILE)
      ==================================================================== */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
            {/* Mobile Brand Logo */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 rounded-xl bg-[#0052CC] text-white flex items-center justify-center relative">
                <MapPin className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border border-white" />
              </div>
              <span className="font-black text-sm text-[#0052CC] tracking-tight">
                EKITI CONNECT
              </span>
            </div>

            {/* Live Cloud Status Pill (Desktop) */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0052CC] text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {firebaseUser ? 'Firebase Real-Time Connected' : 'Ekiti Hub Live'}
              </span>
            </div>

            {/* Interactive Header Controls: Tier Toggle, Campus Badge, Naira Wallet, Android App */}
            <div className="flex items-center flex-wrap gap-2 ml-auto">
              {/* Quick Free vs CONNECT+ Toggle */}
              <button
                onClick={() =>
                  setUserProfile((p) => ({ ...p, isPremium: !p.isPremium }))
                }
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1 border transition cursor-pointer ${
                  userProfile.isPremium
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-blue-50'
                }`}
                title="Click to toggle Free vs EKITI CONNECT+ (₦1,500/mo)"
              >
                <Crown
                  className={`w-3.5 h-3.5 ${
                    userProfile.isPremium ? 'text-amber-500' : 'text-slate-400'
                  }`}
                />
                <span>{userProfile.isPremium ? 'CONNECT+' : 'Free Tier'}</span>
              </button>

              {/* Verified Campus Badge Trigger */}
              <button
                onClick={() => setShowVerifyModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0052CC] text-[11px] font-extrabold flex items-center gap-1 transition cursor-pointer"
                title="Verify Student ID / Matric Number"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{userProfile.campus}</span>
              </button>

              {/* Naira Wallet & Top Up Button */}
              <button
                onClick={() => setShowTopUpModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#0052CC] hover:bg-[#1D4ED8] text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                title="Top Up Naira Wallet"
              >
                <Wallet className="w-3.5 h-3.5 text-amber-300" />
                <span>₦{userProfile.walletNaira.toLocaleString()}</span>
                <span className="bg-white/20 px-1.5 py-0.2 rounded text-[10px]">+Top Up</span>
              </button>

              {/* Mobile Get Android / Deploy Button */}
              <button
                onClick={() => setShowDeployModal(true)}
                className="lg:hidden p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-[#0052CC]"
                title="Get Android App / Deploy"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ==================================================================
            MAIN VIEWPORT CONTAINER
        ================================================================== */}
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-5 pb-24 lg:pb-10">
          {/* ================================================================
              VIEW 1: FEED & STORIES
          ================================================================ */}
          {activeNav === 'feed' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left/Center Feed Column */}
              <div className="lg:col-span-2 space-y-5">
                {/* 24-Hour Campus Stories Bar */}
                <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      24-Hour Campus Stories
                    </h2>
                    <span className="text-[11px] font-bold text-[#0052CC]">
                      EKSU • ABUAD • FUOYE • BOUESTI
                    </span>
                  </div>
                  <div className="flex items-center gap-3.5 overflow-x-auto pb-1">
                    {/* Add Your Story */}
                    <button
                      onClick={() => setShowStoryCreator(true)}
                      className="flex flex-col items-center shrink-0 group cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-[#0052CC] bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center text-[#0052CC] transition">
                        <Plus className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700 mt-1.5">
                        Add Story
                      </span>
                    </button>

                    {/* Active Stories */}
                    {stories.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setViewingStory(st)}
                        className="flex flex-col items-center shrink-0 group cursor-pointer"
                      >
                        <div className="p-0.5 rounded-2xl bg-gradient-to-tr from-[#0052CC] via-sky-400 to-amber-400">
                          <div
                            className={`w-[60px] h-[60px] rounded-[14px] bg-gradient-to-br ${st.gradient} text-white font-extrabold text-sm flex items-center justify-center border-2 border-white`}
                          >
                            {st.avatar}
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 mt-1.5 max-w-[68px] truncate">
                          {st.user.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* Post Composer */}
                <form
                  onSubmit={handlePublishPost}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0052CC] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                      {userProfile.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <textarea
                        rows={2}
                        value={postDraft}
                        onChange={(e) => setPostDraft(e.target.value)}
                        placeholder={`Share campus news, study notes, or Ekiti updates as ${userProfile.name}...`}
                        className="w-full resize-none border-0 text-sm text-slate-800 placeholder-slate-400 outline-none"
                      />
                      <div className="pt-3 mt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-[#0052CC]" />
                            <select
                              value={postTownTag}
                              onChange={(e) => setPostTownTag(e.target.value)}
                              className="bg-transparent outline-none cursor-pointer"
                            >
                              {EKITI_TOWNS.filter((t) => t.id !== 'all').map((t) => (
                                <option key={t.id} value={t.name}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <span className="hidden sm:inline-flex items-center gap-1 bg-blue-50 text-[#0052CC] px-2.5 py-1 rounded-xl text-xs font-bold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {userProfile.campus}
                          </span>
                        </div>

                        <button
                          type="submit"
                          disabled={!postDraft.trim()}
                          className="px-4 py-2 bg-[#0052CC] hover:bg-[#1D4ED8] disabled:opacity-40 text-white text-xs font-extrabold rounded-xl shadow-xs transition cursor-pointer"
                        >
                          Post to Ekiti
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Live Social Feed */}
                <div className="space-y-4">
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-white border border-slate-200 hover:border-blue-200 rounded-2xl p-4 sm:p-5 shadow-xs transition"
                    >
                      {/* Post Header */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0052CC] to-indigo-700 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                            {post.author.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center flex-wrap gap-1.5">
                              <h3 className="font-extrabold text-sm text-slate-900">
                                {post.author}
                              </h3>
                              {post.verified && (
                                <ShieldCheck
                                  className="w-4 h-4 text-[#0052CC]"
                                  title="Verified Campus Badge"
                                />
                              )}
                              {post.isPremium && (
                                <Crown
                                  className="w-3.5 h-3.5 text-amber-500"
                                  title="EKITI CONNECT+ Member"
                                />
                              )}
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-[#0052CC]">
                                {post.campus}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {post.handle} • {post.town} • {post.time}
                            </p>
                          </div>
                        </div>

                        {/* Quick Call Trigger */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => launchCallStudio(post.author, 'voice')}
                            className="p-2 rounded-xl text-slate-400 hover:text-[#0052CC] hover:bg-blue-50 transition cursor-pointer"
                            title={`Voice Call ${post.author}`}
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => launchCallStudio(post.author, 'video')}
                            className="p-2 rounded-xl text-slate-400 hover:text-[#0052CC] hover:bg-blue-50 transition cursor-pointer"
                            title={`Video Call ${post.author}`}
                          >
                            <Video className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Post Content */}
                      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line mb-3">
                        {post.content}
                      </p>

                      {/* Animated Virtual Gift Badges */}
                      {post.giftsReceived && post.giftsReceived.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                          {post.giftsReceived.map((g, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 animate-pulse"
                            >
                              <span>{g.emoji}</span>
                              <span>×{g.count}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Post Action Footer */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                            post.likedByMe
                              ? 'bg-rose-50 text-rose-600'
                              : 'hover:bg-slate-100 hover:text-slate-800'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${post.likedByMe ? 'fill-rose-600' : ''}`}
                          />
                          <span>{post.likes}</span>
                        </button>

                        <button
                          onClick={() => setActiveCommentPostId(post.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>{(post.comments || []).length}</span>
                        </button>

                        <button
                          onClick={() => notify('Shared to your Ekiti timeline!')}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                        >
                          <Repeat2 className="w-4 h-4" />
                          <span>{post.reposts}</span>
                        </button>

                        <button
                          onClick={() =>
                            setGiftDrawerTarget({
                              recipientName: post.author,
                              postId: post.id
                            })
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0052CC] transition cursor-pointer"
                        >
                          <Gift className="w-4 h-4" />
                          <span>Gift</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Right Sidebar: Live Campus Voice Rooms & Cultural Gift Showcase */}
              <div className="space-y-5">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-[#0052CC]" />
                      Live Campus Rooms
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      On Air
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      {
                        title: 'EKSU Software & AI Club',
                        meta: '54 listening • Ado-Ekiti',
                        mode: 'voice'
                      },
                      {
                        title: 'ABUAD Clinical OSCE Prep',
                        meta: '28 on video • Ado-Ekiti',
                        mode: 'video'
                      },
                      {
                        title: 'FUOYE Freshers Welcome',
                        meta: '71 listening • Oye-Ekiti',
                        mode: 'voice'
                      }
                    ].map((room, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-2"
                      >
                        <div>
                          <p className="text-xs font-extrabold text-slate-900">{room.title}</p>
                          <p className="text-[11px] text-slate-500">{room.meta}</p>
                        </div>
                        <button
                          onClick={() => launchCallStudio(room.title, room.mode, true)}
                          className="px-3 py-1.5 bg-[#0052CC] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-xl cursor-pointer shrink-0"
                        >
                          Join
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ekiti Cultural Gifts Preview Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                  <h3 className="font-extrabold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    Ekiti Virtual Gifts
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">
                    Celebrate classmates & local creators with heritage gifts:
                  </p>
                  <div className="space-y-2">
                    {VIRTUAL_GIFTS.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50"
                      >
                        <span className="font-bold text-slate-800">
                          {g.emoji} {g.name}
                        </span>
                        <span className="font-extrabold text-[#0052CC]">
                          ₦{g.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              VIEW 2: DISCOVER (LOCATION-BASED EKITI HUB)
          ================================================================ */}
          {activeNav === 'discover' && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Discover Ekiti State Hubs
                    </h2>
                    <p className="text-xs text-slate-500">
                      Proximity-based discovery across Ado-Ekiti, Oye, Ikere, Ikogosi, Ijero & Ido-Ekiti
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-[#0052CC] text-xs font-extrabold">
                    <Compass className="w-4 h-4" />
                    <span>
                      {userProfile.isPremium
                        ? 'Unlimited Statewide Radar'
                        : '35 km Free Radar'}
                    </span>
                  </div>
                </div>

                {/* Town Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4">
                  {EKITI_TOWNS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTown(t.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                        selectedTown === t.id
                          ? 'bg-[#0052CC] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-[#0052CC]'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>

                {/* Search & Institution Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={discoverSearch}
                      onChange={(e) => setDiscoverSearch(e.target.value)}
                      placeholder="Search people, courses, or landmarks (e.g., Fayose Market, Law)..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#0052CC]"
                    />
                  </div>
                  <select
                    value={selectedInstitution}
                    onChange={(e) => setSelectedInstitution(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white outline-none focus:border-[#0052CC]"
                  >
                    <option value="ALL">All Institutions & Residents</option>
                    <option value="EKSU">EKSU</option>
                    <option value="ABUAD">ABUAD</option>
                    <option value="FUOYE">FUOYE</option>
                    <option value="BOUESTI">BOUESTI</option>
                    <option value="Ekiti Resident">Ekiti Resident</option>
                  </select>
                </div>
              </div>

              {/* Filtered People Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleDiscoverProfiles.map((person) => (
                  <div
                    key={person.id}
                    className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl p-4 shadow-xs transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0052CC] to-sky-500 text-white font-extrabold text-sm flex items-center justify-center">
                              {person.name.slice(0, 2).toUpperCase()}
                            </div>
                            {person.online && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <h3 className="font-extrabold text-sm text-slate-900">
                                {person.name}
                              </h3>
                              {person.verified && (
                                <ShieldCheck className="w-4 h-4 text-[#0052CC]" />
                              )}
                              {person.isPremium && (
                                <Crown className="w-3.5 h-3.5 text-amber-500" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{person.role}</p>
                          </div>
                        </div>
                      </div>

                      {/* Proximity Radar Badge */}
                      <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 mb-3">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#0052CC]">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {person.distanceKm} km away • {person.landmark}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                          {person.campus}
                        </span>
                        {person.interests.map((tag, i) => (
                          <span
                            key={i}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => openChatWithUser(person.name, person.campus)}
                        className="py-2 rounded-xl bg-[#0052CC] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Say Hi
                      </button>
                      <button
                        onClick={() => launchCallStudio(person.name, 'video')}
                        className="py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0052CC] text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Video
                      </button>
                      <button
                        onClick={() => launchCallStudio(person.name, 'voice')}
                        className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Voice
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Free Tier Radius Cap Banner */}
              {!userProfile.isPremium && (
                <div className="bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-amber-500 shrink-0" />
                    <p className="text-xs text-slate-800">
                      <strong>Free Tier Radar (35 km):</strong> Peers in farther Ekiti towns like Ijero-Ekiti (39.5 km) are hidden. Upgrade to{' '}
                      <strong className="text-[#0052CC]">EKITI CONNECT+</strong> for unlimited statewide discovery!
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPremiumModal(true)}
                    className="px-4 py-2 bg-[#0052CC] text-white text-xs font-extrabold rounded-xl shrink-0 cursor-pointer"
                  >
                    Unlock All Ekiti
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================================================================
              VIEW 3: CHATS & CAMPUS GROUPS
          ================================================================ */}
          {activeNav === 'chats' && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[550px]">
              {/* Left Conversation Pane */}
              <div className="border-r border-slate-200 flex flex-col">
                <div className="p-4 border-b border-slate-100">
                  <h2 className="font-extrabold text-base text-slate-900">
                    Campus Groups & DMs
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time Ekiti student & local channels
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {chats.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveChatId(c.id)}
                      className={`w-full p-3.5 text-left flex items-center gap-3 transition cursor-pointer ${
                        activeChatId === c.id ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-[#0052CC] text-white font-extrabold flex items-center justify-center text-base shrink-0">
                        {c.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-extrabold text-slate-900 truncate">
                            {c.name}
                          </p>
                          <span className="text-[10px] text-slate-400">{c.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {c.lastMessage}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-[#0052CC]">
                            {c.campus}
                          </span>
                          {c.type === 'group' && (
                            <span className="text-[10px] font-semibold text-emerald-600">
                              {c.online} online
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Active Message Stream */}
              <div className="md:col-span-2 flex flex-col bg-slate-50/60">
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0052CC] text-white font-extrabold flex items-center justify-center">
                      {activeChat.avatar}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">
                        {activeChat.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {activeChat.type === 'group'
                          ? `${activeChat.members} members • ${activeChat.online} active now`
                          : 'Verified Peer • Active now'}
                      </p>
                    </div>
                  </div>

                  {/* In-Chat Call & Virtual Gift Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        launchCallStudio(
                          activeChat.name,
                          'voice',
                          activeChat.type === 'group'
                        )
                      }
                      className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0052CC] transition cursor-pointer"
                      title="Voice Call"
                    >
                      <Phone className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        launchCallStudio(
                          activeChat.name,
                          'video',
                          activeChat.type === 'group'
                        )
                      }
                      className="p-2.5 rounded-xl bg-[#0052CC] hover:bg-[#1D4ED8] text-white transition cursor-pointer"
                      title="Video Call"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setGiftDrawerTarget({
                          recipientName: activeChat.name,
                          chatId: activeChat.id
                        })
                      }
                      className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition cursor-pointer"
                      title="Send Virtual Gift in Chat"
                    >
                      <Gift className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[370px]">
                  {activeChat.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-slate-400 mb-1 px-1">
                        {m.sender} • {m.time}
                      </span>
                      <div
                        className={`max-w-xs sm:max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                          m.isMe
                            ? 'bg-[#0052CC] text-white rounded-br-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Composer */}
                <form
                  onSubmit={handleSendChat}
                  className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={`Message ${activeChat.name}...`}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-xs outline-none focus:ring-2 focus:ring-[#0052CC]"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-[#0052CC] hover:bg-[#1D4ED8] text-white rounded-xl transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ====================================================================
          MOBILE BOTTOM NAVIGATION BAR
      ==================================================================== */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-30 flex items-center justify-around py-2">
        {[
          { id: 'feed', label: 'Feed', icon: Home },
          { id: 'discover', label: 'Discover', icon: Compass },
          { id: 'chats', label: 'Chats', icon: MessageCircle }
        ].map((item) => {
          const Icon = item.icon;
          const active = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl text-[11px] font-extrabold transition ${
                active ? 'text-[#0052CC]' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ====================================================================
          MODAL A: 24-HOUR STORY VIEWER WITH PROGRESS BAR
      ==================================================================== */}
      {viewingStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`max-w-sm w-full h-[530px] rounded-3xl bg-gradient-to-br ${viewingStory.gradient} text-white p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden`}
          >
            {/* Progress Bar */}
            <div>
              <div className="w-full h-1 bg-white/25 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{ width: `${storyProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-white/20 font-extrabold text-xs flex items-center justify-center">
                    {viewingStory.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-extrabold">{viewingStory.user}</p>
                      {viewingStory.verified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />
                      )}
                    </div>
                    <p className="text-[11px] text-blue-100">
                      {viewingStory.campus} • {viewingStory.town} • {viewingStory.time}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingStory(null)}
                  className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Story Body */}
            <div className="my-auto text-center px-3">
              <p className="text-xl font-extrabold leading-snug">{viewingStory.caption}</p>
            </div>

            {/* Story Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const targetName = viewingStory.user;
                  setViewingStory(null);
                  setGiftDrawerTarget({ recipientName: targetName });
                }}
                className="flex-1 py-3 rounded-2xl bg-white text-[#0052CC] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Gift className="w-4 h-4" />
                Send Virtual Gift
              </button>
              <button
                onClick={() => {
                  setViewingStory(null);
                  notify('Sent ❤️ reaction to story!');
                }}
                className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 cursor-pointer"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL B: ADD YOUR STORY CREATOR
      ==================================================================== */}
      {showStoryCreator && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-900">
                Create 24-Hour Story
              </h3>
              <button
                onClick={() => setShowStoryCreator(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePublishStory} className="space-y-4">
              <textarea
                rows={3}
                value={storyDraftText}
                onChange={(e) => setStoryDraftText(e.target.value)}
                placeholder="What's happening on campus or around Ekiti right now?"
                className="w-full p-3.5 rounded-2xl border border-slate-200 text-sm outline-none focus:border-[#0052CC]"
                required
              />
              <button
                type="submit"
                className="w-full py-3 bg-[#0052CC] hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Publish Story
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL C: COMMENTS DRAWER / MODAL
      ==================================================================== */}
      {commentingPost && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">
                Comments on {commentingPost.author}'s Post
              </h3>
              <button
                onClick={() => setActiveCommentPostId(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
              {(commentingPost.comments || []).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No comments yet. Start the conversation!
                </p>
              ) : (
                commentingPost.comments.map((c) => (
                  <div key={c.id} className="p-3 rounded-2xl bg-slate-50 text-xs">
                    <span className="font-extrabold text-[#0052CC] mr-1.5">
                      @{c.user}
                    </span>
                    <span className="text-slate-700">{c.text}</span>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSubmitComment} className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#0052CC]"
                required
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-[#0052CC] text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL D: EKITI VIRTUAL GIFTS DRAWER
      ==================================================================== */}
      {giftDrawerTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#0052CC]" />
                Send Ekiti Virtual Gift
              </h3>
              <button
                onClick={() => setGiftDrawerTarget(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              To <strong>{giftDrawerTarget.recipientName}</strong> • Wallet:{' '}
              <span className="font-extrabold text-[#0052CC]">
                ₦{userProfile.walletNaira.toLocaleString()}
              </span>
            </p>

            <div className="space-y-2 mb-5">
              {VIRTUAL_GIFTS.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => setChosenGift(gift)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition cursor-pointer ${
                    chosenGift.id === gift.id
                      ? 'border-[#0052CC] bg-blue-50'
                      : 'border-slate-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{gift.emoji}</span>
                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{gift.name}</p>
                      <p className="text-[11px] text-slate-500">{gift.desc}</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-[#0052CC]">
                    ₦{gift.price.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleSendGift}
              className="w-full py-3 bg-[#0052CC] hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              Send {chosenGift.emoji} {chosenGift.name} (₦{chosenGift.price.toLocaleString()})
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL E: WALLET TOP UP ₦ SIMULATOR
      ==================================================================== */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#0052CC]" />
                Top Up Naira Wallet
              </h3>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Instant simulated Paystack NGN (₦) wallet funding for testing Virtual Gifts & CONNECT+.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-2.5 rounded-xl text-xs font-extrabold border cursor-pointer ${
                    topUpAmount === amt
                      ? 'bg-blue-50 border-[#0052CC] text-[#0052CC]'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  +₦{amt.toLocaleString()}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setUserProfile((p) => ({
                  ...p,
                  walletNaira: p.walletNaira + topUpAmount
                }));
                setShowTopUpModal(false);
                notify(`Added ₦${topUpAmount.toLocaleString()} to your wallet! 💳`);
              }}
              className="w-full py-3 bg-[#0052CC] hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-xl cursor-pointer"
            >
              Confirm Top Up (+₦{topUpAmount.toLocaleString()})
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL F: STUDENT ID / MATRIC NUMBER VERIFICATION
      ==================================================================== */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#0052CC]" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Campus Badge Verification
                </h3>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Select your Ekiti institution or resident badge and verify your Matriculation Number.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setUserProfile((p) => ({
                  ...p,
                  campus: verifyInstitution,
                  matricNo: verifyMatric,
                  verified: true
                }));
                setShowVerifyModal(false);
                notify(`Verified ${verifyInstitution} badge activated! 🎓`);
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institution / Status
                </label>
                <select
                  value={verifyInstitution}
                  onChange={(e) => setVerifyInstitution(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  {EKITI_INSTITUTIONS.map((inst) => (
                    <option key={inst.code} value={inst.code}>
                      {inst.code} — {inst.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Matriculation Number / Ekiti ID
                </label>
                <input
                  type="text"
                  value={verifyMatric}
                  onChange={(e) => setVerifyMatric(e.target.value)}
                  placeholder="e.g., EKSU/22/CSC/0419"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  required
                />
              </div>
              <div>
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/50 text-xs font-bold text-[#0052CC] cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>{verifyIdFile || 'Upload Student ID Card (Optional in Demo)'}</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) =>
                      setVerifyIdFile(e.target.files?.[0]?.name || 'campus_id.png')
                    }
                  />
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-[#0052CC] hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-xl cursor-pointer"
              >
                Activate Verified Badge
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL G: EKITI CONNECT+ PREMIUM UPGRADE
      ==================================================================== */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-[#0052CC] to-indigo-900 p-6 text-white flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black mb-2">
                  <Crown className="w-3 h-3" /> EKITI CONNECT+
                </span>
                <h3 className="text-xl font-black">₦1,500 / month</h3>
                <p className="text-xs text-blue-100 mt-1">
                  Full Ekiti State Access & HD Video Studio
                </p>
              </div>
              <button
                onClick={() => setShowPremiumModal(false)}
                className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {[
                '1080p HD Video & Crystal Voice Calls',
                'Unlimited Ekiti-Wide Discovery Radius (All 16 LGAs)',
                'Gold Crown Profile Badge & 2× Feed Visibility',
                'Priority Access to Live Campus Study & Pitch Rooms'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#0052CC] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
              <button
                onClick={() => {
                  setUserProfile((p) => ({ ...p, isPremium: true }));
                  setShowPremiumModal(false);
                  notify('EKITI CONNECT+ Activated! 👑');
                }}
                className="w-full mt-3 py-3 bg-[#0052CC] hover:bg-[#1D4ED8] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/20 cursor-pointer"
              >
                Activate EKITI CONNECT+ Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL H: VOICE & VIDEO CALL STUDIO (WEBRTC SIMULATION)
      ==================================================================== */}
      {callSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/92 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-gradient-to-b from-[#0052CC] via-blue-950 to-slate-950 border border-blue-400/30 rounded-3xl p-6 text-white shadow-2xl flex flex-col justify-between min-h-[470px]">
            {/* Top Status & HD Quality Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-sky-200">
                  {callSession.mode === 'video' ? 'WebRTC Video Studio' : 'WebRTC Voice Call'}
                </span>
              </div>
              <span
                className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                  userProfile.isPremium
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-white/15 text-white'
                }`}
              >
                {userProfile.isPremium && <Crown className="w-3 h-3" />}
                {userProfile.isPremium ? '1080p HD Call' : 'Standard 480p'}
              </span>
            </div>

            {/* Center Avatar & Animated Audio Waveform */}
            <div className="my-6 flex flex-col items-center text-center relative">
              <div className="w-24 h-24 rounded-full bg-white/15 border-4 border-white/25 flex items-center justify-center text-3xl font-black shadow-xl mb-3">
                {callSession.peerName.slice(0, 2).toUpperCase()}
              </div>
              <h3 className="text-xl font-black">{callSession.peerName}</h3>
              <p className="text-sm font-mono text-sky-300 mt-1">
                {formatDuration(callDuration)}
              </p>

              {/* Animated Audio Waveform Bars */}
              <div className="flex items-center justify-center gap-1.5 h-8 mt-4">
                {[40, 85, 60, 100, 50, 90, 65, 45, 80, 55].map((heightPct, idx) => (
                  <span
                    key={idx}
                    className={`w-1.5 rounded-full bg-sky-300 transition-all duration-300 ${
                      isMicMuted ? 'h-1.5 opacity-30' : 'animate-pulse'
                    }`}
                    style={{
                      height: isMicMuted ? '6px' : `${Math.max(25, heightPct)}%`,
                      animationDelay: `${idx * 90}ms`
                    }}
                  />
                ))}
              </div>

              {/* Local Camera PIP Preview when Video is Active */}
              {!isCamOff && (
                <div className="mt-4 px-3 py-1.5 rounded-xl bg-black/40 border border-white/15 text-[11px] text-sky-200 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Local Camera Active ({userProfile.name})</span>
                </div>
              )}
            </div>

            {/* Call Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`p-3.5 rounded-2xl transition cursor-pointer ${
                  isMicMuted ? 'bg-rose-600 text-white' : 'bg-white/15 hover:bg-white/25'
                }`}
                title="Mute / Unmute"
              >
                {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsCamOff(!isCamOff)}
                className={`p-3.5 rounded-2xl transition cursor-pointer ${
                  isCamOff ? 'bg-rose-600 text-white' : 'bg-white/15 hover:bg-white/25'
                }`}
                title="Toggle Local Camera"
              >
                {isCamOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-3.5 rounded-2xl transition cursor-pointer ${
                  !isSpeakerOn ? 'bg-amber-500 text-slate-950' : 'bg-white/15 hover:bg-white/25'
                }`}
                title="Toggle Speaker"
              >
                {isSpeakerOn ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => {
                  const target = callSession.peerName;
                  setCallSession(null);
                  setGiftDrawerTarget({ recipientName: target });
                }}
                className="p-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 transition cursor-pointer"
                title="Send Virtual Gift During Call"
              >
                <Gift className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setCallSession(null);
                  notify('Call ended');
                }}
                className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white shadow-lg transition cursor-pointer"
                title="End Call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL I: ANDROID APP & GO-LIVE DEPLOYMENT GUIDE
      ==================================================================== */}
      {showDeployModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[88vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 text-[#0052CC]" />
                <h3 className="font-black text-base text-slate-900">
                  Get Android App & Go-Live Deployment Guide
                </h3>
              </div>
              <button
                onClick={() => setShowDeployModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
              {/* Scannable QR Preview SVG */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <svg
                  viewBox="0 0 100 100"
                  className="w-24 h-24 text-[#0052CC] mb-2"
                  fill="currentColor"
                >
                  <rect x="10" y="10" width="25" height="25" rx="4" />
                  <rect x="15" y="15" width="15" height="15" fill="white" />
                  <rect x="18" y="18" width="9" height="9" />
                  <rect x="65" y="10" width="25" height="25" rx="4" />
                  <rect x="70" y="15" width="15" height="15" fill="white" />
                  <rect x="73" y="18" width="9" height="9" />
                  <rect x="10" y="65" width="25" height="25" rx="4" />
                  <rect x="15" y="70" width="15" height="15" fill="white" />
                  <rect x="18" y="73" width="9" height="9" />
                  <rect x="44" y="14" width="12" height="12" rx="2" />
                  <rect x="44" y="44" width="12" height="12" rx="2" />
                  <rect x="65" y="45" width="10" height="10" rx="2" />
                  <rect x="80" y="65" width="10" height="25" rx="2" />
                  <rect x="44" y="72" width="25" height="10" rx="2" />
                </svg>
                <span className="text-[11px] font-extrabold text-[#0052CC]">
                  Scan for Android PWA
                </span>
                <span className="text-[10px] text-slate-500">
                  Chrome → "Add to Home Screen"
                </span>
              </div>

              <div className="sm:col-span-2 space-y-2.5 text-xs text-slate-700">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-extrabold text-slate-900 mb-1">
                    1. Instant Android PWA Install
                  </p>
                  <p className="text-slate-600">
                    Open your deployed URL in Chrome on Android, tap the menu (⋮), and choose{' '}
                    <strong>"Install App"</strong> for a full-screen native icon on your phone.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="font-extrabold text-slate-900 mb-1">
                    2. One-Click Web Hosting (Vercel / Netlify)
                  </p>
                  <p className="text-slate-600">
                    Push this Vite/React project to GitHub and import into Vercel or Netlify with automatic HTTPS for WebRTC Camera & Microphone permissions.
                  </p>
                </div>
              </div>
            </div>

            {/* Copyable CLI Commands */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-slate-800">
                  Wrap into Native Android APK / Play Store AAB (Capacitor CLI)
                </span>
                <button
                  onClick={() => {
                    const cmd = `npm install @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init "EKITI CONNECT" "ng.ekiticonnect.app" --web-dir=dist\nnpm run build && npx cap add android && npx cap sync android`;
                    navigator.clipboard?.writeText(cmd);
                    setCopiedCmd(true);
                    setTimeout(() => setCopiedCmd(false), 2500);
                    notify('CLI commands copied to clipboard!');
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[#0052CC] text-xs font-bold cursor-pointer"
                >
                  {copiedCmd ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCmd ? 'Copied' : 'Copy Commands'}</span>
                </button>
              </div>
              <pre className="bg-slate-900 text-sky-300 p-4 rounded-2xl text-[11px] overflow-x-auto leading-relaxed">
{`# 1. Deploy Web App to Vercel
npx vercel --prod

# 2. Wrap into Native Android Project with Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "EKITI CONNECT" "ng.ekiticonnect.app" --web-dir=dist
npm run build
npx cap add android
npx cap sync android`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
