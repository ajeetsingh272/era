/*
 * Admin forms edit list content as plain text so non-technical staff can use them:
 *   one item per line, and columns separated by " | ".
 */

export const lines = (text: string): string[] =>
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

/** Parse "a | b | c" rows into tuples of exactly `n` columns (missing columns become ""). */
export function rows(text: string, n: number): string[][] {
  return lines(text).map((l) => {
    const cols = l.split("|").map((c) => c.trim());
    // Extra separators in the last column are kept as part of its text.
    const head = cols.slice(0, n - 1);
    const tail = cols.slice(n - 1).join(" | ");
    const out = [...head, tail];
    while (out.length < n) out.push("");
    return out;
  });
}

export const toLines = (items: string[]): string => items.join("\n");
export const toRows = (items: string[][]): string => items.map((r) => r.join(" | ")).join("\n");

/**
 * Splits a headline into a solid line and an outlined line (the site's display style).
 * "Feel the nature with us" → ["Feel the nature", "with us"]; one word → [word, ""].
 */
export function splitTitle(title: string): [string, string] {
  const parts = title.split("|");
  if (parts.length === 2) return [parts[0].trim(), parts[1].trim()]; // explicit split point
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return [words.join(" "), ""];
  const cut = Math.ceil(words.length / 2);
  return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
