"use client";

import { get, set, del, keys } from "idb-keyval";
import { HistoryEntry } from "@/types";

const KEY_PREFIX = "image-restore:history:";
const MAX_ENTRIES = 24;

/**
 * Local-only history. Everything lives in the browser's IndexedDB and is
 * never sent to a server. Saving is opt-in per restoration — nothing is
 * stored automatically.
 */
export async function saveHistoryEntry(entry: HistoryEntry): Promise<void> {
  await set(`${KEY_PREFIX}${entry.id}`, entry);
  await trimHistory();
}

export async function getHistoryEntries(): Promise<HistoryEntry[]> {
  const allKeys = (await keys()).filter(
    (k): k is string => typeof k === "string" && k.startsWith(KEY_PREFIX)
  );
  const entries = await Promise.all(allKeys.map((k) => get<HistoryEntry>(k)));
  return entries
    .filter((e): e is HistoryEntry => Boolean(e))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  await del(`${KEY_PREFIX}${id}`);
}

export async function clearHistory(): Promise<void> {
  const allKeys = (await keys()).filter(
    (k): k is string => typeof k === "string" && k.startsWith(KEY_PREFIX)
  );
  await Promise.all(allKeys.map((k) => del(k)));
}

async function trimHistory(): Promise<void> {
  const entries = await getHistoryEntries();
  if (entries.length <= MAX_ENTRIES) return;
  const overflow = entries.slice(MAX_ENTRIES);
  await Promise.all(overflow.map((e) => del(`${KEY_PREFIX}${e.id}`)));
}
