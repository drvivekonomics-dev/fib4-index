import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export type Tab = "calculate" | "history" | "guide" | "settings";

const ITEMS: { id: Tab; label: string }[] = [
  { id: "calculate", label: "Score" },
  { id: "history", label: "Saved" },
  { id: "guide", label: "Guide" },
  { id: "settings", label: "More" },
];

export function TabBar({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <View style={styles.row}>
      {ITEMS.map((item) => {
        const active = tab === item.id;
        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            style={styles.item}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            {active ? <View style={styles.pip} /> : <View style={styles.pipSpacer} />}
            <TabGlyph name={item.id} active={active} />
            <Text style={[styles.label, active && styles.labelOn]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function TabGlyph({ name, active }: { name: Tab; active: boolean }) {
  const stroke = active ? colors.fg : colors.subtle;
  if (name === "calculate") {
    return (
      <View style={styles.glyph}>
        <View style={[styles.hashV, { backgroundColor: stroke }]} />
        <View style={[styles.hashV, styles.hashV2, { backgroundColor: stroke }]} />
        <View style={[styles.hashH, { backgroundColor: stroke }]} />
        <View style={[styles.hashH, styles.hashH2, { backgroundColor: stroke }]} />
      </View>
    );
  }
  if (name === "history") {
    return (
      <View style={[styles.clock, { borderColor: stroke }]}>
        <View style={[styles.clockHand, { backgroundColor: stroke }]} />
      </View>
    );
  }
  if (name === "guide") {
    return (
      <View style={[styles.book, { borderColor: stroke }]}>
        <View style={[styles.bookSpine, { backgroundColor: stroke }]} />
      </View>
    );
  }
  return (
    <View style={styles.glyph}>
      <View style={[styles.slider, { backgroundColor: stroke }]} />
      <View style={[styles.slider, styles.sliderMid, { backgroundColor: stroke }]} />
      <View style={[styles.slider, { backgroundColor: stroke }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    minHeight: 52,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingTop: 6,
    paddingBottom: 4,
  },
  pip: {
    width: 18,
    height: 3,
    borderRadius: 99,
    backgroundColor: colors.accent,
    marginBottom: 2,
  },
  pipSpacer: { width: 18, height: 3, marginBottom: 2 },
  label: { color: colors.subtle, fontSize: 11, fontWeight: "600" },
  labelOn: { color: colors.fg },
  glyph: { width: 20, height: 20, alignItems: "center", justifyContent: "center" },
  hashV: { position: "absolute", width: 1.6, height: 14, left: 6, borderRadius: 1 },
  hashV2: { left: 12 },
  hashH: { position: "absolute", height: 1.6, width: 14, top: 6, borderRadius: 1 },
  hashH2: { top: 12 },
  clock: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.6,
    alignItems: "center",
  },
  clockHand: { width: 1.5, height: 6, marginTop: 3, borderRadius: 1 },
  book: {
    width: 16,
    height: 18,
    borderWidth: 1.6,
    borderRadius: 2,
    alignItems: "center",
  },
  bookSpine: { width: 1.4, flex: 1, marginVertical: 2 },
  slider: { width: 16, height: 1.6, borderRadius: 1, marginVertical: 1.6 },
  sliderMid: { width: 11 },
});
