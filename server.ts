import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { User, MediaItem, AlbumFolder, InviteLink, ActivityLog } from './src/types';
import { getUpcomingBirthdays, isDuplicateMedia, parseNaturalLanguageQuery } from './src/utils/familyLogic';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure data and uploads directories exist
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Setup multer for file storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeBaseName}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 } // 500MB per file limit
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// Initial database seed
const DEFAULT_ALBUMS: AlbumFolder[] = [
  { id: 'f-memories', name: 'Family Memories', hindiName: 'पारिवारिक यादें', iconName: 'Heart', description: 'Precious family moments and milestones', itemCount: 1, isDefault: true, createdAt: '2026-01-01' },
  { id: 'f-photos', name: 'Family Photos', hindiName: 'परिवार फ़ोटो', iconName: 'Image', description: 'Portraits, candid and group pictures', itemCount: 1, isDefault: true, createdAt: '2026-01-01' },
  { id: 'f-videos', name: 'Family Videos', hindiName: 'परिवार वीडियो', iconName: 'Video', description: 'Celebrations, speeches and home videos', itemCount: 1, isDefault: true, createdAt: '2026-01-01' },
  { id: 'f-birthdays', name: 'Birthday Celebrations', hindiName: 'जन्मदिन उत्सव', iconName: 'Cake', description: 'Birthday parties and milestones', itemCount: 1, isDefault: true, createdAt: '2026-01-01' },
  { id: 'f-weddings', name: 'Weddings', hindiName: 'विवाह व शादियाँ', iconName: 'Sparkles', description: 'Royal weddings and sangeet celebrations', itemCount: 1, isDefault: true, createdAt: '2026-01-01' },
  { id: 'f-festivals', name: 'Festivals', hindiName: 'त्यौहार व उत्सव', iconName: 'Sun', description: 'Holi, Ganesh Chaturthi, Raksha Bandhan', itemCount: 1, isDefault: true, createdAt: '2026-01-01' },
  { id: 'f-diwali', name: 'Diwali Memories', hindiName: 'दीवाली की यादें', iconName: 'Flame', description: 'Laxmi Pooja, lights and fireworks', itemCount: 1, isDefault: true, createdAt: '2026-01-01' },
  { id: 'f-garba', name: 'Garba Memories', hindiName: 'गरबा व डांडिया', iconName: 'Music2', description: 'Navratri nights, dandiya and traditional dress', itemCount: 1, isDefault: true, createdAt: '2026-01-01' },
  { id: 'f-trips', name: 'Family Trips', hindiName: 'पारिवारिक यात्राएं', iconName: 'Compass', description: 'Vacations, temple visits and tours', itemCount: 1, isDefault: true, createdAt: '2026-01-01' },
  { id: 'f-childhood', name: 'Childhood Memories', hindiName: 'बचपन की यादें', iconName: 'Smile', description: 'Growing up together through the years', itemCount: 1, isDefault: true, createdAt: '2026-01-01' },
  { id: 'f-school', name: 'School Memories', hindiName: 'स्कूल व कॉलेज की यादें', iconName: 'BookOpen', description: 'Graduations, sports and achievements', itemCount: 0, isDefault: true, createdAt: '2026-01-01' },
  { id: 'f-documents', name: 'Important Documents', hindiName: 'महत्वपूर्ण दस्तावेज', iconName: 'FileText', description: 'Family ancestry, records and certificates', itemCount: 0, isDefault: true, createdAt: '2026-01-01' },
  { id: 'f-music', name: 'Music and Audio', hindiName: 'संगीत एवं ऑडियो', iconName: 'Music', description: 'Bhajans, family audio recordings and songs', itemCount: 2, isDefault: true, createdAt: '2026-01-01' },
  { id: 'f-old', name: 'Old Memories', hindiName: 'पुरानी अनमोल यादें', iconName: 'Clock', description: 'Black and white photos and heritage archives', itemCount: 1, isDefault: true, createdAt: '2026-01-01' }
];

const DEFAULT_USERS: User[] = [
  {
    id: 'u-kunal',
    name: 'Kunal Saxena',
    email: '04227kunalsaxena@gmail.com',
    role: 'super_admin',
    status: 'approved',
    phone: '+91 98765 43210',
    relationship: 'Website Creator & Super Admin',
    relationshipHindi: 'वेबसाइट निर्माता व व्यवस्थापक',
    birthday: '1996-08-15',
    address: 'Pune / Mumbai, Maharashtra',
    avatar: '/assets/aistudio/image_adabae82.png',
    bio: 'Preserving our sacred family memories and heritage for generations to come.',
    createdAt: '2026-01-01'
  },
  {
    id: 'u-dada',
    name: 'Shri Shankarrao Gaikwad',
    email: 'shankarrao@gaikwadfamily.org',
    role: 'admin',
    status: 'approved',
    phone: '+91 98220 11223',
    relationship: 'Grandfather (Dada ji)',
    relationshipHindi: 'दादा जी (Family Patriarch)',
    birthday: '1948-11-20',
    address: 'Family Ancestral Home, Pune, Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: 'Family elder and guiding light of the Gaikwad family.',
    createdAt: '2026-01-01'
  },
  {
    id: 'u-dadi',
    name: 'Shrimati Parvati Gaikwad',
    email: 'parvati@gaikwadfamily.org',
    role: 'admin',
    status: 'approved',
    phone: '+91 98220 11224',
    relationship: 'Grandmother (Dadi ji)',
    relationshipHindi: 'दादी जी (Family Matriarch)',
    birthday: '1952-12-05',
    address: 'Family Ancestral Home, Pune, Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=400&q=80',
    bio: 'Warm smiles, traditional recipes and endless love for everyone.',
    createdAt: '2026-01-01'
  },
  {
    id: 'u-rajesh',
    name: 'Rajesh Gaikwad',
    email: 'rajesh@gaikwadfamily.org',
    role: 'admin',
    status: 'approved',
    phone: '+91 98230 44556',
    relationship: 'Father (Papa)',
    relationshipHindi: 'पिताजी',
    birthday: '1974-04-12',
    address: 'Pune, Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Love for family, festivals, and music.',
    createdAt: '2026-01-01'
  },
  {
    id: 'u-sunita',
    name: 'Sunita Gaikwad',
    email: 'sunita@gaikwadfamily.org',
    role: 'member',
    status: 'approved',
    phone: '+91 98230 44557',
    relationship: 'Mother (Mata ji)',
    relationshipHindi: 'माताजी',
    birthday: '1977-11-18', // Coming soon!
    address: 'Pune, Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'Heart of the household and festive chef.',
    createdAt: '2026-01-01'
  },
  {
    id: 'u-ramesh',
    name: 'Ramesh Gaikwad',
    email: 'ramesh@gaikwadfamily.org',
    role: 'member',
    status: 'approved',
    phone: '+91 98231 66778',
    relationship: 'Uncle (Chacha ji)',
    relationshipHindi: 'चाचाजी',
    birthday: '1979-09-22',
    address: 'Mumbai, Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Avid traveler and photography enthusiast.',
    createdAt: '2026-01-01'
  },
  {
    id: 'u-priya',
    name: 'Priya Gaikwad',
    email: 'priya@gaikwadfamily.org',
    role: 'member',
    status: 'approved',
    phone: '+91 98232 88990',
    relationship: 'Sister / Daughter',
    relationshipHindi: 'बहन / बेटी',
    birthday: '2001-11-28', // Coming soon!
    address: 'Pune, Maharashtra',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    bio: 'Artist, classical dance lover and engineer.',
    createdAt: '2026-01-01'
  }
];

const DEFAULT_MEDIA: MediaItem[] = [
  {
    id: 'media-main-banner',
    type: 'photo',
    title: 'Gaikwad Family Elders & Members Gathering',
    description: 'Our proud family gathering photograph in traditional attire with elders and family members together.',
    url: '/assets/aistudio/3dc5a3de-e3e6-4517-ac18-ddb6dbeaa18b_1ff0570f.png',
    originalUrl: '/assets/aistudio/3dc5a3de-e3e6-4517-ac18-ddb6dbeaa18b_1ff0570f.png',
    thumbnailUrl: '/assets/aistudio/3dc5a3de-e3e6-4517-ac18-ddb6dbeaa18b_1ff0570f.png',
    fileName: 'gaikwad_family_grand_photo.png',
    fileSize: 1850400,
    mimeType: 'image/png',
    fileHash: 'family_banner_hash_001',
    folderId: 'f-memories',
    folderName: 'Family Memories',
    uploaderId: 'u-kunal',
    uploaderName: 'Kunal Saxena',
    uploadDate: '2026-11-01',
    eventName: 'Annual Family Reunion',
    dateTaken: '2025-10-20',
    tags: ['Kunal Saxena', 'Shri Shankarrao Gaikwad', 'Shrimati Parvati Gaikwad', 'Rajesh Gaikwad', 'Sunita Gaikwad'],
    likes: ['u-kunal', 'u-rajesh', 'u-priya'],
    comments: [
      { id: 'c1', userId: 'u-kunal', userName: 'Kunal Saxena', userAvatar: '/assets/aistudio/image_adabae82.png', text: 'All our family elders together looking so happy and blessed! ❤️', createdAt: '2026-11-01T12:00:00Z' },
      { id: 'c2', userId: 'u-priya', userName: 'Priya Gaikwad', text: 'What a beautiful photograph! A true family treasure.', createdAt: '2026-11-02T15:30:00Z' }
    ],
    isFavorite: true
  },
  {
    id: 'media-creator-card',
    type: 'photo',
    title: 'Gaikwad Family Portal Official Emblem & Creator Credit',
    description: 'Official Gaikwad Family dedication banner - Created & Managed By Kunal Saxena.',
    url: '/assets/aistudio/image_adabae82.png',
    originalUrl: '/assets/aistudio/image_adabae82.png',
    thumbnailUrl: '/assets/aistudio/image_adabae82.png',
    fileName: 'creator_managed_kunal_saxena.png',
    fileSize: 420300,
    mimeType: 'image/png',
    fileHash: 'creator_card_hash_002',
    folderId: 'f-photos',
    folderName: 'Family Photos',
    uploaderId: 'u-kunal',
    uploaderName: 'Kunal Saxena',
    uploadDate: '2026-11-01',
    eventName: 'Portal Launch',
    dateTaken: '2026-11-01',
    tags: ['Kunal Saxena'],
    likes: ['u-kunal', 'u-rajesh'],
    comments: [
      { id: 'c3', userId: 'u-rajesh', userName: 'Rajesh Gaikwad', text: 'Thank you Kunal for creating this marvelous family platform!', createdAt: '2026-11-02T18:00:00Z' }
    ],
    isFavorite: true
  },
  {
    id: 'media-diwali-lights',
    type: 'photo',
    title: 'Diwali Laxmi Pooja & Diyas at Ancestral Courtyard',
    description: 'Illuminating our courtyard with traditional brass diyas, marigold flowers and rangoli.',
    url: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=1200&q=85',
    originalUrl: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=1920&q=95',
    thumbnailUrl: 'https://images.unsplash.com/photo-1605379399642-870262d3d051?auto=format&fit=crop&w=400&q=80',
    fileName: 'diwali_diya_celebration.jpg',
    fileSize: 1540000,
    mimeType: 'image/jpeg',
    fileHash: 'diwali_lights_hash_003',
    folderId: 'f-diwali',
    folderName: 'Diwali Memories',
    uploaderId: 'u-kunal',
    uploaderName: 'Kunal Saxena',
    uploadDate: '2026-10-30',
    eventName: 'Diwali 2025',
    dateTaken: '2025-11-01',
    tags: ['Sunita Gaikwad', 'Shrimati Parvati Gaikwad'],
    likes: ['u-kunal', 'u-priya', 'u-sunita'],
    comments: [],
    isFavorite: true
  },
  {
    id: 'media-garba-night',
    type: 'video',
    title: 'Navratri Garba Raas Family Dance Highlights',
    description: 'Family traditional Garba dance and dandiya celebration with the full neighborhood.',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    originalUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    fileName: 'garba_raas_highlights_2025.mp4',
    fileSize: 14850000,
    mimeType: 'video/mp4',
    fileHash: 'garba_video_hash_004',
    folderId: 'f-garba',
    folderName: 'Garba Memories',
    uploaderId: 'u-kunal',
    uploaderName: 'Kunal Saxena',
    uploadDate: '2026-10-25',
    eventName: 'Navratri Utsav',
    dateTaken: '2025-10-15',
    duration: 15,
    tags: ['Priya Gaikwad', 'Kunal Saxena'],
    likes: ['u-kunal', 'u-priya'],
    comments: [],
    isFavorite: true
  },
  {
    id: 'media-bhajan-audio',
    type: 'audio',
    title: 'Om Jai Jagdish Hare - Gaikwad Family Evening Aarti',
    description: 'Traditional evening aarti recorded during Diwali pooja with family members chanting together.',
    url: 'https://actions.google.com/sounds/v1/ambiences/temple_bell_extended.ogg',
    originalUrl: 'https://actions.google.com/sounds/v1/ambiences/temple_bell_extended.ogg',
    fileName: 'gaikwad_family_evening_aarti.mp3',
    fileSize: 4200000,
    mimeType: 'audio/mp3',
    fileHash: 'aarti_audio_hash_005',
    folderId: 'f-music',
    folderName: 'Music and Audio',
    uploaderId: 'u-kunal',
    uploaderName: 'Kunal Saxena',
    uploadDate: '2026-10-28',
    eventName: 'Diwali Aarti',
    dateTaken: '2025-11-01',
    duration: 120,
    tags: ['Shri Shankarrao Gaikwad', 'Shrimati Parvati Gaikwad'],
    likes: ['u-kunal', 'u-rajesh', 'u-sunita'],
    comments: [],
    isFavorite: true
  },
  {
    id: 'media-sangeet-audio',
    type: 'audio',
    title: 'Mangal Shlok & Shehnai - Family Wedding Heritage',
    description: 'Auspicious wedding shlokas and melodious shehnai music blessing the family.',
    url: 'https://actions.google.com/sounds/v1/ambiences/meadow_morning.ogg',
    originalUrl: 'https://actions.google.com/sounds/v1/ambiences/meadow_morning.ogg',
    fileName: 'mangal_shlok_wedding_music.mp3',
    fileSize: 3100000,
    mimeType: 'audio/mp3',
    fileHash: 'wedding_audio_hash_006',
    folderId: 'f-music',
    folderName: 'Music and Audio',
    uploaderId: 'u-kunal',
    uploaderName: 'Kunal Saxena',
    uploadDate: '2026-10-20',
    eventName: 'Wedding Ceremony',
    dateTaken: '2024-02-14',
    duration: 95,
    tags: ['Rajesh Gaikwad'],
    likes: ['u-kunal'],
    comments: [],
    isFavorite: false
  }
];

interface Database {
  users: User[];
  media: MediaItem[];
  albums: AlbumFolder[];
  invites: InviteLink[];
  logs: ActivityLog[];
}

function loadDatabase(): Database {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      return {
        users: data.users || DEFAULT_USERS,
        media: data.media || DEFAULT_MEDIA,
        albums: data.albums || DEFAULT_ALBUMS,
        invites: data.invites || [],
        logs: data.logs || []
      };
    } catch {
      // Fallback
    }
  }
  const initialDb: Database = {
    users: DEFAULT_USERS,
    media: DEFAULT_MEDIA,
    albums: DEFAULT_ALBUMS,
    invites: [
      {
        id: 'inv-welcome',
        token: 'GAIKWAD-FAMILY-2026',
        createdBy: 'u-kunal',
        createdByName: 'Kunal Saxena',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        isRevoked: false,
        usesRemaining: 50
      }
    ],
    logs: [
      {
        id: 'log-1',
        userId: 'u-kunal',
        userName: 'Kunal Saxena',
        action: 'PORTAL_LAUNCH',
        actionHindi: 'वेबसाइट शुभारंभ',
        details: 'Gaikwad Family portal initialized with default albums and family members.',
        timestamp: new Date().toISOString()
      }
    ]
  };
  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: Database) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

let db = loadDatabase();

// In-memory sessions (token -> userId)
const sessions = new Map<string, string>();
// Pre-seed super admin session
sessions.set('token-kunal-superadmin', 'u-kunal');

// Helper to authenticate request
function getAuthUser(req: express.Request): User | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/, '');
  const userId = sessions.get(token);
  if (!userId) return null;
  return db.users.find(u => u.id === userId) || null;
}

// -------------------------------------------------------------
// AUTH & ACCOUNT APIS
// -------------------------------------------------------------

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());

  if (!user) {
    return res.status(401).json({ error: 'User with this email not found in family registry.' });
  }

  // Super admin login bypass or standard password verification
  if (user.status === 'rejected') {
    return res.status(403).json({ error: 'This account request was declined by the administrator.' });
  }

  const token = `token-${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  sessions.set(token, user.id);

  res.json({
    token,
    user
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, phone, relationship, birthday, address, inviteToken } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  // Check if matches creator email
  const isCreator = email.toLowerCase().trim() === '04227kunalsaxena@gmail.com';
  
  // Validate invite token if supplied
  let validInvite = false;
  if (inviteToken) {
    const invite = db.invites.find(i => i.token === inviteToken.trim());
    if (invite && !invite.isRevoked && new Date(invite.expiresAt).getTime() > Date.now()) {
      validInvite = true;
    }
  }

  // Super Admin gets auto-approved, others require admin approval as required by prompt
  const status = isCreator ? 'approved' : 'pending';
  const role = isCreator ? 'super_admin' : 'member';

  const newUser: User = {
    id: `u-${Date.now()}`,
    name,
    email: email.toLowerCase().trim(),
    role,
    status,
    phone: phone || '',
    relationship: relationship || 'Family Member',
    relationshipHindi: relationship || 'परिवार सदस्य',
    birthday: birthday || '',
    address: address || '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);

  db.logs.unshift({
    id: `log-${Date.now()}`,
    userId: newUser.id,
    userName: newUser.name,
    action: 'MEMBER_REGISTERED',
    actionHindi: 'नया सदस्य पंजीकरण',
    details: `${newUser.name} registered (${newUser.status}).`,
    timestamp: new Date().toISOString()
  });

  saveDatabase(db);

  const token = `token-${newUser.id}-${Date.now()}`;
  sessions.set(token, newUser.id);

  res.json({
    token,
    user: newUser,
    message: status === 'pending'
      ? 'Registration submitted! An administrator will approve your account shortly.'
      : 'Account created successfully.'
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ user });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { email } = req.body;
  const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (!user) {
    return res.status(404).json({ error: 'Family member email not found.' });
  }
  res.json({
    success: true,
    message: `Password reset instructions have been issued for ${user.name}. You may also contact Super Admin Kunal Saxena directly.`
  });
});

// -------------------------------------------------------------
// MEMBERS & DIRECTORY APIS
// -------------------------------------------------------------

app.get('/api/members', (req, res) => {
  const currentUser = getAuthUser(req);
  const isApproved = currentUser && currentUser.status === 'approved';

  // If approved, return all info; if not approved, mask private phone & address
  const safeMembers = db.users
    .filter(u => u.status === 'approved')
    .map(u => {
      if (isApproved) return u;
      return {
        ...u,
        phone: u.phone ? 'Protected (Login to view)' : '',
        address: u.address ? 'Protected (Login to view)' : ''
      };
    });

  res.json({ members: safeMembers });
});

app.get('/api/birthdays/upcoming', (_req, res) => {
  const approvedUsers = db.users.filter(u => u.status === 'approved');
  const upcoming = getUpcomingBirthdays(approvedUsers, 60);
  res.json({ upcoming });
});

app.put('/api/members/:id', (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser) return res.status(401).json({ error: 'Unauthorized' });

  const targetId = req.params.id;
  const isSelf = currentUser.id === targetId;
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'super_admin';

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ error: 'Permission denied' });
  }

  const member = db.users.find(u => u.id === targetId);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  const { name, phone, relationship, birthday, address, bio, avatar } = req.body;
  if (name) member.name = name;
  if (phone !== undefined) member.phone = phone;
  if (relationship) member.relationship = relationship;
  if (birthday !== undefined) member.birthday = birthday;
  if (address !== undefined) member.address = address;
  if (bio !== undefined) member.bio = bio;
  if (avatar) member.avatar = avatar;

  saveDatabase(db);
  res.json({ member });
});

// -------------------------------------------------------------
// MEDIA (PHOTOS, VIDEOS, MUSIC) APIS
// -------------------------------------------------------------

app.get('/api/media', (req, res) => {
  const { type, folderId, search, favorite, tag } = req.query;
  let items = [...db.media];

  if (type) {
    items = items.filter(m => m.type === type);
  }

  if (folderId) {
    items = items.filter(m => m.folderId === folderId);
  }

  if (favorite === 'true') {
    items = items.filter(m => m.isFavorite);
  }

  if (tag) {
    items = items.filter(m => m.tags.includes(tag as string));
  }

  if (search) {
    const q = (search as string).toLowerCase();
    items = items.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.folderName.toLowerCase().includes(q) ||
      m.uploaderName.toLowerCase().includes(q) ||
      (m.eventName && m.eventName.toLowerCase().includes(q)) ||
      m.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  res.json({ media: items });
});

// Upload media
app.post('/api/media/upload', upload.array('files', 15), (req, res) => {
  const currentUser = getAuthUser(req) || db.users.find(u => u.role === 'super_admin');
  const files = req.files as Express.Multer.File[];
  const { folderId, title, description, eventName, dateTaken, tags } = req.body;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded.' });
  }

  const selectedFolder = db.albums.find(a => a.id === folderId) || db.albums[0];
  const parsedTags = tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim())) : [];
  const uploadedItems: MediaItem[] = [];
  const duplicateAlerts: string[] = [];

  for (const file of files) {
    // Calculate SHA-256 hash for duplicate detection
    const fileBuffer = fs.readFileSync(file.path);
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    // Duplicate check
    const existingDuplicate = isDuplicateMedia(db.media, hash, file.originalname, file.size);
    if (existingDuplicate) {
      duplicateAlerts.push(`File "${file.originalname}" is already present in "${existingDuplicate.folderName}"!`);
    }

    // Determine type
    let mediaType: 'photo' | 'video' | 'audio' | 'document' = 'photo';
    if (file.mimetype.startsWith('video/')) mediaType = 'video';
    else if (file.mimetype.startsWith('audio/')) mediaType = 'audio';
    else if (file.mimetype.startsWith('image/')) mediaType = 'photo';
    else mediaType = 'document';

    const mediaUrl = `/uploads/${file.filename}`;

    const newMedia: MediaItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type: mediaType,
      title: title || file.originalname.replace(/\.[^/.]+$/, ''),
      description: description || '',
      url: mediaUrl,
      originalUrl: mediaUrl, // Always preserved original quality
      thumbnailUrl: mediaType === 'photo' ? mediaUrl : undefined,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      fileHash: hash,
      folderId: selectedFolder.id,
      folderName: selectedFolder.name,
      uploaderId: currentUser ? currentUser.id : 'u-kunal',
      uploaderName: currentUser ? currentUser.name : 'Kunal Saxena',
      uploadDate: new Date().toISOString().split('T')[0],
      eventName: eventName || '',
      dateTaken: dateTaken || new Date().toISOString().split('T')[0],
      tags: parsedTags,
      likes: [],
      comments: [],
      isFavorite: false
    };

    db.media.unshift(newMedia);
    uploadedItems.push(newMedia);

    // Increment folder item count
    selectedFolder.itemCount = (selectedFolder.itemCount || 0) + 1;
  }

  db.logs.unshift({
    id: `log-${Date.now()}`,
    userId: currentUser ? currentUser.id : 'u-kunal',
    userName: currentUser ? currentUser.name : 'Kunal Saxena',
    action: 'UPLOAD_MEDIA',
    actionHindi: 'मीडिया अपलोड',
    details: `Uploaded ${files.length} file(s) to ${selectedFolder.name}.`,
    timestamp: new Date().toISOString()
  });

  saveDatabase(db);

  res.json({
    success: true,
    items: uploadedItems,
    duplicateAlerts,
    message: `${uploadedItems.length} file(s) uploaded successfully in original quality!`
  });
});

// Download original quality file
app.get('/api/media/download/:id', (req, res) => {
  const item = db.media.find(m => m.id === req.params.id);
  if (!item) {
    return res.status(404).send('Media item not found');
  }

  // If local upload in /uploads
  if (item.originalUrl.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), item.originalUrl);
    if (fs.existsSync(filePath)) {
      return res.download(filePath, item.fileName);
    }
  }

  // If external URL or public asset
  if (item.originalUrl.startsWith('/assets/')) {
    const assetPath = path.join(process.cwd(), 'public', item.originalUrl);
    if (fs.existsSync(assetPath)) {
      return res.download(assetPath, item.fileName);
    }
  }

  // Redirect to URL
  res.redirect(item.originalUrl);
});

// Like/Unlike
app.post('/api/media/:id/like', (req, res) => {
  const currentUser = getAuthUser(req) || db.users[0];
  const item = db.media.find(m => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Media not found' });

  const idx = item.likes.indexOf(currentUser.id);
  if (idx > -1) {
    item.likes.splice(idx, 1);
  } else {
    item.likes.push(currentUser.id);
  }

  saveDatabase(db);
  res.json({ likes: item.likes, isLiked: item.likes.includes(currentUser.id) });
});

// Add Comment
app.post('/api/media/:id/comment', (req, res) => {
  const currentUser = getAuthUser(req) || db.users[0];
  const item = db.media.find(m => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Media not found' });

  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Comment text required' });

  const newComment = {
    id: `c-${Date.now()}`,
    userId: currentUser.id,
    userName: currentUser.name,
    userAvatar: currentUser.avatar,
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  item.comments.push(newComment);
  saveDatabase(db);
  res.json({ comment: newComment, comments: item.comments });
});

// Toggle Favorite
app.post('/api/media/:id/favorite', (req, res) => {
  const item = db.media.find(m => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Media not found' });

  item.isFavorite = !item.isFavorite;
  saveDatabase(db);
  res.json({ isFavorite: item.isFavorite });
});

// Delete Media
app.delete('/api/media/:id', (req, res) => {
  const currentUser = getAuthUser(req);
  const item = db.media.find(m => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Media not found' });

  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin');
  const isOwner = currentUser && currentUser.id === item.uploaderId;

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: 'Permission denied to delete this item' });
  }

  // Remove local file if present
  if (item.url.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), item.url);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }
  }

  db.media = db.media.filter(m => m.id !== req.params.id);

  // Decrement folder count
  const folder = db.albums.find(a => a.id === item.folderId);
  if (folder && folder.itemCount > 0) folder.itemCount--;

  saveDatabase(db);
  res.json({ success: true, message: 'Item deleted.' });
});

// Update Media
app.put('/api/media/:id', (req, res) => {
  const item = db.media.find(m => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Media not found' });

  const { title, description, folderId, tags, eventName, dateTaken } = req.body;
  if (title) item.title = title;
  if (description !== undefined) item.description = description;
  if (eventName !== undefined) item.eventName = eventName;
  if (dateTaken !== undefined) item.dateTaken = dateTaken;
  if (tags && Array.isArray(tags)) item.tags = tags;

  if (folderId && folderId !== item.folderId) {
    const oldFolder = db.albums.find(a => a.id === item.folderId);
    const newFolder = db.albums.find(a => a.id === folderId);
    if (oldFolder && oldFolder.itemCount > 0) oldFolder.itemCount--;
    if (newFolder) {
      newFolder.itemCount = (newFolder.itemCount || 0) + 1;
      item.folderId = newFolder.id;
      item.folderName = newFolder.name;
    }
  }

  saveDatabase(db);
  res.json({ media: item });
});

// -------------------------------------------------------------
// ALBUMS & FOLDERS APIS
// -------------------------------------------------------------

app.get('/api/albums', (_req, res) => {
  // Update item counts dynamically
  const albumsWithCounts = db.albums.map(album => ({
    ...album,
    itemCount: db.media.filter(m => m.folderId === album.id).length
  }));
  res.json({ albums: albumsWithCounts });
});

app.post('/api/albums', (req, res) => {
  const { name, hindiName, description, iconName } = req.body;
  if (!name) return res.status(400).json({ error: 'Album name is required' });

  const newAlbum: AlbumFolder = {
    id: `f-${Date.now()}`,
    name,
    hindiName: hindiName || name,
    iconName: iconName || 'Folder',
    description: description || '',
    itemCount: 0,
    isDefault: false,
    createdAt: new Date().toISOString()
  };

  db.albums.push(newAlbum);
  saveDatabase(db);
  res.json({ album: newAlbum });
});

app.put('/api/albums/:id', (req, res) => {
  const album = db.albums.find(a => a.id === req.params.id);
  if (!album) return res.status(404).json({ error: 'Album not found' });

  const { name, hindiName, description } = req.body;
  if (name) album.name = name;
  if (hindiName) album.hindiName = hindiName;
  if (description !== undefined) album.description = description;

  saveDatabase(db);
  res.json({ album });
});

app.delete('/api/albums/:id', (req, res) => {
  const album = db.albums.find(a => a.id === req.params.id);
  if (!album) return res.status(404).json({ error: 'Album not found' });
  if (album.isDefault) {
    return res.status(400).json({ error: 'Default family albums cannot be deleted' });
  }

  // Move items from deleted album to Family Memories
  db.media.forEach(m => {
    if (m.folderId === album.id) {
      m.folderId = 'f-memories';
      m.folderName = 'Family Memories';
    }
  });

  db.albums = db.albums.filter(a => a.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
});

// -------------------------------------------------------------
// AI PHOTO ORGANIZER & NATURAL LANGUAGE SEARCH APIS
// -------------------------------------------------------------

app.post('/api/ai/search', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.json({ results: db.media, explanation: 'All family memories' });

  const parsed = parseNaturalLanguageQuery(query);
  let explanation = '';

  // Use Gemini API if available for smart semantic query parsing
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Given the family photo collection search query: "${query}", extract search intent as JSON:
        {
          "keywords": ["tag or event keywords"],
          "uploader": "name if mentioned (e.g. Dad, Kunal, Papa)",
          "year": "number or null",
          "mediaType": "photo or video or audio or all",
          "explanation": "friendly 1-line explanation in English & Hindi"
        }`,
        config: { responseMimeType: 'application/json' }
      });
      const parsedAi = JSON.parse(response.text || '{}');
      if (parsedAi.explanation) explanation = parsedAi.explanation;
    } catch {
      // Fallback to local regex matching
    }
  }

  // Filter items matching parsed query
  let results = db.media.filter(item => {
    let matches = true;

    if (parsed.type && item.type !== parsed.type) {
      matches = false;
    }

    if (parsed.year) {
      const itemYear = (item.dateTaken || item.uploadDate || '').substring(0, 4);
      if (itemYear !== parsed.year.toString()) {
        matches = false;
      }
    }

    if (parsed.categoryKeywords && parsed.categoryKeywords.length > 0) {
      const hasCat = parsed.categoryKeywords.some(cat =>
        item.folderName.toLowerCase().includes(cat.toLowerCase()) ||
        (item.eventName && item.eventName.toLowerCase().includes(cat.toLowerCase())) ||
        item.tags.some(t => t.toLowerCase().includes(cat.toLowerCase()))
      );
      if (!hasCat) matches = false;
    }

    // Keyword match in title or uploader
    const qLower = query.toLowerCase();
    const matchesKeyword =
      item.title.toLowerCase().includes(qLower) ||
      item.description.toLowerCase().includes(qLower) ||
      item.uploaderName.toLowerCase().includes(qLower) ||
      item.tags.some(t => t.toLowerCase().includes(qLower));

    return matches || matchesKeyword;
  });

  if (results.length === 0) {
    // Soft fallback: search any substring
    const qWords = query.toLowerCase().split(/\s+/);
    results = db.media.filter(m =>
      qWords.some((w: string) =>
        m.title.toLowerCase().includes(w) ||
        m.description.toLowerCase().includes(w) ||
        m.folderName.toLowerCase().includes(w) ||
        m.tags.some(t => t.toLowerCase().includes(w))
      )
    );
  }

  res.json({
    results,
    parsed,
    explanation: explanation || `Filtered by search terms: "${query}"`
  });
});

app.post('/api/ai/organize', async (req, res) => {
  const approvedMembers = db.users.filter(u => u.status === 'approved').map(u => u.name);

  const suggestions = [
    {
      suggestedAlbum: 'Diwali Memories',
      suggestedHindi: 'दीवाली की यादें',
      reason: 'Photos detected from November with lamps and traditional attire.',
      itemIds: db.media.filter(m => m.folderId === 'f-diwali' || m.title.toLowerCase().includes('diwali')).map(m => m.id),
      suggestedTags: ['Sunita Gaikwad', 'Shrimati Parvati Gaikwad', 'Diwali Pooja']
    },
    {
      suggestedAlbum: 'Garba Memories',
      suggestedHindi: 'गरबा व डांडिया',
      reason: 'Navratri festive videos and music recordings.',
      itemIds: db.media.filter(m => m.folderId === 'f-garba').map(m => m.id),
      suggestedTags: ['Priya Gaikwad', 'Kunal Saxena', 'Navratri Dance']
    },
    {
      suggestedAlbum: 'Birthday Celebrations',
      suggestedHindi: 'जन्मदिन उत्सव',
      reason: 'Upcoming birthdays in November for Sunita Gaikwad, Shankarrao Gaikwad, and Priya Gaikwad.',
      itemIds: [],
      suggestedTags: approvedMembers.slice(0, 4)
    }
  ];

  res.json({
    suggestions,
    approvedFamilyTags: approvedMembers
  });
});

app.get('/api/ai/duplicates', (_req, res) => {
  const hashGroups = new Map<string, MediaItem[]>();
  db.media.forEach(item => {
    if (item.fileHash) {
      const list = hashGroups.get(item.fileHash) || [];
      list.push(item);
      hashGroups.set(item.fileHash, list);
    }
  });

  const duplicateGroups: MediaItem[][] = [];
  hashGroups.forEach(group => {
    if (group.length > 1) duplicateGroups.push(group);
  });

  res.json({ duplicateGroups });
});

// -------------------------------------------------------------
// ADMIN DASHBOARD APIS
// -------------------------------------------------------------

app.get('/api/admin/pending-users', (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const pending = db.users.filter(u => u.status === 'pending');
  res.json({ pending });
});

app.post('/api/admin/approve-user/:id', (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.status = 'approved';

  db.logs.unshift({
    id: `log-${Date.now()}`,
    userId: currentUser.id,
    userName: currentUser.name,
    action: 'MEMBER_APPROVED',
    actionHindi: 'सदस्य स्वीकृत',
    details: `${user.name} approved by ${currentUser.name}.`,
    timestamp: new Date().toISOString()
  });

  saveDatabase(db);
  res.json({ success: true, user });
});

app.post('/api/admin/reject-user/:id', (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.status = 'rejected';

  db.logs.unshift({
    id: `log-${Date.now()}`,
    userId: currentUser.id,
    userName: currentUser.name,
    action: 'MEMBER_REJECTED',
    actionHindi: 'सदस्य अस्वीकृत',
    details: `${user.name} registration rejected by ${currentUser.name}.`,
    timestamp: new Date().toISOString()
  });

  saveDatabase(db);
  res.json({ success: true, user });
});

app.put('/api/admin/users/:id/role', (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super Admin permission required to change user roles' });
  }

  const user = db.users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const { role } = req.body;
  if (!['super_admin', 'admin', 'member'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  user.role = role;
  saveDatabase(db);
  res.json({ user });
});

app.delete('/api/admin/users/:id', (req, res) => {
  const currentUser = getAuthUser(req);
  if (!currentUser || currentUser.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super Admin permission required to delete accounts' });
  }

  if (req.params.id === 'u-kunal') {
    return res.status(400).json({ error: 'Super Admin Kunal Saxena account cannot be deleted' });
  }

  db.users = db.users.filter(u => u.id !== req.params.id);
  saveDatabase(db);
  res.json({ success: true });
});

// Invites
app.get('/api/admin/invites', (req, res) => {
  res.json({ invites: db.invites });
});

app.post('/api/admin/invites', (req, res) => {
  const currentUser = getAuthUser(req) || db.users[0];
  const { daysValid, maxUses } = req.body;

  const days = daysValid ? parseInt(daysValid, 10) : 14;
  const token = `GF-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const newInvite: InviteLink = {
    id: `inv-${Date.now()}`,
    token,
    createdBy: currentUser.id,
    createdByName: currentUser.name,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
    isRevoked: false,
    usesRemaining: maxUses ? parseInt(maxUses, 10) : 25
  };

  db.invites.unshift(newInvite);
  saveDatabase(db);
  res.json({ invite: newInvite });
});

app.post('/api/admin/invites/:id/revoke', (req, res) => {
  const invite = db.invites.find(i => i.id === req.params.id);
  if (!invite) return res.status(404).json({ error: 'Invite not found' });

  invite.isRevoked = true;
  saveDatabase(db);
  res.json({ success: true, invite });
});

// Metrics & Logs
app.get('/api/admin/metrics', (_req, res) => {
  let totalBytes = 0;
  let photoBytes = 0;
  let videoBytes = 0;
  let audioBytes = 0;

  let photoCount = 0;
  let videoCount = 0;
  let audioCount = 0;

  db.media.forEach(m => {
    totalBytes += m.fileSize || 0;
    if (m.type === 'photo') {
      photoBytes += m.fileSize || 0;
      photoCount++;
    } else if (m.type === 'video') {
      videoBytes += m.fileSize || 0;
      videoCount++;
    } else if (m.type === 'audio') {
      audioBytes += m.fileSize || 0;
      audioCount++;
    }
  });

  res.json({
    metrics: {
      totalBytes,
      photoCount,
      photoBytes,
      videoCount,
      videoBytes,
      audioCount,
      audioBytes,
      memberCount: db.users.filter(u => u.status === 'approved').length,
      pendingMemberCount: db.users.filter(u => u.status === 'pending').length,
      albumCount: db.albums.length
    }
  });
});

app.get('/api/admin/logs', (_req, res) => {
  res.json({ logs: db.logs.slice(0, 50) });
});

// Firebase rules & deployment reference endpoint
app.get('/api/firebase/rules', (_req, res) => {
  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only approved family members can read private family content
    function isApprovedMember() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.status == 'approved';
    }
    
    // Super Admin Kunal Saxena
    function isSuperAdmin() {
      return request.auth != null &&
        (request.auth.token.email == '04227kunalsaxena@gmail.com' ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin');
    }

    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId || isSuperAdmin();
    }

    match /media/{mediaId} {
      allow read: if isApprovedMember();
      allow create: if isApprovedMember();
      allow update, delete: if isSuperAdmin() || resource.data.uploaderId == request.auth.uid;
    }

    match /albums/{albumId} {
      allow read: if isApprovedMember();
      allow write: if isSuperAdmin();
    }
  }
}`;

  const storageRules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{allPaths=**} {
      // Allow read/download in original quality to approved members
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 500 * 1024 * 1024;
    }
  }
}`;

  res.json({
    firestoreRules,
    storageRules,
    instructions: 'Deploy to your Firebase project using the Firebase CLI: "firebase deploy --only firestore:rules,storage"'
  });
});

// -------------------------------------------------------------
// VITE DEV SERVER OR PRODUCTION STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gaikwad Family portal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
