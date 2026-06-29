"use client";

import * as React from "react";
import { Trash2, ImageOff, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HistoryEntry } from "@/types";
import { clearHistory, deleteHistoryEntry, getHistoryEntries } from "@/lib/storage/history-store";
import { formatRelativeTime } from "@/lib/utils/format";
import { CompareSlider } from "./compare-slider";

export function HistoryGrid() {
  const [entries, setEntries] = React.useState<HistoryEntry[] | null>(null);

  const load = React.useCallback(async () => {
    const data = await getHistoryEntries();
    setEntries(data);
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    await deleteHistoryEntry(id);
    load();
  }

  async function handleClearAll() {
    await clearHistory();
    load();
  }

  if (entries === null) {
    return <p className="text-sm text-muted-foreground">Loading your local history…</p>;
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <ImageOff className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No saved restores yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Restore a photo and choose “Save to History” to see it here. Everything stays in this browser only.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4" /> Stored only in this browser
        </p>
        <Button variant="outline" size="sm" onClick={handleClearAll}>
          <Trash2 className="h-4 w-4" /> Clear all
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="space-y-3">
              <CompareSlider
                before={
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={entry.originalThumbnail} alt="Original" className="h-full w-full object-cover" />
                }
                after={
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={entry.restoredThumbnail} alt="Restored" className="h-full w-full object-cover" />
                }
                className="aspect-[4/3]"
              />
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline">{formatRelativeTime(entry.createdAt)}</Badge>
                  <Badge variant="outline">{entry.engine === "algorithmic-v1" ? "Standard Engine" : entry.engine}</Badge>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)} aria-label="Delete entry">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
