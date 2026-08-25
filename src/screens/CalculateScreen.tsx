import { useEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Segmented } from "../components/Segmented";
import { CutoffCard } from "../components/CutoffCard";
import {
  DISCLAIMER,
  FORMULA,
  PLATELET_UNIT_LABEL,
  activeCutoffGuide,
  convertPlatelets,
  formatClinicalNote,
  formatScore,
  interpretFib4,
  parseLab,
  type Fib4Labs,
  type PlateletUnit,
  type Protocol,
  type RiskLevel,
} from "../lib/fib4";
import { prependHistory, persistHistory, type HistoryEntry } from "../lib/history";
import { persistSettings, type AppSettings } from "../lib/settings";
import { colors, radius } from "../theme";

const SAMPLE = { age: "58", ast: "62", alt: "48", platelets: "168" };

const RISK: Record<RiskLevel, { fg: string; bg: string }> = {
  low: { fg: colors.riskLow, bg: colors.riskLowBg },
  indeterminate: { fg: colors.riskMid, bg: colors.riskMidBg },
  high: { fg: colors.riskHigh, bg: colors.riskHighBg },
};

interface Props {
  history: HistoryEntry[];
  onHistoryChange: (next: HistoryEntry[]) => void;
  settings: AppSettings;
  onSettingsChange: (next: AppSettings) => void;
  restore: HistoryEntry | null;
  onRestored: () => void;
}

export function CalculateScreen({
  history,
  onHistoryChange,
  settings,
  onSettingsChange,
  restore,
  onRestored,
}: Props) {
  const [age, setAge] = useState("");
  const [ast, setAst] = useState("");
  const [alt, setAlt] = useState("");
  const [platelets, setPlatelets] = useState("");
  const [label, setLabel] = useState("");
  const [unit, setUnit] = useState<PlateletUnit>(settings.plateletUnit);
  const [protocol, setProtocol] = useState<Protocol>(settings.protocol);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!restore) return;
    setAge(String(restore.labs.age));
    setAst(String(restore.labs.ast));
    setAlt(String(restore.labs.alt));
    setPlatelets(String(restore.labs.platelets));
    setUnit(restore.labs.plateletUnit);
    setProtocol(restore.protocol);
    setLabel(restore.label ?? "");
    onRestored();
  }, [restore, onRestored]);

  const labs = useMemo((): Fib4Labs | null => {
    const a = parseLab(age);
    const s = parseLab(ast);
    const l = parseLab(alt);
    const p = parseLab(platelets);
    if (a == null || s == null || l == null || p == null) return null;
    return { age: a, ast: s, alt: l, platelets: p, plateletUnit: unit };
  }, [age, ast, alt, platelets, unit]);

  const result = labs ? interpretFib4(labs, protocol) : null;

  async function persistPrefs(nextProtocol: Protocol, nextUnit: PlateletUnit) {
    const next = { ...settings, protocol: nextProtocol, plateletUnit: nextUnit };
    onSettingsChange(next);
    await persistSettings(next);
  }

  function changeUnit(next: PlateletUnit) {
    const current = parseLab(platelets);
    if (current != null) {
      const converted = convertPlatelets(current, unit, next);
      if (next === "lakh") setPlatelets(String(Number(converted.toFixed(2))));
      else if (next === "per_ul") setPlatelets(String(Math.round(converted)));
      else setPlatelets(String(Number(converted.toFixed(1))));
    }
    setUnit(next);
    persistPrefs(protocol, next);
    Haptics.selectionAsync();
  }

  async function onSave() {
    if (!labs || !result) return;
    const next = prependHistory(history, {
      labs,
      protocol,
      score: result.score,
      level: result.level,
      label: label.trim() || undefined,
    });
    onHistoryChange(next);
    await persistHistory(next);
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => setSaved(false), 1400);
  }

  async function onShare() {
    if (!labs || !result) return;
    await Share.share({
      message: formatClinicalNote(labs, result, label),
      title: "FIB-4 METAHEALTH360",
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  function onReset() {
    setAge("");
    setAst("");
    setAlt("");
    setPlatelets("");
    setLabel("");
    setCopied(false);
    Haptics.selectionAsync();
  }

  function loadSample() {
    setAge(SAMPLE.age);
    setAst(SAMPLE.ast);
    setAlt(SAMPLE.alt);
    setPlatelets(SAMPLE.platelets);
    setUnit("giga");
    setProtocol("masld");
    setLabel("Sample");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.lockup}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.lockupImg}
            accessibilityLabel=""
          />
          <View>
            <Text style={styles.kicker}>METAHEALTH360</Text>
            <Text style={styles.h1}>FIB-4</Text>
          </View>
        </View>

        <Segmented
          value={protocol}
          onChange={(v) => {
            setProtocol(v);
            persistPrefs(v, unit);
            Haptics.selectionAsync();
          }}
          options={[
            { value: "masld", label: "MASLD / NAFLD" },
            { value: "hcv", label: "Viral hepatitis" },
          ]}
        />

        <View style={styles.card}>
          <LabRow label="Age" hint="Years" value={age} onChange={setAge} pad numeric />
          <LabRow label="AST" hint="U/L" value={ast} onChange={setAst} />
          <LabRow label="ALT" hint="U/L" value={alt} onChange={setAlt} />
          <LabRow
            label="Platelets"
            hint={PLATELET_UNIT_LABEL[unit]}
            value={platelets}
            onChange={setPlatelets}
          />
          <View style={styles.unitBlock}>
            <Text style={styles.unitLabel}>Platelet unit</Text>
            <Segmented
              value={unit}
              onChange={changeUnit}
              options={[
                { value: "giga", label: "×10⁹/L" },
                { value: "per_ul", label: "/μL" },
                { value: "lakh", label: "Lakh" },
              ]}
            />
          </View>
          <LabRow
            label="Label"
            hint="Optional initials"
            value={label}
            onChange={(v) => setLabel(v.slice(0, 24))}
            text
          />
        </View>

        <View style={styles.cardPad}>
          {result ? (
            <>
              <Text style={styles.scoreLabel}>FIB-4 score</Text>
              <Text style={styles.score}>{formatScore(result.score)}</Text>
              <View style={[styles.pill, { backgroundColor: RISK[result.level].bg }]}>
                <Text style={[styles.pillText, { color: RISK[result.level].fg }]}>
                  {result.label}
                </Text>
              </View>
              <RiskBar
                score={result.score}
                low={result.cutoffs.low}
                high={result.cutoffs.high}
              />
              <Text style={styles.cutoffNote}>
                {protocol === "masld"
                  ? result.cutoffs.ageAdjusted
                    ? "Age ≥ 65 — lower cut-off raised to 2.0"
                    : "MASLD thresholds 1.30 / 2.67"
                  : "Sterling 2006 thresholds 1.45 / 3.25"}
              </Text>
              <Text style={styles.summary}>{result.summary}</Text>
              <Text style={styles.next}>{result.nextStep}</Text>
              {result.warnings.map((w) => (
                <Text key={w} style={styles.warn}>
                  {w}
                </Text>
              ))}
              <CutoffCard
                guide={activeCutoffGuide(protocol, labs?.age ?? null)}
                highlight={result.level}
              />
            </>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.scoreLabel}>Formula</Text>
              <Text style={styles.formula}>{FORMULA}</Text>
              <Text style={styles.next}>
                Enter all four labs. The score updates as you type.
              </Text>
              <Pressable onPress={loadSample} style={styles.sample}>
                <Text style={styles.sampleText}>Load sample labs</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <Pressable onPress={onReset} style={[styles.btn, styles.btnGhost]}>
            <Text style={styles.btnGhostText}>Reset</Text>
          </Pressable>
          <Pressable
            onPress={onShare}
            disabled={!result}
            style={[styles.btn, styles.btnGhost, !result && styles.disabled]}
          >
            <Text style={styles.btnGhostText}>{copied ? "Shared" : "Share"}</Text>
          </Pressable>
          <Pressable
            onPress={onSave}
            disabled={!result}
            style={[styles.btn, styles.btnPrimary, !result && styles.disabled]}
          >
            <Text style={styles.btnPrimaryText}>{saved ? "Saved" : "Save"}</Text>
          </Pressable>
        </View>
        <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function LabRow({
  label,
  hint,
  value,
  onChange,
  pad,
  numeric,
  text,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  pad?: boolean;
  numeric?: boolean;
  text?: boolean;
}) {
  return (
    <View style={[styles.labRow, pad && styles.labFirst]}>
      <View>
        <Text style={styles.labLabel}>{label}</Text>
        <Text style={styles.labHint}>{hint}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={(t) => onChange(text ? t : t.replace(/[^\d.,]/g, ""))}
        keyboardType={text ? "default" : "decimal-pad"}
        placeholder="—"
        placeholderTextColor={colors.subtle}
        style={styles.input}
        autoCorrect={false}
        returnKeyType="next"
        maxLength={text ? 24 : numeric ? 3 : 8}
      />
    </View>
  );
}

function RiskBar({
  score,
  low,
  high,
}: {
  score: number;
  low: number;
  high: number;
}) {
  const max = 4;
  const marker = Math.min(Math.max(score / max, 0), 1);
  return (
    <View style={styles.meterWrap}>
      <View style={styles.meter}>
        <View style={[styles.seg, { flex: low, backgroundColor: colors.riskLow }]} />
        <View
          style={[styles.seg, { flex: high - low, backgroundColor: colors.riskMid }]}
        />
        <View style={[styles.seg, { flex: max - high, backgroundColor: colors.riskHigh }]} />
        <View style={[styles.dot, { left: `${marker * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 28, gap: 14 },
  kicker: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  lockup: { flexDirection: "row", alignItems: "center", gap: 12 },
  lockupImg: { width: 56, height: 56, borderRadius: 12 },
  h1: { color: colors.fg, fontSize: 36, fontWeight: "600" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: "hidden",
  },
  cardPad: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 18,
    gap: 10,
  },
  labRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  labFirst: { borderTopWidth: 0 },
  labLabel: { color: colors.fg, fontSize: 15, fontWeight: "500" },
  labHint: { color: colors.subtle, fontSize: 11, marginTop: 1 },
  input: {
    minWidth: 90,
    color: colors.fg,
    fontSize: 18,
    fontWeight: "500",
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
  unitBlock: {
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  unitLabel: {
    color: colors.subtle,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 4,
  },
  scoreLabel: {
    color: colors.subtle,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
  },
  score: {
    color: colors.fg,
    fontSize: 56,
    fontWeight: "600",
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
  pill: {
    alignSelf: "center",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  pillText: { fontSize: 13, fontWeight: "600" },
  cutoffNote: { color: colors.subtle, fontSize: 11, textAlign: "center" },
  summary: { color: colors.fg, fontSize: 14, lineHeight: 20 },
  next: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  warn: {
    color: colors.riskMid,
    backgroundColor: colors.riskMidBg,
    borderRadius: radius.md,
    padding: 10,
    fontSize: 12,
    lineHeight: 18,
    overflow: "hidden",
  },
  empty: { alignItems: "center", gap: 8, paddingVertical: 8 },
  formula: { color: colors.fg, fontSize: 18, textAlign: "center", lineHeight: 26 },
  sample: {
    marginTop: 6,
    backgroundColor: colors.surface2,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sampleText: { color: colors.fg, fontSize: 13, fontWeight: "500" },
  actions: { flexDirection: "row", gap: 8 },
  btn: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhost: { backgroundColor: colors.surface2 },
  btnGhostText: { color: colors.fg, fontWeight: "600" },
  btnPrimary: { backgroundColor: colors.primary },
  btnPrimaryText: { color: colors.primaryFg, fontWeight: "600" },
  disabled: { opacity: 0.4 },
  disclaimer: {
    color: colors.subtle,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
  meterWrap: { paddingVertical: 6 },
  meter: {
    height: 10,
    borderRadius: 999,
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: colors.surface2,
  },
  seg: { height: "100%" },
  dot: {
    position: "absolute",
    top: -3,
    width: 16,
    height: 16,
    marginLeft: -8,
    borderRadius: 8,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.surface,
  },
});
