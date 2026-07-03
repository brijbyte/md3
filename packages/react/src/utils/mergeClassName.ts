type ClassNameProp<State> = string | ((state: State) => string | undefined);

/** Prepends our scoped class while preserving Base UI's callback `className` form. */
export function mergeClassName<State>(
  own: string,
  className: ClassNameProp<State> | undefined,
): string | ((state: State) => string) {
  if (typeof className === "function") {
    return (state) => [own, className(state)].filter(Boolean).join(" ");
  }
  return [own, className].filter(Boolean).join(" ");
}
