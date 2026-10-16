/** Presentation only: do not change persisted/demo identity values. */
export function availableContact(value?: string | null): string | undefined {
  const text = value?.trim();
  return text && text !== "Not provided (Demo)" ? text : undefined;
}

export function contactDisplay(email?: string | null, phone?: string | null): string {
  return [availableContact(email), availableContact(phone)].filter(Boolean).join(" · ") || "Contact details unavailable";
}
