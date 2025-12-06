export interface ParsedImagePair {
  thumb: string;
  full: string;
}

/**
 * Stored image strings can be either a single URL or a "thumb|full" pair.
 */
export function parseImagePair(value: string): ParsedImagePair {
  if (!value) return { thumb: "", full: "" };
  const [thumb, full] = value.split("|");
  if (full) {
    return { thumb, full };
  }
  return { thumb: value, full: value };
}
