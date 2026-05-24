# MORPH SUBSTRATE
## Expo SDK 54 | React Native 0.79

## ⚠️ CRITICAL: Clean Setup Steps

### 1. Create the project
```bash
npx create-expo-app@latest morph-substrate --template blank-typescript
```

### 2. Enter the folder
```bash
cd morph-substrate
```

### 3. DELETE these files if they exist (conflict with our App.tsx):
```bash
rm -f App.js index.js index.tsx
```

### 4. Unzip morph-substrate.zip into this folder
Replace all existing files.

### 5. Install dependencies
```bash
npm install
```

### 6. Start
```bash
npx expo start
```

## What the ZIP contains:
- `App.tsx` — The entire substrate app (ONLY App file needed)
- `package.json` — Dependencies
- `app.json` — Expo config
- `tsconfig.json` — TypeScript config
- `eas.json` — Build config

## Build APK:
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## Build IPA:
```bash
eas build --platform ios
```
