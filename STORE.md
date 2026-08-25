# App Store / Play listing — FIB-4 METAHEALTH360

Paste these fields. Screenshots live in `store/` (iPhone 6.9″ 1320×2868, Play 1080×1920, iPad 13″ 2064×2752, feature graphic 1024×500).

## Identifiers

| Field | Value |
|---|---|
| Name | FIB-4 METAHEALTH360 |
| Home screen | FIB-4 |
| Bundle / package | `in.drraskar.fib4` |
| SKU | `fib4-metahealth360` |
| Version | 1.0.0 |
| Category | Medical · Reference |
| Price | Free |
| Age | 17+ |
| Copyright | © 2026 Dr Vivek Raskar / MetaHealth360 |
| Support email | dr.vivekonomics@gmail.com |
| Support URL | https://github.com/drvivekonomics-dev/fib4-index |
| Privacy | Host `/privacy` and paste that URL in both consoles |

## iOS subtitle (30)

Liver health · fibrosis index

## iOS promotional text (170)

Four routine labs. One FIB-4. MASLD and viral cut-offs, on this phone. Not a diagnostic device.

## Play short description (80)

FIB-4 liver fibrosis index — MASLD and viral hepatitis, on this phone.

## Keywords

FIB-4,liver,fibrosis,NAFLD,MASLD,hepatitis,AST,ALT,platelets,hepatology,diabetes,NAFLD score

## Full description

FIB-4 METAHEALTH360 estimates the likelihood of advanced liver fibrosis from four routine values: age, AST, ALT, and platelets.

Built for clinic use by MetaHealth360.

• MASLD / NAFLD cut-offs, age-adjusted at 65 (McPherson 2017)
• Viral hepatitis cut-offs (Sterling 2006)
• Platelet units: ×10⁹/L, /μL, and lakh/cmm
• Live score, next-step copy, and warnings
• Save scores on this phone, with optional initials
• Share a clinical note to your notes or EMR
• Formula, use / do-not-use, and references in the Guide

Labs never leave the device. No account. No tracking.

Decision support only. Not a diagnostic device. Does not replace clinical judgement, elastography, or biopsy.

Developer: Dr Vivek Raskar, MetaHealth360
Contact: dr.vivekonomics@gmail.com

## What’s New

Initial release.

• FIB-4 from age, AST, ALT, and platelets
• MASLD (age-adjusted) and viral hepatitis protocols
• Platelet units ×10⁹/L, /μL, lakh/cmm
• On-device saved scores and clinical-note share
• Guide with formula, cut-offs, and references

## App Review notes

FIB-4 METAHEALTH360 is a clinical calculator that implements the published FIB-4 formula (Sterling et al., Hepatology 2006) with MASLD age-adjusted cut-offs (McPherson et al., 2017).

It is decision-support / reference for licensed clinicians. It does not diagnose liver disease, does not recommend a drug or dose, does not connect to HealthKit, Google Fit, or any patient record, and does not send lab values off the device.

No account. No demo login. First launch requires acknowledgement of the medical disclaimer.

Please test: enter Age 58, AST 62 U/L, ALT 48 U/L, platelets 168 ×10⁹/L, protocol MASLD. Expected FIB-4 ≈ 3.09 (high). Switch protocol to Viral hepatitis to see Sterling cut-offs.

Support: dr.vivekonomics@gmail.com

## Age rating questionnaire

- Unrestricted web access — No
- Gambling — No
- Medical or treatment information — Yes
- Alcohol / tobacco / drugs / violence / sexual content — No
- Result: 17+

## Play Data safety

- Collects user data? **No**
- Health / personal / location / contacts / photos — not collected
- Analytics, ads, crash reporters — none
- Advertising ID — not used
- Medical device / SaMD? **No** (published-formula calculator)

## Build

Apple Developer ($99/yr) + Play Console ($25 once) + Expo account.

```sh
npx eas login
npx eas init
npx eas build --platform all --profile production
npx eas submit --platform ios
npx eas submit --platform android
```

Start Android on the **internal testing** track, then promote to production after a clean install on a phone.
