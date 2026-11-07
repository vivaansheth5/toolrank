/**
 * Inline script that runs while the HTML parses (before first paint).
 * Type flips to text/plain on the client so React doesn't re-run or warn.
 */
export function InlineScript({ html, id }: { html: string; id?: string }) {
  return (
    <script
      id={id}
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
