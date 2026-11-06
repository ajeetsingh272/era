/**
 * Renders admin-entered plain text: a blank line starts a new paragraph,
 * lines starting with "- " become a bullet list. No HTML is interpreted.
 */
export function Prose({ text, from = 0 }: { text: string; from?: number }) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((b, i) => {
        const style = { "--d": from + i } as React.CSSProperties;
        const rows = b.split("\n").map((l) => l.trim());
        if (rows.every((l) => l.startsWith("- "))) {
          return <ul key={i} className="list rv" style={style}>{rows.map((l, k) => <li key={k}>{l.slice(2)}</li>)}</ul>;
        }
        return <p key={i} className="rv" style={style}>{rows.map((l, k) => <span key={k}>{k > 0 && <br />}{l}</span>)}</p>;
      })}
    </>
  );
}
