import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Fib4Labs, Protocol, RiskLevel } from "./fib4";

const STORAGE_KEY = "fib4.history.v1";
const MAX_ENTRIES = 40;

export interface HistoryEntry {
  id: string;
  savedAt: number;
  labs: Fib4Labs;
  protocol: Protocol;
  score: number;
  level: RiskLevel;
  label?: string;
}

export async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isEntry);
  } catch {
    return [];
  }
}

export async function persistHistory(entries: HistoryEntry[]): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(entries.slice(0, MAX_ENTRIES)),
  );
}

export function prependHistory(
  current: HistoryEntry[],
  next: Omit<HistoryEntry, "id" | "savedAt">,
): HistoryEntry[] {
  const entry: HistoryEntry = {
    ...next,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: Date.now(),
  };
  const withoutDup = current.filter((item) => !sameSnapshot(item, entry));
  return [entry, ...withoutDup].slice(0, MAX_ENTRIES);
}

export function removeHistoryEntry(
  current: HistoryEntry[],
  id: string,
): HistoryEntry[] {
  return current.filter((item) => item.id !== id);
}

function sameSnapshot(
  a: HistoryEntry,
  b: Omit<HistoryEntry, "id" | "savedAt">,
): boolean {
  return (
    a.protocol === b.protocol &&
    a.score === b.score &&
    (a.label ?? "") === (b.label ?? "") &&
    a.labs.age === b.labs.age &&
    a.labs.ast === b.labs.ast &&
    a.labs.alt === b.labs.alt &&
    a.labs.platelets === b.labs.platelets &&
    a.labs.plateletUnit === b.labs.plateletUnit
  );
}

function isEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== "object") return false;
  const v = value as HistoryEntry;
  return (
    typeof v.id === "string" &&
    typeof v.savedAt === "number" &&
    typeof v.score === "number" &&
    (v.level === "low" || v.level === "indeterminate" || v.level === "high") &&
    (v.protocol === "masld" || v.protocol === "hcv") &&
    !!v.labs &&
    typeof v.labs.age === "number"
  );
}
