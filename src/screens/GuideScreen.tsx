import { ScrollView, StyleSheet, Text, View } from "react-native";
import { CutoffCard } from "../components/CutoffCard";
import {
  CUTOFF_GUIDES,
  DO_NOT_USE,
  FORMULA,
  REFERENCES,
  USE_WHEN,
} from "../lib/fib4";
import { colors, radius } from "../theme";

export function GuideScreen() {
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.h1}>Guide</Text>
      <Text style={styles.lede}>
        FIB-4 estimates the likelihood of advanced liver fibrosis from four routine
        values. Triage only — not a diagnosis.
      </Text>

      <View style={styles.card}>
        <Text style={styles.kicker}>Formula</Text>
        <Text style={styles.formula}>{FORMULA}</Text>
        <Text style={styles.body}>
          Age in years. AST and ALT in U/L. Platelets in ×10⁹/L (same number as
          ×10³/μL). Indian labs often report lakh/cmm — switch the unit instead of
          converting by hand.
        </Text>
      </View>

      <Text style={styles.h2}>Use when</Text>
      {USE_WHEN.map((item) => (
        <Text key={item} style={styles.bullet}>
          {`\u2022  ${item}`}
        </Text>
      ))}

      <Text style={styles.h2}>Do not use when</Text>
      {DO_NOT_USE.map((item) => (
        <Text key={item} style={styles.bullet}>
          {`\u2022  ${item}`}
        </Text>
      ))}

      <Text style={styles.h2}>All cut-offs</Text>
      {CUTOFF_GUIDES.map((guide) => (
        <CutoffCard key={guide.id} guide={guide} />
      ))}

      <Text style={styles.h2}>References</Text>
      {REFERENCES.map((ref) => (
        <View key={ref.cite} style={styles.ref}>
          <Text style={styles.cite}>{ref.cite}</Text>
          <Text style={styles.note}>{ref.note}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40, gap: 10 },
  h1: { color: colors.fg, fontSize: 32, fontWeight: "600" },
  lede: { color: colors.muted, fontSize: 14, lineHeight: 21, marginBottom: 6 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    gap: 8,
  },
  kicker: {
    color: colors.subtle,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  formula: { color: colors.fg, fontSize: 18, lineHeight: 26 },
  body: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  h2: {
    color: colors.fg,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 2,
  },
  bullet: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  ref: { marginBottom: 8 },
  cite: { color: colors.fg, fontSize: 12, lineHeight: 18 },
  note: { color: colors.muted, fontSize: 12, lineHeight: 18 },
});
