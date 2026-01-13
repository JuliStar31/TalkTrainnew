# TalkTrainer - React Native App

Aplikasi latihan berbicara dengan AI feedback, dibangun dengan React Native + Expo.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd talktrainer-native
npm install
```

### 2. Setup Supabase

Edit file `src/lib/supabase.ts` dan ganti credentials:

```typescript
const supabaseUrl = 'https://YOUR_PROJECT_ID.supabase.co';
const supabaseAnonKey = 'YOUR_ANON_KEY';
```

### 3. Run the App

```bash
npx expo start
```

Lalu:
- **Scan QR code** dengan app Expo Go di HP kamu
- Atau tekan `a` untuk Android emulator
- Atau tekan `i` untuk iOS simulator

## 📱 Requirements

- Node.js 18+
- Expo Go app di HP (untuk testing)
- Supabase project dengan schema yang sudah di-setup

## 📁 Project Structure

```
talktrainer-native/
├── App.tsx                 # Main entry point
├── src/
│   ├── lib/
│   │   ├── supabase.ts    # Supabase client
│   │   ├── auth.tsx       # Auth context
│   │   ├── database.ts    # Database functions
│   │   └── theme.ts       # Colors & styling
│   └── screens/
│       ├── AuthScreen.tsx
│       ├── DashboardScreen.tsx
│       ├── TrainingSessionScreen.tsx
│       └── FeedbackScreen.tsx
├── assets/                 # Images & icons
├── app.json               # Expo config
└── package.json
```

## 🎨 Features

- ✅ User authentication (Sign In / Sign Up)
- ✅ Dashboard with stats & charts
- ✅ Training session with recording
- ✅ AI feedback & tips
- ✅ Skills tracking
- ✅ Remember me feature

## 📦 Build APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
eas build -p android --profile preview
```

## 🔧 Troubleshooting

### Error: Unable to resolve module
```bash
npx expo start --clear
```

### Error: Network request failed
Pastikan Supabase credentials sudah benar di `src/lib/supabase.ts`
