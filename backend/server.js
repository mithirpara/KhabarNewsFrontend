const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const cors = require('cors');
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT || 5001);
const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const appDataFile = path.join(dataDir, 'app-data.json');
const otpExpiresMinutes = Number(process.env.OTP_EXPIRES_MINUTES || 10);
const resetTokenExpiresMinutes = Number(process.env.RESET_TOKEN_EXPIRES_MINUTES || 10);
const returnDevOtp = String(process.env.RETURN_DEV_OTP || 'false') === 'true';
const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
const emailPort = Number(process.env.EMAIL_PORT || 465);
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailFrom = process.env.EMAIL_FROM || emailUser;

app.use(cors());
app.use(express.json());

async function ensureDataFile() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(usersFile);
  } catch {
    await fs.writeFile(usersFile, JSON.stringify({ users: [] }, null, 2));
  }
}

async function readUsers() {
  await ensureDataFile();
  const raw = await fs.readFile(usersFile, 'utf8');
  return JSON.parse(raw);
}

async function writeUsers(data) {
  await ensureDataFile();
  await fs.writeFile(usersFile, JSON.stringify(data, null, 2));
}

async function ensureAppDataFile() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(appDataFile);
  } catch {
    await fs.writeFile(
      appDataFile,
      JSON.stringify({ bookmarks: [], profiles: [], notifications: [], pushTokens: [] }, null, 2),
    );
  }
}

async function readAppData() {
  await ensureAppDataFile();
  const raw = await fs.readFile(appDataFile, 'utf8');
  return JSON.parse(raw);
}

async function writeAppData(data) {
  await ensureAppDataFile();
  await fs.writeFile(appDataFile, JSON.stringify(data, null, 2));
}

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function normalizeIdentifier(identifier = '') {
  return String(identifier).trim().toLowerCase();
}

function normalizeMobile(mobile = '') {
  return String(mobile).replace(/\D/g, '');
}

function hashValue(value, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(String(value), salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyHash(value, storedHash = '') {
  const [salt, hash] = storedHash.split(':');

  if (!salt || !hash) {
    return false;
  }

  const checkHash = hashValue(value, salt).split(':')[1];
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(checkHash));
}

function createOtp() {
  return String(crypto.randomInt(1000, 10000));
}

function createToken() {
  return crypto.randomBytes(32).toString('hex');
}

function publicUser(user) {
  return {
    userId: user.id,
    email: user.email,
    mobile: user.mobile || '',
    username: user.username || '',
    fullName: user.fullName || '',
  };
}

function findUserByIdentifier(users, identifier) {
  const normalized = normalizeIdentifier(identifier);
  const normalizedMobile = normalizeMobile(identifier);
  return users.find(
    user =>
      normalizeEmail(user.email) === normalized ||
      String(user.mobile || '').trim().toLowerCase() === normalized ||
      (normalizedMobile && normalizeMobile(user.mobile) === normalizedMobile),
  );
}

async function sendOtp(user, otp, channel) {
  if (channel === 'sms') {
    throw new Error('SMS OTP is not supported. Please use email.');
  }

  if (!emailUser || !emailPass) {
    throw new Error('Email credentials are missing in backend .env');
  }

  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  await transporter.sendMail({
    from: emailFrom,
    to: user.email,
    subject: 'Khabar password reset OTP',
    text: `Your Khabar password reset OTP is ${otp}. It expires in ${otpExpiresMinutes} minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">
        <h2 style="margin: 0 0 12px;">Khabar Password Reset</h2>
        <p>Your OTP is:</p>
        <p style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 16px 0;">${otp}</p>
        <p>This OTP expires in ${otpExpiresMinutes} minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });

  console.log(`[forgot-password] OTP for ${user.email}: ${otp}`);
}

function errorResponse(res, status, message) {
  return res.status(status).json({ success: false, message });
}

app.get('/health', (_req, res) => {
  res.json({ success: true, message: 'KhabarNew API is running' });
});

app.post('/api/auth/signup', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');
  const mobile = String(req.body.mobile || '').trim();

  if (!email || !password) {
    return errorResponse(res, 400, 'Email and password are required');
  }

  if (password.length < 6) {
    return errorResponse(res, 400, 'Password must be at least 6 characters long');
  }

  const data = await readUsers();

  if (data.users.some(user => normalizeEmail(user.email) === email)) {
    return errorResponse(res, 409, 'Account already exists');
  }

  const user = {
    id: crypto.randomUUID(),
    email,
    mobile,
    passwordHash: hashValue(password),
    createdAt: new Date().toISOString(),
    forgotPassword: null,
  };

  data.users.push(user);
  await writeUsers(data);

  return res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: publicUser(user),
  });
});

app.post('/api/auth/login', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || '');
  const data = await readUsers();
  const user = data.users.find(item => normalizeEmail(item.email) === email);

  if (!user || !verifyHash(password, user.passwordHash)) {
    return errorResponse(res, 401, 'Invalid email or password');
  }

  return res.json({
    success: true,
    message: 'Login successful',
    data: publicUser(user),
  });
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const identifier = normalizeIdentifier(req.body.identifier || req.body.email || req.body.mobile);
  const channel = req.body.channel === 'sms' ? 'sms' : 'email';

  if (!identifier) {
    return errorResponse(res, 400, 'Email or mobile number is required');
  }

  const data = await readUsers();
  const user = findUserByIdentifier(data.users, identifier);

  if (!user) {
    return errorResponse(res, 404, 'Account not found');
  }

  if (channel === 'sms' && !user.mobile) {
    return errorResponse(res, 400, 'Mobile number is not available for this account');
  }

  const otp = createOtp();
  const requestId = createToken();
  user.forgotPassword = {
    requestId,
    otpHash: hashValue(otp),
    otpExpiresAt: new Date(Date.now() + otpExpiresMinutes * 60 * 1000).toISOString(),
    resetTokenHash: null,
    resetTokenExpiresAt: null,
    verifiedAt: null,
  };

  try {
    await sendOtp(user, otp, channel);
  } catch (error) {
    return errorResponse(res, 502, error.message || 'Could not send OTP');
  }

  await writeUsers(data);

  return res.json({
    success: true,
    message: 'OTP sent successfully',
    data: {
      requestId,
      expiresInSeconds: otpExpiresMinutes * 60,
      destination: channel === 'sms' ? user.mobile : user.email,
      devOtp: returnDevOtp ? otp : undefined,
    },
  });
});

app.post('/api/auth/forgot-password/verify', async (req, res) => {
  const requestId = String(req.body.requestId || '').trim();
  const otp = String(req.body.otp || '').trim();

  if (!requestId || !otp) {
    return errorResponse(res, 400, 'Request ID and OTP are required');
  }

  const data = await readUsers();
  const user = data.users.find(item => item.forgotPassword?.requestId === requestId);
  const forgotPassword = user?.forgotPassword;

  if (!user || !forgotPassword) {
    return errorResponse(res, 404, 'OTP request not found');
  }

  if (Date.now() > new Date(forgotPassword.otpExpiresAt).getTime()) {
    return errorResponse(res, 410, 'OTP has expired');
  }

  if (!verifyHash(otp, forgotPassword.otpHash)) {
    return errorResponse(res, 400, 'Invalid OTP');
  }

  const resetToken = createToken();
  forgotPassword.verifiedAt = new Date().toISOString();
  forgotPassword.resetTokenHash = hashValue(resetToken);
  forgotPassword.resetTokenExpiresAt = new Date(
    Date.now() + resetTokenExpiresMinutes * 60 * 1000,
  ).toISOString();

  await writeUsers(data);

  return res.json({
    success: true,
    message: 'OTP verified successfully',
    data: {
      resetToken,
      expiresInSeconds: resetTokenExpiresMinutes * 60,
    },
  });
});

app.post('/api/auth/forgot-password/resend', async (req, res) => {
  const requestId = String(req.body.requestId || '').trim();
  const channel = req.body.channel === 'sms' ? 'sms' : 'email';

  if (!requestId) {
    return errorResponse(res, 400, 'Request ID is required');
  }

  const data = await readUsers();
  const user = data.users.find(item => item.forgotPassword?.requestId === requestId);

  if (!user || !user.forgotPassword) {
    return errorResponse(res, 404, 'OTP request not found');
  }

  if (channel === 'sms' && !user.mobile) {
    return errorResponse(res, 400, 'Mobile number is not available for this account');
  }

  const otp = createOtp();
  user.forgotPassword.otpHash = hashValue(otp);
  user.forgotPassword.otpExpiresAt = new Date(
    Date.now() + otpExpiresMinutes * 60 * 1000,
  ).toISOString();
  user.forgotPassword.resetTokenHash = null;
  user.forgotPassword.resetTokenExpiresAt = null;
  user.forgotPassword.verifiedAt = null;

  try {
    await sendOtp(user, otp, channel);
  } catch (error) {
    return errorResponse(res, 502, error.message || 'Could not resend OTP');
  }

  await writeUsers(data);

  return res.json({
    success: true,
    message: 'OTP resent successfully',
    data: {
      expiresInSeconds: otpExpiresMinutes * 60,
      destination: channel === 'sms' ? user.mobile : user.email,
      devOtp: returnDevOtp ? otp : undefined,
    },
  });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const resetToken = String(req.body.resetToken || '').trim();
  const newPassword = String(req.body.newPassword || req.body.password || '');

  if (!resetToken || !newPassword) {
    return errorResponse(res, 400, 'Reset token and new password are required');
  }

  if (newPassword.length < 6) {
    return errorResponse(res, 400, 'Password must be at least 6 characters long');
  }

  const data = await readUsers();
  const matchingUser = data.users.find(item => {
    const forgotPassword = item.forgotPassword;
    return forgotPassword?.resetTokenHash && verifyHash(resetToken, forgotPassword.resetTokenHash);
  });

  if (!matchingUser?.forgotPassword) {
    return errorResponse(res, 400, 'Invalid reset token');
  }

  if (Date.now() > new Date(matchingUser.forgotPassword.resetTokenExpiresAt).getTime()) {
    return errorResponse(res, 410, 'Reset token has expired');
  }

  matchingUser.passwordHash = hashValue(newPassword);
  matchingUser.forgotPassword = null;
  matchingUser.updatedAt = new Date().toISOString();

  await writeUsers(data);

  return res.json({
    success: true,
    message: 'Password reset successfully',
  });
});

const sourceLogos = {
  bbc: 'https://upload.wikimedia.org/wikipedia/commons/4/41/BBC_Logo_2021.svg',
  cnn: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg',
  reuters: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Reuters_Logo.svg',
};

const newsItems = [
  {
    id: 'news-1',
    articleId: 'news-1',
    category: 'Business',
    title: 'Markets open higher as technology and banking shares recover',
    description:
      'Global markets moved higher after investors reacted positively to new business earnings and stronger consumer demand.',
    source: 'BBC News',
    sourceId: 'bbc',
    time: '14m ago',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
    newsLogo: sourceLogos.bbc,
  },
  {
    id: 'news-2',
    articleId: 'news-2',
    category: 'Travel',
    title: 'Travel demand rises as families plan summer holidays',
    description:
      'Airlines and hotels are preparing for a busy season as travel bookings increase across major tourist destinations.',
    source: 'CNN',
    sourceId: 'cnn',
    time: '1h ago',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=80',
    newsLogo: sourceLogos.cnn,
  },
  {
    id: 'news-3',
    articleId: 'news-3',
    category: 'Politics',
    title: 'Leaders meet today to discuss public services and growth',
    description:
      'Senior leaders are expected to announce new policy measures focused on jobs, public services, and infrastructure.',
    source: 'Reuters',
    sourceId: 'reuters',
    time: '2h ago',
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1000&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1000&q=80',
    newsLogo: sourceLogos.reuters,
  },
  {
    id: 'news-4',
    articleId: 'news-4',
    category: 'Health',
    title: 'Simple daily habits that can improve long-term health',
    description:
      'Doctors say small routine changes, including sleep, walking, and balanced meals, can support better health outcomes.',
    source: 'Khabar Health',
    sourceId: 'khabar-health',
    time: '3h ago',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1000&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1000&q=80',
    newsLogo: sourceLogos.bbc,
  },
  {
    id: 'news-5',
    articleId: 'news-5',
    category: 'Sports',
    title: 'Young players shine in a high-scoring final match',
    description:
      'A dramatic final kept fans engaged until the final minutes as both teams delivered attacking football.',
    source: 'Sports Daily',
    sourceId: 'sports-daily',
    time: '4h ago',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80',
    newsLogo: sourceLogos.cnn,
  },
  {
    id: 'news-6',
    articleId: 'news-6',
    category: 'Technology',
    title: 'New AI tools are changing how small businesses work',
    description:
      'Small companies are adopting automation tools for customer support, marketing, and daily operations.',
    source: 'Tech Today',
    sourceId: 'tech-today',
    time: '5h ago',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
    newsLogo: sourceLogos.reuters,
  },
  {
    id: 'news-7',
    articleId: 'news-7',
    category: 'Money',
    title: 'Household savings rise as people cut unnecessary spending',
    description:
      'New data shows more households are saving money and reviewing subscriptions to manage monthly budgets.',
    source: 'Money Watch',
    sourceId: 'money-watch',
    time: '6h ago',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1000&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1000&q=80',
    newsLogo: sourceLogos.bbc,
  },
  {
    id: 'news-8',
    articleId: 'news-8',
    category: 'Life',
    title: 'Community groups organize weekend clean-up campaigns',
    description:
      'Local volunteers are working together to improve parks, streets, and public spaces in their neighborhoods.',
    source: 'Khabar News',
    sourceId: 'khabar-news',
    time: '8h ago',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1000&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1000&q=80',
    newsLogo: sourceLogos.cnn,
  },
];

const topics = [
  {
    id: 'topic-business',
    title: 'Business',
    description: 'Market updates, companies, and startup news',
    saved: false,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'topic-politics',
    title: 'Politics',
    description: 'Government, elections, and public policy',
    saved: false,
    image: 'https://images.unsplash.com/photo-1541872705-1f73c6400ec9?auto=format&fit=crop&w=600&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1541872705-1f73c6400ec9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'topic-tech',
    title: 'Technology',
    description: 'Apps, devices, AI, and digital culture',
    saved: false,
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'topic-sports',
    title: 'Sports',
    description: 'Scores, players, teams, and tournaments',
    saved: false,
    image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=600&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=600&q=80',
  },
];

const authors = [
  {
    id: 'bbc',
    name: 'BBC News',
    followers: '1.2M',
    following: '124K',
    isFollowing: false,
    newsCount: 1200,
    image: sourceLogos.bbc,
    newsLogo: sourceLogos.bbc,
    bio: 'BBC News covers global breaking news and current affairs.',
    website: 'https://www.bbc.com/news',
  },
  {
    id: 'cnn',
    name: 'CNN',
    followers: '959K',
    following: '102K',
    isFollowing: false,
    newsCount: 980,
    image: sourceLogos.cnn,
    newsLogo: sourceLogos.cnn,
    bio: 'CNN reports on international news, business, and culture.',
    website: 'https://www.cnn.com',
  },
  {
    id: 'reuters',
    name: 'Reuters',
    followers: '820K',
    following: '80K',
    isFollowing: false,
    newsCount: 875,
    image: sourceLogos.reuters,
    newsLogo: sourceLogos.reuters,
    bio: 'Reuters delivers reliable news from around the world.',
    website: 'https://www.reuters.com',
  },
];

function parseLimit(value, fallback = 10) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function includesQuery(value, query) {
  return String(value || '').toLowerCase().includes(query);
}

function filterNewsByQuery(query) {
  const normalizedQuery = String(query || '').trim().toLowerCase();

  if (!normalizedQuery) {
    return newsItems;
  }

  return newsItems.filter(
    item =>
      includesQuery(item.title, normalizedQuery) ||
      includesQuery(item.category, normalizedQuery) ||
      includesQuery(item.source, normalizedQuery) ||
      includesQuery(item.description, normalizedQuery),
  );
}

function filterBySourceOrAuthor(name) {
  const normalizedName = String(name || '').trim().toLowerCase();

  if (!normalizedName) {
    return newsItems;
  }

  return newsItems.filter(
    item =>
      includesQuery(item.sourceId, normalizedName) ||
      includesQuery(item.source, normalizedName),
  );
}

function withBookmarkFields(item) {
  return {
    ...item,
    bookmarkId: item.bookmarkId || item.articleId || item.id,
    image1: item.image1 || item.image || item.imageUrl,
    image2: item.image2 || item.newsLogo,
  };
}

app.get('/api/trending', (req, res) => {
  const limit = parseLimit(req.query.limit, 10);
  return res.json({ success: true, data: newsItems.slice(0, limit) });
});

app.get('/api/trending/:category', (req, res) => {
  const limit = parseLimit(req.query.limit, 10);
  const category = String(req.params.category || '').toLowerCase();
  const data = newsItems
    .filter(item => item.category.toLowerCase() === category)
    .slice(0, limit);

  return res.json({ success: true, data });
});

app.get('/api/search', (req, res) => {
  const limit = parseLimit(req.query.limit, 10);
  const query = String(req.query.q || '').trim().toLowerCase();
  const news = filterNewsByQuery(query).slice(0, limit);
  const topicResults = topics
    .filter(item => !query || includesQuery(item.title, query) || includesQuery(item.description, query))
    .slice(0, limit);
  const authorResults = authors
    .filter(item => !query || includesQuery(item.name, query) || includesQuery(item.bio, query))
    .slice(0, limit);

  return res.json({
    success: true,
    data: {
      news,
      topics: topicResults,
      author: authorResults,
    },
  });
});

app.get('/api/explore', (req, res) => {
  const limit = parseLimit(req.query.limit, 7);
  return res.json({
    success: true,
    data: {
      topics: topics.slice(0, limit),
      popularTopics: newsItems.slice(0, limit),
    },
  });
});

app.get('/api/news/details', (req, res) => {
  const articleId = String(req.query.id || '').trim();
  const article = newsItems.find(item => item.id === articleId || item.articleId === articleId);

  if (!article) {
    return errorResponse(res, 404, 'News article not found');
  }

  return res.json({ success: true, data: article });
});

app.get('/api/bookmarks', async (req, res) => {
  const data = await readAppData();
  const query = String(req.query.q || '').trim().toLowerCase();
  const bookmarks = (data.bookmarks || [])
    .map(withBookmarkFields)
    .filter(
      item =>
        !query ||
        includesQuery(item.title, query) ||
        includesQuery(item.category, query) ||
        includesQuery(item.source, query),
    );

  return res.json({ success: true, data: bookmarks });
});

app.post('/api/bookmarks', async (req, res) => {
  const data = await readAppData();
  const articleId = String(req.body.articleId || req.body.id || crypto.randomUUID());
  const existingIndex = (data.bookmarks || []).findIndex(
    item => String(item.articleId || item.id) === articleId,
  );
  const bookmark = withBookmarkFields({
    ...req.body,
    id: articleId,
    articleId,
    bookmarkId: `bookmark-${articleId}`,
    source: req.body.source || 'Khabar News',
    time: req.body.time || 'Just now',
    createdAt: new Date().toISOString(),
  });

  if (existingIndex >= 0) {
    data.bookmarks[existingIndex] = { ...data.bookmarks[existingIndex], ...bookmark };
  } else {
    data.bookmarks = [bookmark, ...(data.bookmarks || [])];
  }

  await writeAppData(data);
  return res.status(201).json({ success: true, message: 'Bookmark saved', data: bookmark });
});

app.post('/api/profile', async (req, res) => {
  const data = await readAppData();
  const userId = String(req.body.userId || '').trim();

  if (!userId) {
    return errorResponse(res, 400, 'User ID is required');
  }

  const profile = {
    userId,
    username: req.body.username || '',
    fullName: req.body.fullName || '',
    email: req.body.email || '',
    phoneNumber: req.body.phoneNumber || '',
    bio: req.body.bio || '',
    website: req.body.website || '',
    profileImage: req.body.profileImage || '',
    followers: req.body.followers || '0',
    following: req.body.following || '0',
    news: req.body.news || '0',
    updatedAt: new Date().toISOString(),
  };
  const index = (data.profiles || []).findIndex(item => item.userId === userId);

  if (index >= 0) {
    data.profiles[index] = { ...data.profiles[index], ...profile };
  } else {
    data.profiles = [...(data.profiles || []), profile];
  }

  await writeAppData(data);
  return res.json({ success: true, message: 'Profile saved', data: profile });
});

app.get('/api/profile/news', (req, res) => {
  return res.json({ success: true, data: newsItems.slice(0, 5) });
});

app.get('/api/profile/recent', (req, res) => {
  return res.json({ success: true, data: [...newsItems].reverse().slice(0, 5) });
});

app.get('/api/profile/:userId', async (req, res) => {
  const data = await readAppData();
  const profile = (data.profiles || []).find(item => item.userId === req.params.userId);

  if (!profile) {
    return errorResponse(res, 404, 'Profile not found');
  }

  return res.json({ success: true, data: profile });
});

app.get('/api/author/news', (req, res) => {
  const data = filterBySourceOrAuthor(req.query.name);
  return res.json({ success: true, data: data.length ? data : newsItems.slice(0, 5) });
});

app.get('/api/author/recent', (req, res) => {
  const data = filterBySourceOrAuthor(req.query.name);
  return res.json({ success: true, data: (data.length ? data : newsItems).slice().reverse().slice(0, 5) });
});

app.get('/api/notifications', async (req, res) => {
  const data = await readAppData();
  const limit = parseLimit(req.query.limit, 10);
  const defaultNotifications = [
    {
      id: 'notification-1',
      name: 'BBC News',
      message: 'has posted new business news "Markets open higher..."',
      time: '15m ago',
      createdAt: new Date().toISOString(),
      image: sourceLogos.bbc,
      follow: false,
      authorId: 'bbc',
    },
    {
      id: 'notification-2',
      name: 'CNN',
      message: 'has posted new travel news "Travel demand rises..."',
      time: '1h ago',
      createdAt: new Date().toISOString(),
      image: sourceLogos.cnn,
      follow: true,
      authorId: 'cnn',
    },
  ];
  const notifications = [...(data.notifications || []), ...defaultNotifications].slice(0, limit);

  return res.json({ success: true, data: notifications });
});

app.post('/api/notifications/register-token', async (req, res) => {
  const data = await readAppData();
  const userId = String(req.body.userId || '').trim();

  if (!userId) {
    return errorResponse(res, 400, 'User ID is required');
  }

  const tokenEntry = {
    userId,
    fcmToken: req.body.fcmToken || '',
    platform: req.body.platform || '',
    updatedAt: new Date().toISOString(),
  };
  const index = (data.pushTokens || []).findIndex(item => item.userId === userId);

  if (index >= 0) {
    data.pushTokens[index] = tokenEntry;
  } else {
    data.pushTokens = [...(data.pushTokens || []), tokenEntry];
  }

  await writeAppData(data);
  return res.json({ success: true, message: 'Token registered' });
});

app.post('/api/notifications/follow', async (req, res) => {
  const data = await readAppData();
  const followingId = String(req.body.followingId || '').trim();
  const author = authors.find(item => item.id === followingId) || {
    id: followingId,
    name: followingId || 'Author',
    image: '',
  };
  const notification = {
    id: crypto.randomUUID(),
    name: author.name,
    message: 'is now followed by a reader',
    time: 'Just now',
    createdAt: new Date().toISOString(),
    image: author.image || author.newsLogo || '',
    follow: false,
    authorId: author.id,
    followerId: req.body.followerId || '',
  };

  data.notifications = [notification, ...(data.notifications || [])];
  await writeAppData(data);

  return res.status(201).json({ success: true, message: 'Follow notification saved', data: notification });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(port, () => {
  console.log(`KhabarNew API running on http://localhost:${port}`);
});
