# FIB-4 METAHEALTH360 — iOS & Android

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

## Submit to App Store + Play Store

You need:

1. [Apple Developer Program](https://developer.apple.com/programs/) — $99 / year
2. [Google Play Console](https://play.google.com/console/) — $25 once
3. An [Expo](https://expo.dev/signup) account to build IPA / AAB

Listing copy, review notes, age rating, and Data safety answers: **STORE.md**. Privacy text: **PRIVACY.md** (host it, paste the URL in both consoles).

```sh
npm install
npx eas login
npx eas init
npx eas build --platform all --profile production
npx eas submit --platform ios
npx eas submit --platform android
```

- iOS bundle ID: `in.metahealth360.fib4`
- Android package: `in.metahealth360.fib4`
- Start Play on the **internal testing** track, then promote.

Store screenshots (1320×2868, 1080×1920, 2064×2752, feature 1024×500) are generated into the web app `public/store/` kit.

## TestFlight (iOS)

Use the **production** profile (App Store signing). Do not use preview — that is ad-hoc, not TestFlight.

1. Register bundle ID `in.metahealth360.fib4` on the **MetaHealth360** team.
2. Create the iOS app in App Store Connect with that bundle ID.
3. On a computer, in this folder:

```sh
npm install
npx eas login
npx eas init
npx testflight
```

`npx testflight` builds a store IPA and uploads it to App Store Connect. After ~10–15 minutes it appears under TestFlight → Internal Testing.

Or from [expo.dev](https://expo.dev): create project `fib4-index`, connect this GitHub repo, **Production** iOS build, then **Submit**.


- **Score** — live FIB-4, warnings, next step, share, save, optional initials
- **Saved** — on-device history; tap to reopen; delete one or clear all
- **Guide** — formula, use / do-not-use, all cut-offs, references
- **More** — default protocol and platelet unit, privacy, about

First launch is a clinical disclaimer. Defaults persist on the phone.
