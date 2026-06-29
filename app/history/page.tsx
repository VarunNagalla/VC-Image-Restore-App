import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { HistoryGrid } from "@/components/workspace/history-grid";

export const metadata = {
  title: "Recent Restores — Image Restore",
};

export default function HistoryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-bold tracking-tight">Recent Restores</h1>
          <p className="mt-2 text-muted-foreground">
            Local only — these never leave your browser unless you download them.
          </p>
          <div className="mt-8">
            <HistoryGrid />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
