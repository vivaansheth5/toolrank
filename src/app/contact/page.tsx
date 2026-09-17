import type { Metadata } from "next";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the ToolDhundho.com team.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Contact us</h1>
      <p className="mt-4 max-w-xl text-foreground/80">
        Spotted an issue, have a tool suggestion, or interested in listing your product on ToolDhundho.com?
        We&apos;d like to hear from you.
      </p>

      <div className="mt-8 flex items-center gap-3 rounded-2xl border border-border bg-surface p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Mail size={18} />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Email</p>
          <p className="text-sm text-muted">hello@tooldhundho.com</p>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted">
        This is a sample contact address for the product preview. Replace it with a real inbox before launch.
      </p>
    </div>
  );
}
