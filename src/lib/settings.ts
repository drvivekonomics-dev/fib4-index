import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PlateletUnit, Protocol } from "./fib4";

const KEY = "fib4.settings.v2";

export interface AppSettings {
  protocol: Protocol;
  plateletUnit: PlateletUnit;
  acceptedDisclaimer: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  protocol: "masld",
  plateletUnit: "giga",
  acceptedDisclaimer: false,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return {
      protocol: parsed.protocol === "hcv" ? "hcv" : "masld",
      plateletUnit:
        parsed.plateletUnit === "per_ul" || parsed.plateletUnit === "lakh"
          ? parsed.plateletUnit
          : "giga",
      acceptedDisclaimer: parsed.acceptedDisclaimer === true,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function persistSettings(next: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}
