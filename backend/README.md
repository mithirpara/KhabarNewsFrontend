# KhabarNew API

Local API for login, signup, and forgot-password OTP flow.

## Run

```bash
cd backend
npm install
npm start
```

The React Native app is already configured to call `http://10.0.2.2:5001` on Android emulator and `http://localhost:5001` on iOS simulator.

## Forgot Password Endpoints

- `POST /api/auth/forgot-password`
- `POST /api/auth/forgot-password/verify`
- `POST /api/auth/forgot-password/resend`
- `POST /api/auth/reset-password`

## Email OTP Setup

Create `backend/.env` and add Gmail SMTP credentials:

```env
PORT=5001
RETURN_DEV_OTP=false
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_16_character_app_password
EMAIL_FROM=Khabar <yourgmail@gmail.com>
```

Use a Gmail App Password, not your normal Gmail password. In development, set `RETURN_DEV_OTP=true` only if you want the OTP returned in the API response.
