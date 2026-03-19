export function sanitizeText(value: string) {
  return value.trim().replace(/[<>]/g, "");
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
