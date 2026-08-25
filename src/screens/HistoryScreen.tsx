import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import {
  PLATELET_UNIT_LABEL,
  PROTOCOL_LABEL,
  formatScore,
  type RiskLevel,
} from "../lib/fib4";
import { persistHistory, removeHistoryEntry, type HistoryEntry } from "../lib/history";
import { colors, radius } from "../theme";

const TONE: Record<RiskLevel, { fg: string; bg: string }> = {
  low: { fg: colors.riskLow, bg: colors.riskLowBg },
  indeterminate: { fg: colors.riskMid, bg: colors.riskMidBg },
  high: { fg: colors.riskHigh, bg: colors.riskHighBg },
};

interface Props {
  entries: HistoryEntry[];
  onChange: (next: HistoryEntry[]) => void;
  onRestore: (entry: HistoryEntry) => void;
}

export function HistoryScreen({ entries, onChange, onRestore }: Props) {
  function confirmClear() {
    Alert.alert("Clear saved scores?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          onChange([]);
          await persistHistory([]);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  }

  async function removeOne(id: string) {
    const next = removeHistoryEntry(entries, id);
    onChange(next);
    await persistHistory(next);
    Haptics.selectionAsync();
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.head}>
        <Text style={styles.h1}>Saved</Text>
        {entries.length > 0 ? (
          <Pressable onPress={confirmClear} hitSlop={8}>
            <Text style={styles.clear}>Clear</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.lede}>On this phone only. Tap to reopen.</Text>
      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No saved scores yet</Text>
          <Text style={styles.emptyBody}>
            Calculate a FIB-4, then tap Save. Optional initials stay with the score.
          </Text>
        </View>
      ) : (
        entries.map((entry) => {
          const tone = TONE[entry.level];
          const title = entry.label?.trim() || PROTOCOL_LABEL[entry.protocol];
          return (
            <View key={entry.id} style={styles.row}>
              <Pressable style={styles.card} onPress={() => onRestore(entry)}>
                <View style={styles.cardLeft}>
                  <Text style={styles.protocol}>{title}</Text>
                  <Text style={styles.labs}>
                    {entry.label?.trim() ? `${PROTOCOL_LABEL[entry.protocol]} · ` : ""}
                    Age {entry.labs.age} · AST {entry.labs.ast} · ALT {entry.labs.alt}{" "}
                    · Plt {entry.labs.platelets}{" "}
                    {PLATELET_UNIT_LABEL[entry.labs.plateletUnit]}
                  </Text>
                  <Text style={styles.when}>
                    {new Date(entry.savedAt).toLocaleString(undefined, {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={styles.score}>{formatScore(entry.score)}</Text>
                  <View style={[styles.badge, { backgroundColor: tone.bg }]}>
                    <Text style={[styles.badgeText, { color: tone.fg }]}>
                      {entry.level}
                    </Text>
                  </View>
                </View>
              </Pressable>
              <Pressable
                onPress={() => removeOne(entry.id)}
                style={styles.delete}
                hitSlop={6}
                accessibilityLabel="Delete score"
              >
                <Text style={styles.deleteText}>×</Text>
              </Pressable>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 32, gap: 10 },
  head: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  h1: { color: colors.fg, fontSize: 32, fontWeight: "600" },
  lede: { color: colors.muted, fontSize: 14, marginTop: -4, marginBottom: 6 },
  clear: { color: colors.accent, fontSize: 15, fontWeight: "500" },
  empty: { paddingTop: 48, alignItems: "center" },
  emptyTitle: { color: colors.fg, fontSize: 16, fontWeight: "600" },
  emptyBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 280,
  },
  row: { flexDirection: "row", gap: 8, alignItems: "stretch" },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: "row",
    gap: 12,
  },
  cardLeft: { flex: 1 },
  protocol: { color: colors.fg, fontSize: 15, fontWeight: "600" },
  labs: { color: colors.muted, fontSize: 12, marginTop: 4, lineHeight: 18 },
  when: { color: colors.subtle, fontSize: 11, marginTop: 6 },
  cardRight: { alignItems: "flex-end" },
  score: {
    color: colors.fg,
    fontSize: 22,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  badge: {
    marginTop: 6,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: "600" },
  delete: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
  deleteText: { color: colors.subtle, fontSize: 22, lineHeight: 24 },
});
