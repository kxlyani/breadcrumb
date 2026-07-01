export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function generateUniqueSlug(name: string): string {
  const base = slugify(name)
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${base}-${suffix}`
}

export * from './slug'
export * from './stack-trace-parser'