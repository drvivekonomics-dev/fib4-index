# FIB-4 — iOS & Android

Native Expo app for the FIB-4 liver fibrosis index. MASLD (age-adjusted) and viral hepatitis cut-offs, platelet units ×10⁹/L / μL / lakh, on-device history, share as a clinical note.

Labs never leave the phone. No account. Not a diagnostic device.

## Run on a phone tonight (Expo Go)

1. Install **Expo Go** from the [App Store](https://apps.apple.com/app/expo-go/id982107779) or [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent).
2. In this folder:

```sh
npm install
npx expo start
```

3. Scan the QR code — Camera on iPhone, Expo Go on Android.

## Store builds (TestFlight + Play)

Needs an [Expo](https://expo.dev) account, Apple Developer ($99/yr), and Google Play Console.

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

Change those in `app.json` before the first store listing if you want a MetaHealth360 identifier instead.

Store listing copy lives in `STORE.md`. Privacy text lives in `PRIVACY.md` (host it, then paste the URL into App Store Connect / Play Console).

## Screens

- **Score** — live FIB-4, warnings, next step, share, save, optional initials
- **Saved** — on-device history; tap to reopen; delete one or clear all
- **Guide** — formula, use / do-not-use, all cut-offs, references
- **More** — default protocol and platelet unit, privacy, about

First launch is a clinical disclaimer. Defaults persist on the phone.

## Icons

`assets/icon.png` should be 1024×1024. If missing after clone:

```sh
python3 scripts/make-icon.py
```
