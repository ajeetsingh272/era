import { splitTitle } from "@/lib/text-lists";

const d = (n: number) => ({ "--d": n }) as React.CSSProperties;

/** Two-line display headline: first half solid, second half outlined. */
export function Headline({ text, as: Tag = "h2", className = "" }: { text: string; as?: "h1" | "h2"; className?: string }) {
  const [solid, outline] = splitTitle(text);
  return (
    <Tag className={`ttl ${className}`.trim()}>
      <span className="sol">{solid}</span>
      {outline && <> <span className="ol">{outline}</span></>}
    </Tag>
  );
}

/** Numbered section heading: big outlined number, accent line, small label, optional title. */
export function SectionHead({ num, label, title, center = true }: { num?: number; label: string; title?: string; center?: boolean }) {
  return (
    <div className={`sh rv${center ? " c" : ""}`}>
      {num !== undefined && <span className="num" aria-hidden="true">{String(num).padStart(2, "0")}</span>}
      <p className="lbl">{label}</p>
      {title && <h2 className="h2" style={d(1)}>{title}</h2>}
    </div>
  );
}
