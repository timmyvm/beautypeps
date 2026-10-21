/*
 * Long article titles read better as a headline and a deck: "What are peptides?" over
 * "A plain-English guide to your skin's messengers". The stored title is never changed.
 */
export function splitTitle(title: string): { head: string; deck: string | null } {
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const colon = title.indexOf(": ");
  if (colon > 0) return { head: title.slice(0, colon), deck: cap(title.slice(colon + 2)) };
  const question = title.indexOf("? ");
  if (question > 0) return { head: title.slice(0, question + 1), deck: cap(title.slice(question + 2)) };
  const withAt = title.indexOf(" with ");
  if (title.length > 56 && withAt > 0) return { head: title.slice(0, withAt), deck: cap(title.slice(withAt + 1)) };
  return { head: title, deck: null };
}
