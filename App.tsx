import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { CalculateScreen } from "./src/screens/CalculateScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { GuideScreen } from "./src/screens/GuideScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { TabBar, type Tab } from "./src/components/TabBar";
import { loadHistory, persistHistory, type HistoryEntry } from "./src/lib/history";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  persistSettings,
  type AppSettings,
} from "./src/lib/settings";
import { colors } from "./src/theme";

export default function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("calculate");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [restore, setRestore] = useState<HistoryEntry | null>(null);
  const onRestored = useCallback(() => setRestore(null), []);

  useEffect(() => {
    Promise.all([loadHistory(), loadSettings()]).then(([entries, prefs]) => {
      setHistory(entries);
      setSettings(prefs);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={styles.boot}>
        <StatusBar style="light" />
      </View>
    );
  }

  if (!settings.acceptedDisclaimer) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.root}>
          <StatusBar style="light" />
          <Onboarding
            onAccept={async () => {
              const next = { ...settings, acceptedDisclaimer: true };
              setSettings(next);
              await persistSettings(next);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.body}>
          {tab === "calculate" ? (
            <CalculateScreen
              history={history}
              onHistoryChange={setHistory}
              settings={settings}
              onSettingsChange={setSettings}
              restore={restore}
              onRestored={onRestored}
            />
          ) : null}
          {tab === "history" ? (
            <HistoryScreen
              entries={history}
              onChange={setHistory}
              onRestore={(entry) => {
                setRestore(entry);
                setTab("calculate");
                Haptics.selectionAsync();
              }}
            />
          ) : null}
          {tab === "guide" ? <GuideScreen /> : null}
          {tab === "settings" ? (
            <SettingsScreen
              settings={settings}
              onSettingsChange={setSettings}
              historyCount={history.length}
              onClearHistory={async () => {
                setHistory([]);
                await persistHistory([]);
              }}
            />
          ) : null}
        </View>
        <SafeAreaView edges={["bottom"]} style={styles.tabSafe}>
          <TabBar
            tab={tab}
            onChange={(next) => {
              setTab(next);
              Haptics.selectionAsync();
            }}
          />
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function Onboarding({ onAccept }: { onAccept: () => void }) {
  return (
    <View style={styles.onboard}>
      <View>
        <Text style={styles.kicker}>Liver fibrosis</Text>
        <Text style={styles.brand}>FIB-4</Text>
        <Text style={styles.lede}>
          Four routine labs. One index. Age-adjusted MASLD and viral hepatitis
          cut-offs for clinic use.
        </Text>
        <View style={styles.points}>
          <Text style={styles.pointTitle}>On this phone</Text>
          <Text style={styles.pointBody}>
            Age, AST, ALT, and platelets never leave the device. No account.
          </Text>
          <Text style={[styles.pointTitle, styles.pointSpaced]}>Triage, not diagnosis</Text>
          <Text style={styles.pointBody}>
            FIB-4 does not replace elastography, biopsy, or clinical judgement.
          </Text>
          <Text style={[styles.pointTitle, styles.pointSpaced]}>For clinicians</Text>
          <Text style={styles.pointBody}>
            Use the matching protocol. Switch platelet units instead of converting by
            hand.
          </Text>
        </View>
      </View>
      <Pressable onPress={onAccept} style={styles.accept}>
        <Text style={styles.acceptText}>I understand</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: colors.bg },
  root: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1 },
  tabSafe: { backgroundColor: colors.bg },
  onboard: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    justifyContent: "space-between",
  },
  kicker: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  brand: { color: colors.fg, fontSize: 48, fontWeight: "600", marginTop: 10 },
  lede: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 14, maxWidth: 340 },
  points: { marginTop: 36, gap: 4 },
  pointTitle: { color: colors.fg, fontSize: 16, fontWeight: "600" },
  pointSpaced: { marginTop: 16 },
  pointBody: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  accept: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  acceptText: { color: colors.primaryFg, fontSize: 16, fontWeight: "600" },
});
