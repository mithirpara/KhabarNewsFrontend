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

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(port, () => {
  console.log(`KhabarNew API running on http://localhost:${port}`);
});
