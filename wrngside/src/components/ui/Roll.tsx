/** Letter roll for text links: each letter slides up and is replaced by its copy (30ms stagger). */
export function Roll({ text }: { text: string }) {
  return (
    <span className="roll" aria-hidden="true">
      {text.split("").map((ch, i) => (
        <span key={i} className="roll-ch" data-ch={ch} style={{ "--i": i } as React.CSSProperties}>
          {ch}
        </span>
      ))}
    </span>
  );
}

/** Accessible wrapper: visually rolled letters, plain text for assistive tech. */
export function RollLabel({ text }: { text: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <Roll text={text} />
    </>
  );
}
