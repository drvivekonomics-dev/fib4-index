import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Segmented } from "../components/Segmented";
import { APP_VERSION, DISCLAIMER, type PlateletUnit, type Protocol } from "../lib/fib4";
import { persistSettings, type AppSettings } from "../lib/settings";
import { colors, radius } from "../theme";

interface Props {
  settings: AppSettings;
  onSettingsChange: (next: AppSettings) => void;
  historyCount: number;
  onClearHistory: () => void;
}

export function SettingsScreen({
  settings,
  onSettingsChange,
  historyCount,
  onClearHistory,
}: Props) {
  const [saved, setSaved] = useState(false);

  async function patch(partial: Partial<AppSettings>) {
    const next = { ...settings, ...partial };
    onSettingsChange(next);
    await persistSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 900);
  }

  function confirmClear() {
    if (historyCount === 0) return;
    Alert.alert("Clear saved scores?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: onClearHistory,
      },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.h1}>More</Text>
      <Text style={styles.lede}>Defaults, privacy, and about.</Text>

      <View style={styles.card}>
        <Text style={styles.kicker}>Defaults</Text>
        <Text style={styles.field}>Protocol</Text>
        <Segmented
          value={settings.protocol}
          onChange={(protocol: Protocol) => patch({ protocol })}
          options={[
            { value: "masld", label: "MASLD / NAFLD" },
            { value: "hcv", label: "Viral hepatitis" },
          ]}
        />
        <Text style={[styles.field, styles.fieldSpaced]}>Platelet unit</Text>
        <Segmented
          value={settings.plateletUnit}
          onChange={(plateletUnit: PlateletUnit) => patch({ plateletUnit })}
          options={[
            { value: "giga", label: "×10⁹/L" },
            { value: "per_ul", label: "/μL" },
            { value: "lakh", label: "Lakh" },
          ]}
        />
        {saved ? <Text style={styles.saved}>Saved</Text> : null}
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Saved scores</Text>
            <Text style={styles.rowHint}>{historyCount} on this phone</Text>
          </View>
          {historyCount > 0 ? (
            <Pressable onPress={confirmClear} hitSlop={8}>
              <Text style={styles.danger}>Clear</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.kicker}>Privacy</Text>
        <Text style={styles.body}>
          Labs and saved scores stay on this phone. Nothing is uploaded. There is no
          account and no cloud backup.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.kicker}>About</Text>
        <Text style={styles.brand}>FIB-4</Text>
        <Text style={styles.body}>Version {APP_VERSION}</Text>
        <Text style={[styles.body, styles.bodySpaced]}>{DISCLAIMER}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 40, gap: 14 },
  h1: { color: colors.fg, fontSize: 32, fontWeight: "600" },
  lede: { color: colors.muted, fontSize: 14, marginTop: -6 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 16,
    gap: 10,
  },
  kicker: {
    color: colors.subtle,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  field: { color: colors.fg, fontSize: 14, fontWeight: "600" },
  fieldSpaced: { marginTop: 8 },
  saved: { color: colors.accent, fontSize: 12, fontWeight: "500" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowTitle: { color: colors.fg, fontSize: 15, fontWeight: "600" },
  rowHint: { color: colors.subtle, fontSize: 12, marginTop: 2 },
  danger: { color: colors.riskHigh, fontSize: 15, fontWeight: "600" },
  body: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  bodySpaced: { marginTop: 4 },
  brand: { color: colors.fg, fontSize: 24, fontWeight: "600" },
});
