import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { RestoreWorkspace } from "@/components/workspace/restore-workspace";

export const metadata = {
  title: "Restore a Photo — Image Restore",
};

export default function RestorePage() {
  const aiProviderConfigured = Boolean(
    process.env.REPLICATE_API_TOKEN || process.env.STABILITY_API_KEY || process.env.OPENAI_API_KEY
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-3xl font-bold tracking-tight">Restore a Photo</h1>
          <p className="mt-2 text-muted-foreground">
            Upload an image, choose what to fix, and compare before/after.
          </p>
          <div className="mt-8">
            <RestoreWorkspace aiProviderConfigured={aiProviderConfigured} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
