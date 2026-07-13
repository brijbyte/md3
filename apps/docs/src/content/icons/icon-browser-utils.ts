// Pure helpers for the icon browser, split out so they can be unit-tested without
// the browser/DOM. See IconBrowser.tsx for how they're used.

/** Normalize a raw search box value to the token used for matching. Icon names only
 *  contain [a-z0-9_], so anything else is dropped (spaces, punctuation, accents). */
export function searchToken(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "");
}

/** Does an icon match the current token? Empty token matches everything. */
export function matchesToken(name: string, pascal: string, token: string): boolean {
  return !token || name.includes(token) || pascal.toLowerCase().includes(token);
}

/** The copyable references for one icon in the active style×fill variant. `pascal` is
 *  the base component name (already Icon-prefixed for digit-leading names); the filled
 *  variant just appends `Fill`. */
export function iconRefs(name: string, pascal: string, style: string, fill: boolean) {
  const component = fill ? `${pascal}Fill` : pascal;
  const path = `@brijbyte/md3-icons/${style}/${component}`;
  return { name, component, path, importLine: `import ${component} from "${path}";` };
}
