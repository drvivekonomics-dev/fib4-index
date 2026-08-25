# FIB-4 — iOS & Android

Native Expo app for the FIB-4 liver fibrosis index. MASLD (age-adjusted) and viral hepatitis cut-offs, platelet units ×10⁹/L / μL / lakh, on-device history.

Labs never leave the phone.

## Run on a phone (Expo Go)

1. Install **Expo Go** from the App Store or Play Store.
2. In this folder: `npm install` then `npx expo start`.
3. Scan the QR code with Camera (iPhone) or Expo Go (Android).

## Store builds (TestFlight + Play)

Needs an [Expo](https://expo.dev) account, Apple Developer, and Google Play Console.

```sh
npm install
npx eas login
npx eas build:configure
npx eas build --platform ios --profile preview
npx eas build --platform android --profile preview
```

Production:

```sh
npx eas build --platform all --profile production
npx eas submit --platform ios
npx eas submit --platform android
```

- iOS bundle ID: `in.drraskar.fib4`
- Android package: `in.drraskar.fib4`

## Tabs

- **Calculate** — live FIB-4, share, save
- **History** — scores stored on device
- **Guide** — formula, use / do-not-use, all cut-offs, references
