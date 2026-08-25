export type Protocol = "masld" | "hcv";
export type RiskLevel = "low" | "indeterminate" | "high";
export type PlateletUnit = "giga" | "per_ul" | "lakh";

export interface Fib4Labs {
  age: number;
  ast: number;
  alt: number;
  platelets: number;
  plateletUnit: PlateletUnit;
}

export interface Fib4Cutoffs {
  low: number;
  high: number;
  ageAdjusted: boolean;
}

export interface Fib4Interpretation {
  score: number;
  level: RiskLevel;
  label: string;
  summary: string;
  nextStep: string;
  cutoffs: Fib4Cutoffs;
  protocol: Protocol;
  warnings: string[];
}

export const PROTOCOL_LABEL: Record<Protocol, string> = {
  masld: "MASLD / NAFLD",
  hcv: "Viral hepatitis",
};

export const PLATELET_UNIT_LABEL: Record<PlateletUnit, string> = {
  giga: "×10⁹/L",
  per_ul: "/μL",
  lakh: "Lakh/cmm",
};

export const DISCLAIMER =
  "Decision support only. Not a diagnostic device. Does not replace clinical judgement, elastography, or biopsy.";

export const APP_VERSION = "1.0.0";

export function plateletsToGiga(value: number, unit: PlateletUnit): number {
  switch (unit) {
    case "giga":
      return value;
    case "per_ul":
      return value / 1000;
    case "lakh":
      return value * 100;
  }
}

export function convertPlatelets(
  value: number,
  from: PlateletUnit,
  to: PlateletUnit,
): number {
  const giga = plateletsToGiga(value, from);
  switch (to) {
    case "giga":
      return giga;
    case "per_ul":
      return giga * 1000;
    case "lakh":
      return giga / 100;
  }
}

export function formatPlatelets(value: number, unit: PlateletUnit): string {
  if (!Number.isFinite(value)) return "";
  if (unit === "lakh") {
    return trimFloat(value, 2);
  }
  if (unit === "per_ul") {
    return Math.round(value).toLocaleString("en-IN");
  }
  return trimFloat(value, 1);
}

export function calculateFib4(
  age: number,
  ast: number,
  alt: number,
  plateletsGiga: number,
): number {
  return (age * ast) / (plateletsGiga * Math.sqrt(alt));
}

export function getCutoffs(age: number, protocol: Protocol): Fib4Cutoffs {
  if (protocol === "hcv") {
    return { low: 1.45, high: 3.25, ageAdjusted: false };
  }
  if (age >= 65) {
    return { low: 2.0, high: 2.67, ageAdjusted: true };
  }
  return { low: 1.3, high: 2.67, ageAdjusted: false };
}

export function interpretFib4(
  labs: Fib4Labs,
  protocol: Protocol,
): Fib4Interpretation {
  const plateletsGiga = plateletsToGiga(labs.platelets, labs.plateletUnit);
  const score = calculateFib4(labs.age, labs.ast, labs.alt, plateletsGiga);
  const cutoffs = getCutoffs(labs.age, protocol);
  const level: RiskLevel =
    score < cutoffs.low
      ? "low"
      : score <= cutoffs.high
        ? "indeterminate"
        : "high";

  return {
    score,
    level,
    label: RISK_COPY[protocol][level].label,
    summary: RISK_COPY[protocol][level].summary,
    nextStep: RISK_COPY[protocol][level].nextStep,
    cutoffs,
    protocol,
    warnings: collectWarnings(labs, plateletsGiga),
  };
}

export function formatScore(score: number): string {
  if (!Number.isFinite(score) || score < 0) return "—";
  if (score >= 100) return score.toFixed(0);
  if (score >= 10) return score.toFixed(1);
  return score.toFixed(2);
}

export function parseLab(raw: string): number | null {
  const trimmed = raw.trim().replace(/,/g, "");
  if (trimmed === "") return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function formatClinicalNote(
  labs: Fib4Labs,
  result: Fib4Interpretation,
  label?: string,
): string {
  const protocolLine = result.cutoffs.ageAdjusted
    ? `${PROTOCOL_LABEL[result.protocol]} · age ≥ 65`
    : PROTOCOL_LABEL[result.protocol];
  const lines = [
    "FIB-4 METAHEALTH360 — liver fibrosis index",
    label?.trim() ? `Label: ${label.trim()}` : null,
    `Score: ${formatScore(result.score)} — ${result.label}`,
    `Protocol: ${protocolLine}`,
    "",
    `Age ${labs.age} years`,
    `AST ${labs.ast} U/L`,
    `ALT ${labs.alt} U/L`,
    `Platelets ${labs.platelets} ${PLATELET_UNIT_LABEL[labs.plateletUnit]}`,
    "",
    result.summary,
    result.nextStep,
    result.warnings.length ? "" : null,
    ...result.warnings,
    "",
    DISCLAIMER,
  ];
  return lines.filter((line): line is string => line !== null).join("\n");
}

const RISK_COPY: Record<
  Protocol,
  Record<RiskLevel, { label: string; summary: string; nextStep: string }>
> = {
  masld: {
    low: {
      label: "Low likelihood",
      summary:
        "Advanced fibrosis is unlikely. Continue cardiometabolic care in clinic.",
      nextStep:
        "Repeat FIB-4 in 1–3 years, or sooner if weight, glycaemia, or alcohol use changes. Treat diabetes, lipids, BP, and weight as usual.",
    },
    indeterminate: {
      label: "Indeterminate",
      summary:
        "FIB-4 cannot rule advanced fibrosis in or out. A second-line fibrosis test is needed.",
      nextStep:
        "Arrange liver stiffness (FibroScan / VCTE) or ELF. LSM < 8 kPa usually allows primary-care follow-up; ≥ 8 kPa warrants hepatology review.",
    },
    high: {
      label: "High likelihood",
      summary:
        "Advanced fibrosis is likely. Do not delay specialist assessment.",
      nextStep:
        "Refer hepatology. Confirm with elastography. If cirrhosis is possible, screen for varices and HCC per local protocol.",
    },
  },
  hcv: {
    low: {
      label: "Unlikely advanced",
      summary:
        "Advanced fibrosis (Ishak 4–6) is unlikely (NPV ~90% at < 1.45 in the original HCV/HIV cohort).",
      nextStep:
        "Treat the virus. Staging with elastography is still reasonable before or after therapy when available.",
    },
    indeterminate: {
      label: "Indeterminate",
      summary:
        "Score sits between the Sterling cut-offs. FIB-4 alone cannot stage fibrosis.",
      nextStep:
        "Obtain liver stiffness measurement or consider biopsy if it will change management.",
    },
    high: {
      label: "Likely advanced",
      summary:
        "Advanced fibrosis is likely (PPV ~65%, specificity ~97% at > 3.25 in the original cohort).",
      nextStep:
        "Refer hepatology. Confirm with elastography. Assess for cirrhosis complications before and after antiviral therapy.",
    },
  },
};

function collectWarnings(labs: Fib4Labs, plateletsGiga: number): string[] {
  const warnings: string[] = [];
  if (labs.age < 18) {
    warnings.push("FIB-4 is not validated in children or adolescents.");
  } else if (labs.age < 35) {
    warnings.push(
      "Accuracy is lower under age 35 — consider elastography rather than relying on FIB-4 alone.",
    );
  }
  if (labs.alt > 300 || labs.ast > 300) {
    warnings.push(
      "Marked transaminase elevation can inflate FIB-4. Recheck after the acute hepatitis settles.",
    );
  }
  if (plateletsGiga < 50) {
    warnings.push(
      "Severe thrombocytopenia. Confirm the count and look for other causes besides fibrosis.",
    );
  }
  if (labs.plateletUnit === "giga" && labs.platelets > 0 && labs.platelets < 20) {
    warnings.push(
      "Typical platelets are 150–450 ×10⁹/L. If the lab reported lakh/cmm, switch the unit.",
    );
  }
  if (labs.plateletUnit === "giga" && labs.platelets >= 2000) {
    warnings.push(
      "This looks like a /μL count. Switch unit to /μL, or enter the ×10⁹/L value (divide by 1,000).",
    );
  }
  return warnings;
}

function trimFloat(value: number, digits: number): string {
  const n = Number(value.toFixed(digits));
  return String(n);
}

export const FORMULA =
  "FIB-4 = (Age × AST) / (Platelets × √ALT)";

export const REFERENCES = [
  {
    cite: "Sterling RK et al. Hepatology. 2006;43:1317–1325.",
    note: "Original FIB-4 in HIV/HCV; cut-offs 1.45 and 3.25.",
  },
  {
    cite: "Shah AG et al. Clin Gastroenterol Hepatol. 2009;7:1104–1112.",
    note: "NAFLD validation; cut-offs 1.30 and 2.67.",
  },
  {
    cite: "McPherson S et al. Am J Gastroenterol. 2017;112:740–751.",
    note: "Age ≥ 65: lower cut-off raised to 2.0 to protect specificity.",
  },
  {
    cite: "EASL–EASD–EASO. J Hepatol. 2024;81:492–542.",
    note: "MASLD CPG: FIB-4 first line, then LSM / ELF if not low-risk.",
  },
];

export interface CutoffBand {
  level: RiskLevel;
  range: string;
  meaning: string;
}

export interface CutoffGuide {
  id: string;
  title: string;
  subtitle: string;
  bands: CutoffBand[];
}

export const CUTOFF_GUIDES: CutoffGuide[] = [
  {
    id: "masld-younger",
    title: "MASLD / NAFLD",
    subtitle: "Age under 65",
    bands: [
      {
        level: "low",
        range: "< 1.30",
        meaning: "Advanced fibrosis unlikely. Repeat in 1–3 years; treat diabetes, lipids, BP, and weight.",
      },
      {
        level: "indeterminate",
        range: "1.30 – 2.67",
        meaning: "Cannot rule fibrosis in or out. Arrange FibroScan / VCTE or ELF.",
      },
      {
        level: "high",
        range: "> 2.67",
        meaning: "Advanced fibrosis likely. Refer hepatology; confirm with elastography.",
      },
    ],
  },
  {
    id: "masld-older",
    title: "MASLD / NAFLD",
    subtitle: "Age 65 and over",
    bands: [
      {
        level: "low",
        range: "< 2.0",
        meaning: "Lower cut-off raised to 2.0 so specificity is not lost in older adults.",
      },
      {
        level: "indeterminate",
        range: "2.0 – 2.67",
        meaning: "Second-line fibrosis test (LSM or ELF) before specialist referral.",
      },
      {
        level: "high",
        range: "> 2.67",
        meaning: "Same high cut-off as younger adults. Refer hepatology.",
      },
    ],
  },
  {
    id: "hcv",
    title: "Viral hepatitis",
    subtitle: "HCV / HIV–HCV · Sterling 2006",
    bands: [
      {
        level: "low",
        range: "< 1.45",
        meaning: "Advanced fibrosis (Ishak 4–6) unlikely (NPV ~90% in the original cohort).",
      },
      {
        level: "indeterminate",
        range: "1.45 – 3.25",
        meaning: "FIB-4 cannot stage. Obtain liver stiffness or biopsy if it changes care.",
      },
      {
        level: "high",
        range: "> 3.25",
        meaning: "Advanced fibrosis likely (specificity ~97%). Refer hepatology.",
      },
    ],
  },
];

export function activeCutoffGuide(
  protocol: Protocol,
  age: number | null,
): CutoffGuide {
  if (protocol === "hcv") {
    return CUTOFF_GUIDES.find((g) => g.id === "hcv") ?? CUTOFF_GUIDES[0];
  }
  if (age != null && age >= 65) {
    return CUTOFF_GUIDES.find((g) => g.id === "masld-older") ?? CUTOFF_GUIDES[0];
  }
  return CUTOFF_GUIDES.find((g) => g.id === "masld-younger") ?? CUTOFF_GUIDES[0];
}

export const USE_WHEN = [
  "Outpatient MASLD / NAFLD risk stratification (first-line, EASL 2024).",
  "Adjunct staging in viral hepatitis when elastography is not immediately available.",
  "Age, AST, ALT, and platelets from a routine chemistry and CBC.",
];

export const DO_NOT_USE = [
  "Children or adolescents (not validated under 18).",
  "Acute hepatitis, extrahepatic cholestasis, or isolated Gilbert syndrome.",
  "As the only test in known cirrhosis follow-up.",
  "To distinguish simple steatosis from steatohepatitis.",
];
