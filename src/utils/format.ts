/**
 * Formats math expressions with styled typography and spacing
 */
export function formatDisplayExpression(expr: string): string {
  if (!expr) return '0';

  return expr
    .replace(/\*/g, ' × ')
    .replace(/\//g, ' ÷ ')
    .replace(/\+/g, ' + ')
    .replace(/-(?=[0-9a-zA-Z(])/g, ' − ')
    .replace(/\^/g, ' ^ ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Format timestamp to readable time string
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

