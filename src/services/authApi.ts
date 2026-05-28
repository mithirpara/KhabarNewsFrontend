import { AUTH_API_BASE_URL } from '../config/api';

type LoginPayload = {
  email: string;
  password: string;
};

type SignupPayload = {
  email: string;
  password: string;
};

type ForgotPasswordPayload = {
  identifier: string;
  channel?: 'email' | 'sms';
};

type VerifyOtpPayload = {
  requestId: string;
  otp: string;
};

type ResendOtpPayload = {
  requestId: string;
  channel?: 'email' | 'sms';
};

type ResetPasswordPayload = {
  resetToken: string;
  newPassword: string;
};

async function readApiResponse(response: Response, fallbackMessage: string) {
  const responseText = await response.text();
  let data: any = {};

  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(`${fallbackMessage}. Please check API server URL.`);
  }

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
}

export async function loginUser(payload: LoginPayload) {
  const response = await fetch(`${AUTH_API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return readApiResponse(response, 'Login failed');
}

export async function signupUser(payload: SignupPayload) {
  const response = await fetch(`${AUTH_API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return readApiResponse(response, 'Sign up failed');
}

export async function requestPasswordReset(payload: ForgotPasswordPayload) {
  const response = await fetch(`${AUTH_API_BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return readApiResponse(response, 'Could not send OTP');
}

export async function verifyPasswordResetOtp(payload: VerifyOtpPayload) {
  const response = await fetch(`${AUTH_API_BASE_URL}/api/auth/forgot-password/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return readApiResponse(response, 'OTP verification failed');
}

export async function resendPasswordResetOtp(payload: ResendOtpPayload) {
  const response = await fetch(`${AUTH_API_BASE_URL}/api/auth/forgot-password/resend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return readApiResponse(response, 'Could not resend OTP');
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const response = await fetch(`${AUTH_API_BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return readApiResponse(response, 'Password reset failed');
}
