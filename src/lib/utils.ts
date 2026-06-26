/**
 * Utility functions for the LegacyX frontend.
 */

/**
 * Combines multiple CSS class names into a single string.
 */
export function cn(...inputs: (string | undefined | null | boolean | { [key: string]: boolean })[]): string {
  const classes: string[] = [];
  
  for (const input of inputs) {
    if (!input) continue;
    
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) {
          classes.push(key);
        }
      }
    }
  }
  
  return classes.join(' ');
}

/**
 * Formats a raw number as a localized currency/token quantity.
 */
export function formatAmount(amount: number, minimumFractionDigits = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits: 6
  }).format(amount);
}

/**
 * Formats an ISO date string into a readable format.
 * E.g., Jun 24, 2026, 9:58 PM
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Returns a friendly remaining time duration text.
 */
export function getRemainingDaysText(isoString: string): string {
  const diffTime = new Date(isoString).getTime() - Date.now();
  if (diffTime <= 0) return "Expired / Claimable";
  
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return "1 day left";
  return `${diffDays} days left`;
}
