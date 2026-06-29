import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} Image Restore. Your photos stay yours.</p>
        <div className="flex gap-6">
          <Link href="/restore" className="hover:text-foreground">Restore</Link>
          <Link href="/history" className="hover:text-foreground">History</Link>
          <Link href="/settings" className="hover:text-foreground">Settings</Link>
        </div>
      </div>
    </footer>
  );
}
