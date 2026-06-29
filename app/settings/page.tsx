import { ShieldCheck, KeyRound, Cpu } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Settings — Image Restore",
};

const providers = [
  { key: "REPLICATE_API_TOKEN", name: "Replicate", note: "Run open-source restoration/upscaling models." },
  { key: "STABILITY_API_KEY", name: "Stability AI", note: "Image-to-image upscaling & enhancement." },
  { key: "OPENAI_API_KEY", name: "OpenAI", note: "Reserved for future image tooling." },
];

export default function SettingsPage() {
  const active = providers.find((p) => Boolean(process.env[p.key]));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-2 text-muted-foreground">Current engine and how to connect a real AI provider.</p>

          <Card className="mt-8">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Active engine</h2>
              </div>
              {active ? (
                <p className="text-sm">
                  <Badge variant="success">{active.name}</Badge> is configured via <code>{active.key}</code>.
                  Note: provider integrations are stubbed in this build — see{" "}
                  <code>lib/image-processing/providers/</code> to finish wiring the API calls.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  <Badge>Standard Engine</Badge> — classical image processing (denoise, sharpen, normalize,
                  high-quality resize) via <code>sharp</code>. This is <strong>not</strong> an AI model. It&apos;s
                  clearly labeled as such throughout the app.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Connect an AI provider</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Copy <code>.env.example</code> to <code>.env.local</code> and set one of the keys below, then
                implement the matching provider class so it performs a real API call.
              </p>
              <div className="space-y-2">
                {providers.map((p) => (
                  <div key={p.key} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.note}</p>
                    </div>
                    <code className="text-xs text-muted-foreground">{p.key}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="flex gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                Whichever engine is active, uploaded images are only ever held in memory for the duration of
                a single request. Nothing is written to a database. Local history is opt-in and stored only
                in your browser.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
