import { StyleSheet, Text, View } from "react-native";
import type { CutoffGuide, RiskLevel } from "../lib/fib4";
import { colors, radius } from "../theme";

const TONE: Record<RiskLevel, { fg: string; bg: string }> = {
  low: { fg: colors.riskLow, bg: colors.riskLowBg },
  indeterminate: { fg: colors.riskMid, bg: colors.riskMidBg },
  high: { fg: colors.riskHigh, bg: colors.riskHighBg },
};

export function CutoffCard({
  guide,
  highlight,
}: {
  guide: CutoffGuide;
  highlight?: RiskLevel;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>{guide.title}</Text>
        <Text style={styles.sub}>{guide.subtitle}</Text>
      </View>
      {guide.bands.map((band) => {
        const tone = TONE[band.level];
        const on = highlight === band.level;
        return (
          <View
            key={band.range}
            style={[styles.row, on && { backgroundColor: colors.surface2 }]}
          >
            <View style={[styles.badge, { backgroundColor: tone.bg }]}>
              <Text style={[styles.badgeText, { color: tone.fg }]}>
                {band.level === "indeterminate" ? "mid" : band.level}
              </Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.range}>{band.range}</Text>
              <Text style={styles.meaning}>{band.meaning}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  title: { color: colors.fg, fontSize: 14, fontWeight: "600", flexShrink: 1 },
  sub: { color: colors.subtle, fontSize: 11 },
  row: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 2,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  body: { flex: 1 },
  range: { color: colors.fg, fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },
  meaning: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 2 },
});
