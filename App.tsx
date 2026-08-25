import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { CalculateScreen } from "./src/screens/CalculateScreen";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { GuideScreen } from "./src/screens/GuideScreen";
import { loadHistory, type HistoryEntry } from "./src/lib/history";
import { colors } from "./src/theme";

type Tab = "calculate" | "history" | "guide";

export default function App() {
  const [tab, setTab] = useState<Tab>("calculate");
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    loadHistory().then(setHistory);
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.body}>
          {tab === "calculate" ? (
            <CalculateScreen history={history} onHistoryChange={setHistory} />
          ) : null}
          {tab === "history" ? (
            <HistoryScreen entries={history} onChange={setHistory} />
          ) : null}
          {tab === "guide" ? <GuideScreen /> : null}
        </View>
        <SafeAreaView edges={["bottom"]} style={styles.tabSafe}>
          <View style={styles.tabs}>
            <TabButton
              label="Calculate"
              active={tab === "calculate"}
              onPress={() => {
                setTab("calculate");
                Haptics.selectionAsync();
              }}
            />
            <TabButton
              label="History"
              active={tab === "history"}
              onPress={() => {
                setTab("history");
                Haptics.selectionAsync();
              }}
            />
            <TabButton
              label="Guide"
              active={tab === "guide"}
              onPress={() => {
                setTab("guide");
                Haptics.selectionAsync();
              }}
            />
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.tab}>
      <Text style={[styles.tabLabel, active && styles.tabActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1 },
  tabSafe: {
    backgroundColor: colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  tabs: { flexDirection: "row", minHeight: 52 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center" },
  tabLabel: { color: colors.subtle, fontSize: 13, fontWeight: "600" },
  tabActive: { color: colors.fg },
});
