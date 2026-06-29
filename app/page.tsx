import Link from "next/link";
import { ArrowRight, ShieldCheck, UploadCloud, SlidersHorizontal, Download } from "lucide-react";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { BeforeAfterDemo } from "@/components/landing/before-after-demo";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  { icon: UploadCloud, title: "Upload", description: "Drag in a JPG, PNG, or WEBP — old print scans work great." },
  { icon: SlidersHorizontal, title: "Choose restorations", description: "Auto-restore, or pick denoise, sharpen, color, upscale, and more." },
  { icon: Download, title: "Compare & download", description: "Slide between before/after, then save the full-quality result." },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-grid">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
            <div className="animate-fade-in-up">
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" /> Your photos aren&apos;t stored unless you say so
              </span>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Bring old, blurry,{" "}
                <span className="gradient-text">faded photos</span> back to life
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted-foreground">
                Upload a damaged, noisy, scratched, or low-resolution photo and restore it in seconds —
                denoise, sharpen, fix color, repair scratches, and upscale up to 4x.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/restore" className={buttonClasses("default", "lg")}>
                  Restore a Photo <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#how-it-works" className={buttonClasses("outline", "lg")}>
                  See how it works
                </Link>
              </div>
            </div>

            <div className="animate-fade-in-up">
              <BeforeAfterDemo />
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Illustrative preview — drag the handle to compare
              </p>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Three steps, no account required.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {steps.map((step, i) => (
              <Card key={step.title}>
                <CardContent className="flex flex-col gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-semibold">{i + 1}. {step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight">Restoration tools</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            Mix and match, or let Auto Restore choose for you.
          </p>
          <div className="mt-12">
            <FeatureGrid />
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-20">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold">Privacy by default</h2>
              <p className="max-w-xl text-muted-foreground">
                Your photo is processed in memory for a single request and is never written to a
                database. Recent Restores history lives only in your browser, is opt-in per photo,
                and you can clear it any time.
              </p>
              <Link href="/restore" className={buttonClasses("default", "lg")}>
                Try it now <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}
