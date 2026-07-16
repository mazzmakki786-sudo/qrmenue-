export function uid(name: string) {
  // Use random suffix to avoid cross-tab channel conflicts
  const suffix = Math.random().toString(36).substring(2, 8)
  return `${name}-${suffix}`
}
